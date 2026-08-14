// src/firebase/firestoreRefs.js
import { collection } from "firebase/firestore";
import { db } from "./firebaseConfig";

// Firestore Collection References — সব জায়গায় এখান থেকেই import করতে হবে
export const usersCol = collection(db, "users");
export const customersCol = collection(db, "customers");
export const suppliersCol = collection(db, "suppliers");
export const salesCol = collection(db, "sales");
export const purchasesCol = collection(db, "purchases");
export const expensesCol = collection(db, "expenses");
export const cashTransactionsCol = collection(db, "cash_transactions");
export const settingsCol = collection(db, "settings");

// Firestore-এ Settings একটাই ডকুমেন্ট হিসেবে রাখা হবে (single business profile)
export const SETTINGS_DOC_ID = "business_settings";