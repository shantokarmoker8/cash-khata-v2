// src/services/customerService.js
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  runTransaction,
  writeBatch,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { customersCol, salesCol, SETTINGS_DOC_ID } from "../firebase/firestoreRefs";

const settingsDocRef = doc(db, "settings", SETTINGS_DOC_ID);
const customerPaymentsCol = collection(db, "customer_payments");

/**
 * সব customer realtime subscribe করা হয় — search/sort ক্লায়েন্ট সাইডে করা হবে,
 * কারণ Firestore তে case-insensitive LIKE সার্চ নেই। কাস্টমার সংখ্যা সাধারণত
 * কয়েকশোর বেশি হয় না বলে এটাই সবচেয়ে practical approach।
 */
export function subscribeToCustomers(callback) {
  return onSnapshot(customersCol, (snapshot) => {
    const rows = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    // due DESC, name ASC — PHP এর ORDER BY due DESC, name ASC এর সমতুল্য
    rows.sort((a, b) => {
      if (Number(b.due) !== Number(a.due)) return Number(b.due) - Number(a.due);
      return (a.name || "").localeCompare(b.name || "");
    });
    callback(rows);
  });
}

/**
 * ক্লায়েন্ট সাইড সার্চ ফিল্টার — name বা mobile এ ম্যাচ করলে
 */
export function filterCustomers(customers, search) {
  const term = search.trim().toLowerCase();
  if (!term) return customers;
  return customers.filter(
    (c) =>
      (c.name || "").toLowerCase().includes(term) ||
      (c.mobile || "").toLowerCase().includes(term)
  );
}

export async function addCustomer({ name, mobile, address }) {
  const trimmedName = name.trim();
  const trimmedMobile = mobile.trim();

  if (!trimmedName || !trimmedMobile) {
    throw new Error("Name and Mobile Number are required");
  }

  const docRef = await addDoc(customersCol, {
    name: trimmedName,
    mobile: trimmedMobile,
    address: address?.trim() || "",
    due: 0,
    created_at: new Date().toISOString(),
  });

  return {
    id: docRef.id,
    name: trimmedName,
    mobile: trimmedMobile,
    address: address?.trim() || "",
    due: 0,
  };
}

export async function deleteCustomer(customerId) {
  const customerRef = doc(db, "customers", customerId);
  const customerSnap = await getDocs(query(customersCol, where("__name__", "==", customerId)));

  if (customerSnap.empty) {
    throw new Error("Customer not found");
  }
  if (Number(customerSnap.docs[0].data().due) > 0) {
    throw new Error("Cannot delete customer with pending due. Clear due first.");
  }

  const batch = writeBatch(db);

  // এই customer এর sales রেকর্ডগুলো থেকে customer_id null করে দেওয়া হয় (orphan reference বাদ)
  const relatedSalesQ = query(salesCol, where("customer_id", "==", customerId));
  const relatedSalesSnap = await getDocs(relatedSalesQ);
  relatedSalesSnap.forEach((saleDoc) => {
    batch.update(saleDoc.ref, { customer_id: null });
  });

  batch.delete(customerRef);
  await batch.commit();
}

/**
 * Payment গ্রহণ — customer এর due কমানো + cash_balance বাড়ানো, একটা atomic
 * transaction এ (PHP এর beginTransaction()/commit() এর সমতুল্য)। payment log
 * transaction কমিট হওয়ার পরে আলাদাভাবে লেখা হয় (Firestore transaction এর
 * ভেতরে addDoc সরাসরি সাপোর্ট করে না, শুধু transaction.set() করে নির্দিষ্ট ref এ লেখা যায়)।
 */
export async function receiveCustomerPayment({ customerId, amount, createdBy }) {
  const numericAmount = Number(amount);
  if (numericAmount <= 0) {
    throw new Error("Amount must be greater than 0");
  }

  const customerRef = doc(db, "customers", customerId);
  const paymentLogRef = doc(customerPaymentsCol);

  const newCashBalance = await runTransaction(db, async (transaction) => {
    const customerSnap = await transaction.get(customerRef);
    if (!customerSnap.exists()) throw new Error("Customer not found");

    const currentDue = Number(customerSnap.data().due) || 0;
    if (numericAmount > currentDue) {
      throw new Error("Payment amount cannot exceed Customer Due");
    }

    const settingsSnap = await transaction.get(settingsDocRef);
    const currentCash = settingsSnap.exists() ? Number(settingsSnap.data().cash_balance) || 0 : 0;
    const updatedCash = currentCash + numericAmount;

    transaction.update(customerRef, { due: currentDue - numericAmount });
    transaction.update(settingsDocRef, {
      cash_balance: updatedCash,
      updated_at: new Date().toISOString(),
    });
    transaction.set(paymentLogRef, {
      customer_id: customerId,
      amount: numericAmount,
      created_by: createdBy || null,
      created_at: new Date().toISOString(),
    });

    return updatedCash;
  });

  return newCashBalance;
}