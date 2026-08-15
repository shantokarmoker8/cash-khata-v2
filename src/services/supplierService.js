// src/services/supplierService.js
import {
  addDoc,
  collection,
  doc,
  getDocs,
  runTransaction,
  writeBatch,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { suppliersCol, purchasesCol, SETTINGS_DOC_ID } from "../firebase/firestoreRefs";

const settingsDocRef = doc(db, "settings", SETTINGS_DOC_ID);
const supplierPaymentsCol = collection(db, "supplier_payments");

export function subscribeToSuppliers(callback) {
  return onSnapshot(suppliersCol, (snapshot) => {
    const rows = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    rows.sort((a, b) => {
      if (Number(b.due) !== Number(a.due)) return Number(b.due) - Number(a.due);
      return (a.name || "").localeCompare(b.name || "");
    });
    callback(rows);
  });
}

export function filterSuppliers(suppliers, search) {
  const term = search.trim().toLowerCase();
  if (!term) return suppliers;
  return suppliers.filter(
    (s) =>
      (s.name || "").toLowerCase().includes(term) ||
      (s.mobile || "").toLowerCase().includes(term)
  );
}

export async function addSupplier({ name, mobile, address }) {
  const trimmedName = name.trim();
  const trimmedMobile = mobile.trim();

  if (!trimmedName || !trimmedMobile) {
    throw new Error("Name and Mobile Number are required");
  }

  const docRef = await addDoc(suppliersCol, {
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

export async function deleteSupplier(supplierId) {
  const supplierRef = doc(db, "suppliers", supplierId);
  const supplierSnap = await getDocs(query(suppliersCol, where("__name__", "==", supplierId)));

  if (supplierSnap.empty) {
    throw new Error("Supplier not found");
  }
  if (Number(supplierSnap.docs[0].data().due) > 0) {
    throw new Error("Cannot delete supplier with pending due. Clear due first.");
  }

  const batch = writeBatch(db);

  const relatedPurchasesQ = query(purchasesCol, where("supplier_id", "==", supplierId));
  const relatedPurchasesSnap = await getDocs(relatedPurchasesQ);
  relatedPurchasesSnap.forEach((purchaseDoc) => {
    batch.update(purchaseDoc.ref, { supplier_id: null });
  });

  batch.delete(supplierRef);
  await batch.commit();
}

/**
 * Supplier কে Payment দেওয়া — supplier due কমে, cash_balance কমে (cash যথেষ্ট
 * আছে কিনা চেক করা হয়, না থাকলে reject)
 */
export async function makeSupplierPayment({ supplierId, amount, createdBy }) {
  const numericAmount = Number(amount);
  if (numericAmount <= 0) {
    throw new Error("Amount must be greater than 0");
  }

  const supplierRef = doc(db, "suppliers", supplierId);
  const paymentLogRef = doc(supplierPaymentsCol);

  const newCashBalance = await runTransaction(db, async (transaction) => {
    const supplierSnap = await transaction.get(supplierRef);
    if (!supplierSnap.exists()) throw new Error("Supplier not found");

    const currentDue = Number(supplierSnap.data().due) || 0;
    if (numericAmount > currentDue) {
      throw new Error("Payment amount cannot exceed Supplier Due");
    }

    const settingsSnap = await transaction.get(settingsDocRef);
    const currentCash = settingsSnap.exists() ? Number(settingsSnap.data().cash_balance) || 0 : 0;

    if (numericAmount > currentCash) {
      throw new Error("Insufficient Cash Balance");
    }

    const updatedCash = currentCash - numericAmount;

    transaction.update(supplierRef, { due: currentDue - numericAmount });
    transaction.update(settingsDocRef, {
      cash_balance: updatedCash,
      updated_at: new Date().toISOString(),
    });
    transaction.set(paymentLogRef, {
      supplier_id: supplierId,
      amount: numericAmount,
      created_by: createdBy || null,
      created_at: new Date().toISOString(),
    });

    return updatedCash;
  });

  return newCashBalance;
}