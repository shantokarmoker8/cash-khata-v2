// src/services/purchaseService.js
import { doc, onSnapshot, orderBy, query, runTransaction, getDocs, where } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { purchasesCol, SETTINGS_DOC_ID } from "../firebase/firestoreRefs";
import { productsCol } from "./productService";

const settingsDocRef = doc(db, "settings", SETTINGS_DOC_ID);
const LOW_STOCK_ALERT_DEFAULT = 5;

export function subscribeToPurchases(callback) {
  const q = query(purchasesCol, orderBy("created_at", "desc"));
  return onSnapshot(q, (snapshot) => {
    const rows = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(rows);
  });
}

export function filterPurchases(purchases, search) {
  const term = search.trim().toLowerCase();
  if (!term) return purchases;
  return purchases.filter(
    (p) =>
      (p.product_name || "").toLowerCase().includes(term) ||
      (p.supplier_name || "").toLowerCase().includes(term)
  );
}

/**
 * Purchase তৈরি — একই নামের প্রোডাক্ট থাকলে (case-insensitive) সেটাতে stock যোগ
 * হবে (restock), না থাকলে নতুন product তৈরি হবে। Cash Balance কমবে, Supplier Due বাড়বে —
 * সবকিছু একটা atomic transaction এ (PHP এর beginTransaction()/commit() এর সমতুল্য)।
 */
export async function createPurchase({
  productName,
  description,
  purchasePrice,
  salePrice,
  quantity,
  supplierId,
  supplierName,
  paidAmount,
}) {
  const trimmedName = productName.trim();
  const qty = Number(quantity);
  const pPrice = Number(purchasePrice);
  const sPrice = Number(salePrice);
  const paid = Number(paidAmount) || 0;

  if (!trimmedName) throw new Error("Product Name is required");
  if (qty <= 0) throw new Error("Quantity must be greater than 0");
  if (pPrice <= 0) throw new Error("Purchase Price must be greater than 0");
  if (sPrice <= 0) throw new Error("Sale Price must be greater than 0");
  if (paid < 0) throw new Error("Pay Amount cannot be negative");

  const totalAmount = pPrice * qty;
  if (paid > totalAmount) throw new Error("Pay Amount cannot exceed Total Amount");

  const dueAmount = totalAmount - paid;
  if (dueAmount > 0 && !supplierId) {
    throw new Error("Supplier is required when there is a Due amount");
  }
  const paymentType = dueAmount <= 0 ? "cash" : "due";

  // ============ Auto-detect same-name product (case-insensitive) ============
  // Firestore এ সরাসরি LOWER() query নেই, তাই একটা lowercase field রাখা হয়
  // (name_lower) — এই ফিল্ডটা প্রতিটা product save করার সময় সাথে সেভ হবে।
  const matchQ = query(productsCol, where("name_lower", "==", trimmedName.toLowerCase()));
  const matchSnap = await getDocs(matchQ);
  const existingProductDoc = matchSnap.empty ? null : matchSnap.docs[0];

  const productRef = existingProductDoc ? existingProductDoc.ref : doc(productsCol);
  const purchaseRef = doc(purchasesCol);
  const supplierRef = supplierId ? doc(db, "suppliers", supplierId) : null;

  const result = await runTransaction(db, async (transaction) => {
    const settingsSnap = await transaction.get(settingsDocRef);
    const currentCash = settingsSnap.exists() ? Number(settingsSnap.data().cash_balance) || 0 : 0;

    if (paid > currentCash) {
      throw new Error("Insufficient Cash Balance");
    }

    if (existingProductDoc) {
      const existingSnap = await transaction.get(productRef);
      const existing = existingSnap.data();
      transaction.update(productRef, {
        stock: Number(existing.stock) + qty,
        description,
        purchase_price: pPrice,
        sale_price: sPrice,
        low_stock_alert: LOW_STOCK_ALERT_DEFAULT,
        supplier_id: supplierId || null,
      });
    } else {
      transaction.set(productRef, {
        name: trimmedName,
        name_lower: trimmedName.toLowerCase(),
        description: description || "",
        purchase_price: pPrice,
        sale_price: sPrice,
        stock: qty,
        low_stock_alert: LOW_STOCK_ALERT_DEFAULT,
        supplier_id: supplierId || null,
        created_at: new Date().toISOString(),
      });
    }

    transaction.set(purchaseRef, {
      product_id: productRef.id,
      product_name: trimmedName,
      supplier_id: supplierId || null,
      supplier_name: supplierName || null,
      quantity: qty,
      purchase_price: pPrice,
      total_amount: totalAmount,
      payment_type: paymentType,
      paid_amount: paid,
      due_amount: dueAmount,
      created_at: new Date().toISOString(),
    });

    let newCash = currentCash;
    if (paid > 0) {
      newCash = currentCash - paid;
      transaction.update(settingsDocRef, { cash_balance: newCash, updated_at: new Date().toISOString() });
    }

    if (dueAmount > 0 && supplierRef) {
      const supplierSnap = await transaction.get(supplierRef);
      if (supplierSnap.exists()) {
        const currentDue = Number(supplierSnap.data().due) || 0;
        transaction.update(supplierRef, { due: currentDue + dueAmount });
      }
    }

    return { cashBalance: newCash };
  });

  return result;
}

