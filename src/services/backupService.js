// src/services/backupService.js
import { getDocs, writeBatch, doc } from "firebase/firestore";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";
import { auth, db } from "../firebase/firebaseConfig";
import {
  customersCol,
  suppliersCol,
  salesCol,
  purchasesCol,
  expensesCol,
  settingsCol,
  cashTransactionsCol,
  SETTINGS_DOC_ID,
} from "../firebase/firestoreRefs";
import { productsCol } from "./productService";

// নিরাপত্তার কারণে users এখানে অন্তর্ভুক্ত না (PHP এর মতোই — plain password
// না থাকলেও Firebase Auth uid mapping sensitive, তাই বাদ)
const BACKUP_COLLECTIONS = {
  settings: settingsCol,
  customers: customersCol,
  suppliers: suppliersCol,
  products: productsCol,
  purchases: purchasesCol,
  sales: salesCol,
  expenses: expensesCol,
  cash_transactions: cashTransactionsCol,
};

/**
 * সব কালেকশন থেকে ডেটা এনে একটা JSON ফাইল হিসেবে download করা হয় —
 * PHP এর export.php এর সমতুল্য, কিন্তু সার্ভার-সাইড না, ব্রাউজারেই ফাইল তৈরি হয়
 */
export async function exportBackup() {
  const backup = {
    exported_at: new Date().toISOString(),
    app: "Cash Khata",
    version: 1,
    collections: {},
  };

  for (const [name, colRef] of Object.entries(BACKUP_COLLECTIONS)) {
    const snap = await getDocs(colRef);
    backup.collections[name] = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  }

  const fileName = `cash-khata-backup-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")}.json`;
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * সব business data মুছে ফেলা — password re-verify করে (Firebase Auth এর নিজস্ব
 * reauthenticate ব্যবহার করে, PHP এর মতো plain-text password compare না)
 */
export async function deleteAllData({ password, confirmText }) {
  if (confirmText !== "DELETE") {
    throw new Error("Please type DELETE in capital letters exactly");
  }
  if (!password) {
    throw new Error("Please enter your password");
  }
  if (!auth.currentUser) {
    throw new Error("Not authenticated");
  }

  // Password পুনরায় যাচাই — ভুল পাসওয়ার্ড দিলে এখানেই error ছুঁড়বে
  const credential = EmailAuthProvider.credential(auth.currentUser.email, password);
  await reauthenticateWithCredential(auth.currentUser, credential);

  // প্রতিটা কালেকশনের সব ডকুমেন্ট batch delete (users বাদে)
  const collectionsToWipe = [
    customersCol,
    suppliersCol,
    productsCol,
    purchasesCol,
    salesCol,
    expensesCol,
    cashTransactionsCol,
  ];

  for (const colRef of collectionsToWipe) {
    const snap = await getDocs(colRef);
    // Firestore batch এ সর্বোচ্চ ৫০০টা অপারেশন — তাই ৪০০ করে chunk করা হচ্ছে (safe margin)
    const docs = snap.docs;
    for (let i = 0; i < docs.length; i += 400) {
      const batch = writeBatch(db);
      docs.slice(i, i + 400).forEach((d) => batch.delete(d.ref));
      await batch.commit();
    }
  }

  const settingsRef = doc(db, "settings", SETTINGS_DOC_ID);
  const batch = writeBatch(db);
  batch.update(settingsRef, { cash_balance: 0, opening_cash_set: false });
  await batch.commit();
}