// src/services/expenseService.js
import { doc, onSnapshot, orderBy, query, runTransaction } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { expensesCol, SETTINGS_DOC_ID } from "../firebase/firestoreRefs";

const settingsDocRef = doc(db, "settings", SETTINGS_DOC_ID);

export function subscribeToExpenses(callback) {
  const q = query(expensesCol, orderBy("created_at", "desc"));
  return onSnapshot(q, (snapshot) => {
    const rows = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    const total = rows.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
    callback({ rows, total });
  });
}

export function filterExpenses(expenses, search) {
  const term = search.trim().toLowerCase();
  if (!term) return expenses;
  return expenses.filter((e) => (e.name || "").toLowerCase().includes(term));
}

/**
 * Expense তৈরি — Cash Balance থেকে সরাসরি বিয়োগ হয় (cash যথেষ্ট আছে কিনা চেক করা হয়)
 */
export async function addExpense({ name, amount }) {
  const trimmedName = name.trim();
  const numericAmount = Number(amount);

  if (!trimmedName) throw new Error("Expense name is required");
  if (numericAmount <= 0) throw new Error("Amount must be greater than 0");

  const expenseRef = doc(expensesCol);

  const newCash = await runTransaction(db, async (transaction) => {
    const settingsSnap = await transaction.get(settingsDocRef);
    const currentCash = settingsSnap.exists() ? Number(settingsSnap.data().cash_balance) || 0 : 0;

    if (numericAmount > currentCash) {
      throw new Error("Insufficient Cash Balance");
    }

    const updatedCash = currentCash - numericAmount;

    transaction.set(expenseRef, {
      name: trimmedName,
      amount: numericAmount,
      created_at: new Date().toISOString(),
    });
    transaction.update(settingsDocRef, { cash_balance: updatedCash, updated_at: new Date().toISOString() });

    return updatedCash;
  });

  return newCash;
}

/**
 * Expense ডিলিট — Cash Balance এ amount ফেরত যোগ হয় (reverse)
 */
export async function deleteExpense(expenseId) {
  const expenseRef = doc(db, "expenses", expenseId);

  const newCash = await runTransaction(db, async (transaction) => {
    const expenseSnap = await transaction.get(expenseRef);
    if (!expenseSnap.exists()) throw new Error("Expense not found");

    const expense = expenseSnap.data();

    const settingsSnap = await transaction.get(settingsDocRef);
    const currentCash = settingsSnap.exists() ? Number(settingsSnap.data().cash_balance) || 0 : 0;
    const updatedCash = currentCash + Number(expense.amount);

    transaction.update(settingsDocRef, { cash_balance: updatedCash, updated_at: new Date().toISOString() });
    transaction.delete(expenseRef);

    return updatedCash;
  });

  return newCash;
}