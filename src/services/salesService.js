// src/services/salesService.js
import {
  addDoc,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { salesCol, customersCol, SETTINGS_DOC_ID } from "../firebase/firestoreRefs";
import { productsCol } from "./productService";

const settingsDocRef = doc(db, "settings", SETTINGS_DOC_ID);

/**
 * সব sales history realtime subscribe — নতুন প্রথমে (id DESC এর সমতুল্য)
 */
export function subscribeToSales(callback) {
  const q = query(salesCol, orderBy("created_at", "desc"));
  return onSnapshot(q, (snapshot) => {
    const rows = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(rows);
  });
}

export function filterSales(sales, search) {
  const term = search.trim().toLowerCase();
  if (!term) return sales;
  return sales.filter(
    (s) =>
      (s.product_name || "").toLowerCase().includes(term) ||
      (s.customer_name || "").toLowerCase().includes(term)
  );
}

/**
 * Sell করা — Stock কমা, Sale রেকর্ড তৈরি, Cash Balance বাড়া, Customer Due বাড়া —
 * সবকিছু একটা atomic transaction এ (PHP এর beginTransaction()/commit() এর সমতুল্য)
 */
export async function createSale({
  productId,
  productName,
  customerId,
  customerName,
  quantity,
  salePrice,
  discountAmount,
  paidAmount,
}) {
  const qty = Number(quantity);
  const price = Number(salePrice);
  const discount = Number(discountAmount) || 0;
  const paid = Number(paidAmount) || 0;

  if (!productId) throw new Error("Please select a product");
  if (qty <= 0) throw new Error("Quantity must be greater than 0");
  if (price <= 0) throw new Error("Sale Price must be greater than 0");
  if (discount < 0) throw new Error("Discount cannot be negative");
  if (paid < 0) throw new Error("Pay Amount cannot be negative");

  const grossAmount = price * qty;
  if (discount > grossAmount) throw new Error("Discount cannot exceed the total amount");

  const productRef = doc(db, "products", productId);
  const saleRef = doc(salesCol);
  const customerRef = customerId ? doc(db, "customers", customerId) : null;

  const result = await runTransaction(db, async (transaction) => {
    const productSnap = await transaction.get(productRef);
    if (!productSnap.exists()) throw new Error("Product not found");

    const product = productSnap.data();
    if (Number(product.stock) < qty) {
      throw new Error(`Insufficient Stock. Available: ${product.stock}`);
    }

    // ============ Loss Protection ============
    const totalCost = Number(product.purchase_price) * qty;
    const totalAmount = grossAmount - discount;

    if (totalAmount < totalCost) {
      const maxAllowedDiscount = grossAmount - totalCost;
      throw new Error(
        `Discount too high — this would cause a loss. Maximum allowed discount is ${maxAllowedDiscount.toFixed(
          2
        )} Taka (Cost Price: ${totalCost.toFixed(2)})`
      );
    }

    if (paid > totalAmount) {
      throw new Error("Pay Amount cannot exceed Total Amount (after discount)");
    }

    const dueAmount = totalAmount - paid;
    if (dueAmount > 0 && !customerId) {
      throw new Error("Customer is required when there is a Due amount");
    }

    const paymentType = dueAmount <= 0 ? "cash" : "due";

    // Stock কমানো
    transaction.update(productRef, { stock: Number(product.stock) - qty });

    // Sale রেকর্ড — purchase_price_snapshot সেভ করা হচ্ছে, যাতে ভবিষ্যতে product এর
    // দাম বদলালেও এই sale এর profit calculation সঠিক থাকে
    transaction.set(saleRef, {
      product_id: productId,
      product_name: productName,
      customer_id: customerId || null,
      customer_name: customerName || null,
      quantity: qty,
      sale_price: price,
      purchase_price_snapshot: Number(product.purchase_price),
      discount_amount: discount,
      total_amount: totalAmount,
      payment_type: paymentType,
      paid_amount: paid,
      due_amount: dueAmount,
      created_at: new Date().toISOString(),
    });

    // Cash Balance আপডেট
    const settingsSnap = await transaction.get(settingsDocRef);
    const currentCash = settingsSnap.exists() ? Number(settingsSnap.data().cash_balance) || 0 : 0;
    const newCash = currentCash + paid;
    transaction.update(settingsDocRef, { cash_balance: newCash, updated_at: new Date().toISOString() });

    // Customer Due বাড়ানো
    if (dueAmount > 0 && customerRef) {
      const customerSnap = await transaction.get(customerRef);
      if (customerSnap.exists()) {
        const currentDue = Number(customerSnap.data().due) || 0;
        transaction.update(customerRef, { due: currentDue + dueAmount });
      }
    }

    return { cashBalance: newCash };
  });

  return result;
}

/**
 * Sale এর Due Payment করা — cash বাড়া, sale.paid/due আপডেট, customer due কমা
 */
export async function paySaleDue({ saleId, amount }) {
  const numericAmount = Number(amount);
  if (numericAmount <= 0) throw new Error("Amount must be greater than 0");

  const saleRef = doc(db, "sales", saleId);

  const result = await runTransaction(db, async (transaction) => {
    const saleSnap = await transaction.get(saleRef);
    if (!saleSnap.exists()) throw new Error("Sale not found");

    const sale = saleSnap.data();
    if (Number(sale.due_amount) <= 0) throw new Error("This sale has no due amount");
    if (numericAmount > Number(sale.due_amount)) throw new Error("Amount cannot exceed the Due Amount");

    const settingsSnap = await transaction.get(settingsDocRef);
    const currentCash = settingsSnap.exists() ? Number(settingsSnap.data().cash_balance) || 0 : 0;
    const newCash = currentCash + numericAmount;

    transaction.update(settingsDocRef, { cash_balance: newCash, updated_at: new Date().toISOString() });
    transaction.update(saleRef, {
      paid_amount: Number(sale.paid_amount) + numericAmount,
      due_amount: Number(sale.due_amount) - numericAmount,
    });

    if (sale.customer_id) {
      const customerRef = doc(db, "customers", sale.customer_id);
      const customerSnap = await transaction.get(customerRef);
      if (customerSnap.exists()) {
        const currentDue = Number(customerSnap.data().due) || 0;
        transaction.update(customerRef, { due: Math.max(currentDue - numericAmount, 0) });
      }
    }

    return { cashBalance: newCash };
  });

  return result;
}

/**
 * Return — আংশিক বা সম্পূর্ণ রিটার্ন, Stock ফেরত, Cash/Due সমন্বয়
 */
export async function returnSale({ saleId, returnQty }) {
  const qty = Number(returnQty);
  if (qty <= 0) throw new Error("Return quantity must be greater than 0");

  const saleRef = doc(db, "sales", saleId);

  const result = await runTransaction(db, async (transaction) => {
    const saleSnap = await transaction.get(saleRef);
    if (!saleSnap.exists()) throw new Error("Sale record not found");

    const sale = saleSnap.data();
    if (qty > Number(sale.quantity)) {
      throw new Error(`Return quantity cannot exceed sold quantity (${sale.quantity})`);
    }

    const unitPrice = Number(sale.sale_price);
    const returnAmount = unitPrice * qty;
    const refundFromDue = Math.min(returnAmount, Number(sale.due_amount));
    const refundFromCash = returnAmount - refundFromDue;

    const settingsSnap = await transaction.get(settingsDocRef);
    const currentCash = settingsSnap.exists() ? Number(settingsSnap.data().cash_balance) || 0 : 0;

    if (refundFromCash > currentCash) {
      throw new Error("Insufficient Cash Balance to process this refund");
    }

    // Stock ফেরত
    const productRef = doc(db, "products", sale.product_id);
    const productSnap = await transaction.get(productRef);
    if (productSnap.exists()) {
      transaction.update(productRef, { stock: Number(productSnap.data().stock) + qty });
    }

    // Cash Balance কমানো
    let newCash = currentCash;
    if (refundFromCash > 0) {
      newCash = currentCash - refundFromCash;
      transaction.update(settingsDocRef, { cash_balance: newCash, updated_at: new Date().toISOString() });
    }

    // Customer Due কমানো
    if (refundFromDue > 0 && sale.customer_id) {
      const customerRef = doc(db, "customers", sale.customer_id);
      const customerSnap = await transaction.get(customerRef);
      if (customerSnap.exists()) {
        const currentDue = Number(customerSnap.data().due) || 0;
        transaction.update(customerRef, { due: Math.max(currentDue - refundFromDue, 0) });
      }
    }

    // Sale রেকর্ড আপডেট বা মুছে ফেলা
    const newQuantity = Number(sale.quantity) - qty;
    if (newQuantity <= 0) {
      transaction.delete(saleRef);
    } else {
      transaction.update(saleRef, {
        quantity: newQuantity,
        total_amount: Number(sale.total_amount) - returnAmount,
        due_amount: Number(sale.due_amount) - refundFromDue,
        paid_amount: Number(sale.paid_amount) - refundFromCash,
      });
    }

    return { cashBalance: newCash };
  });

  return result;
}

/**
 * সম্পূর্ণ Sale ডিলিট করা — Stock ফেরত, Cash Balance reverse, Customer Due reverse
 */
export async function deleteSale(saleId) {
  const saleRef = doc(db, "sales", saleId);

  await runTransaction(db, async (transaction) => {
    const saleSnap = await transaction.get(saleRef);
    if (!saleSnap.exists()) throw new Error("Sale record not found");

    const sale = saleSnap.data();

    const settingsSnap = await transaction.get(settingsDocRef);
    const currentCash = settingsSnap.exists() ? Number(settingsSnap.data().cash_balance) || 0 : 0;

    if (Number(sale.paid_amount) > currentCash) {
      throw new Error("Cannot delete: reversing this sale would make cash balance negative");
    }

    const productRef = doc(db, "products", sale.product_id);
    const productSnap = await transaction.get(productRef);
    if (productSnap.exists()) {
      transaction.update(productRef, { stock: Number(productSnap.data().stock) + Number(sale.quantity) });
    }

    const newCash = currentCash - Number(sale.paid_amount);
    transaction.update(settingsDocRef, { cash_balance: newCash, updated_at: new Date().toISOString() });

    if (Number(sale.due_amount) > 0 && sale.customer_id) {
      const customerRef = doc(db, "customers", sale.customer_id);
      const customerSnap = await transaction.get(customerRef);
      if (customerSnap.exists()) {
        const currentDue = Number(customerSnap.data().due) || 0;
        transaction.update(customerRef, { due: Math.max(currentDue - Number(sale.due_amount), 0) });
      }
    }

    transaction.delete(saleRef);
  });
}