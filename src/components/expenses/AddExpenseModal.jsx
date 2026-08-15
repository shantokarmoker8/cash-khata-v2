// src/components/expenses/AddExpenseModal.jsx
import { useState } from "react";
import Modal from "../common/Modal";
import { showToast } from "../common/Toast";
import { addExpense } from "../../services/expenseService";

export default function AddExpenseModal({ isOpen, onClose }) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function resetForm() {
    setName("");
    setAmount("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await addExpense({ name, amount });
      showToast("success", "Expense added successfully");
      resetForm();
      onClose();
    } catch (err) {
      showToast("error", err.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Expense" maxWidth="max-w-[400px]">
      <form onSubmit={handleSubmit}>
        <label className="text-[13px] font-medium text-text-dark mb-1.5 block">Expense Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="e.g. Electricity Bill"
          className="ck-input mb-3.5"
        />

        <label className="text-[13px] font-medium text-text-dark mb-1.5 block">Amount</label>
        <input
          type="number"
          step="0.01"
          min="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          className="ck-input"
        />

        <div className="flex gap-2 mt-5">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 border-[1.5px] border-border-color text-text-dark rounded-[10px] py-2.5 text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button type="submit" disabled={submitting} className="ck-btn-primary flex-1 disabled:opacity-60">
            {submitting ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </Modal>
  );
}