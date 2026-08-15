// src/services/cashService.js
import {
  addDoc,
  doc,
  runTransaction,
  orderBy,
  query,
  onSnapshot,
  limit as fbLimit,
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { cashTransactionsCol, SETTINGS_DOC_ID } from "../firebase/firestoreRefs";

const settingsDocRef = doc(db, "settings", SETTINGS_DOC_ID);

/**
 * Cash Add বা Withdraw করা হয় — settings.cash_balance আপডেট এবং
 * cash_transactions এ log entry — দুটোই একসাথে atomic ভাবে হয় (runTransaction),
 * যাতে কখনো balance আর log এর মধ্যে mismatch না হয়।
 */
export async function addCashTransaction({ type, amount, note, createdBy }) {
  const numericAmount = Number(amount);
  if (!numericAmount || numericAmount <= 0) {
    throw new Error("Amount must be greater than 0");
  }

  await runTransaction(db, async (transaction) => {
    const settingsSnap = await transaction.get(settingsDocRef);
    const currentBalance = settingsSnap.exists()
      ? Number(settingsSnap.data().cash_balance) || 0
      : 0;

    const newBalance =
      type === "add" ? currentBalance + numericAmount : currentBalance - numericAmount;

    if (type === "withdraw" && newBalance < 0) {
      throw new Error("Cash balance cannot go negative");
    }

    transaction.update(settingsDocRef, {
      cash_balance: newBalance,
      opening_cash_set: true,
      updated_at: new Date().toISOString(),
    });

    const newLogRef = doc(cashTransactionsCol);
    transaction.set(newLogRef, {
      type,
      amount: numericAmount,
      note: note || "",
      created_by: createdBy || null,
      created_at: new Date().toISOString(),
    });
  });
}

/**
 * সাম্প্রতিক cash transaction history দেখানোর জন্য (Dashboard/Settings এ)
 */
export function subscribeToCashHistory(callback, rowLimit = 20) {
  const q = query(cashTransactionsCol, orderBy("created_at", "desc"), fbLimit(rowLimit));
  return onSnapshot(q, (snapshot) => {
    const rows = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(rows);
  });
}