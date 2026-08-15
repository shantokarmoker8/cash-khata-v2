// src/components/purchase/EditPurchaseModal.jsx
import { useState } from "react";
import Modal from "../common/Modal";
import { showToast } from "../common/Toast";
import { formatCurrency } from "../../utils/formatCurrency";
import { payPurchaseDue } from "../../services/purchaseService";

export default function EditPurchaseModal({ isOpen, onClose, purchase, onSuccess }) {
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!purchase) return;

    setSubmitting(true);
    try {
      await payPurchaseDue({ purchaseId: purchase.id, amount });
      showToast("success", "Due paid successfully");
      setAmount("");
      onSuccess?.();
      onClose();
    } catch (err) {
      showToast("error", err.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  if (!purchase) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Pay Due" maxWidth="max-w-[380px]">
      <form onSubmit={handleSubmit}>
        <p className="text-[13px] text-text-dark mb-1">
          Product: <strong>{purchase.product_name}</strong>
        </p>
        <p className="text-text-muted text-xs mb-1">
          Supplier: <strong>{purchase.supplier_name || "No Supplier"}</strong>
        </p>
        <p className="text-text-muted text-xs mb-4">
          Due Amount: <span className="font-semibold text-danger">{formatCurrency(purchase.due_amount)}</span>
        </p>

        <label className="text-[13px] font-medium text-text-dark mb-1.5 block">Amount</label>
        <input
          type="number"
          step="0.01"
          min="0.01"
          max={purchase.due_amount}
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
            {submitting ? "Paying..." : "Pay"}
          </button>
        </div>
      </form>
    </Modal>
  );
}