export async function payPurchaseDue({ purchaseId, amount }) {
  const numericAmount = Number(amount);
  if (numericAmount <= 0) throw new Error("Amount must be greater than 0");

  const purchaseRef = doc(db, "purchases", purchaseId);

  const result = await runTransaction(db, async (transaction) => {
    const purchaseSnap = await transaction.get(purchaseRef);
    if (!purchaseSnap.exists()) throw new Error("Purchase not found");

    const purchase = purchaseSnap.data();
    if (Number(purchase.due_amount) <= 0) throw new Error("This purchase has no due amount");
    if (numericAmount > Number(purchase.due_amount)) throw new Error("Amount cannot exceed the Due Amount");

    const settingsSnap = await transaction.get(settingsDocRef);
    const currentCash = settingsSnap.exists() ? Number(settingsSnap.data().cash_balance) || 0 : 0;

    if (numericAmount > currentCash) throw new Error("Insufficient Cash Balance");

    const newCash = currentCash - numericAmount;
    transaction.update(settingsDocRef, { cash_balance: newCash, updated_at: new Date().toISOString() });
    transaction.update(purchaseRef, {
      paid_amount: Number(purchase.paid_amount) + numericAmount,
      due_amount: Number(purchase.due_amount) - numericAmount,
    });

    if (purchase.supplier_id) {
      const supplierRef = doc(db, "suppliers", purchase.supplier_id);
      const supplierSnap = await transaction.get(supplierRef);
      if (supplierSnap.exists()) {
        const currentDue = Number(supplierSnap.data().due) || 0;
        transaction.update(supplierRef, { due: Math.max(currentDue - numericAmount, 0) });
      }
    }

    return { cashBalance: newCash };
  });

  return result;
}

export async function deletePurchase(purchaseId) {
  const purchaseRef = doc(db, "purchases", purchaseId);

  await runTransaction(db, async (transaction) => {
    const purchaseSnap = await transaction.get(purchaseRef);
    if (!purchaseSnap.exists()) throw new Error("Purchase record not found");

    const purchase = purchaseSnap.data();
    const productRef = doc(db, "products", purchase.product_id);
    const productSnap = await transaction.get(productRef);

    if (productSnap.exists()) {
      const currentStock = Number(productSnap.data().stock);
      if (currentStock < Number(purchase.quantity)) {
        throw new Error("Cannot delete: stock already partially sold, reversing would make stock negative");
      }
      transaction.update(productRef, { stock: currentStock - Number(purchase.quantity) });
    }

    if (Number(purchase.paid_amount) > 0) {
      const settingsSnap = await transaction.get(settingsDocRef);
      const currentCash = settingsSnap.exists() ? Number(settingsSnap.data().cash_balance) || 0 : 0;
      transaction.update(settingsDocRef, {
        cash_balance: currentCash + Number(purchase.paid_amount),
        updated_at: new Date().toISOString(),
      });
    }

    if (Number(purchase.due_amount) > 0 && purchase.supplier_id) {
      const supplierRef = doc(db, "suppliers", purchase.supplier_id);
      const supplierSnap = await transaction.get(supplierRef);
      if (supplierSnap.exists()) {
        const currentDue = Number(supplierSnap.data().due) || 0;
        transaction.update(supplierRef, { due: Math.max(currentDue - Number(purchase.due_amount), 0) });
      }
    }

    transaction.delete(purchaseRef);
  });
}