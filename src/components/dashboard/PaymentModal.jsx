// src/components/dashboard/PaymentModal.jsx
import { useState } from "react";
import Modal from "../common/Modal";
import { showToast } from "../common/Toast";
import { formatCurrency } from "../../utils/formatCurrency";
import { receiveCustomerPayment } from "../../services/customerService";
import { makeSupplierPayment } from "../../services/supplierService";
import { useAuth } from "../../hooks/useAuth";

/**
 * type: "customer" | "supplier"
 * entity: { id, name, due }
 */
export default function PaymentModal({ isOpen, onClose, type, entity, onSuccess }) {
  const { currentUser } = useAuth();
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isCustomer = type === "customer";
  const title = isCustomer ? "Receive Payment" : "Make Payment";
  const label = isCustomer ? "Customer" : "Supplier";

  async function handleSubmit(e) {
    e.preventDefault();
    if (!entity) return;

    setSubmitting(true);
    try {
      if (isCustomer) {
        await receiveCustomerPayment({
          customerId: entity.id,
          amount,
          createdBy: currentUser?.uid,
        });
        showToast("success", "Payment received successfully");
      } else {
        await makeSupplierPayment({
          supplierId: entity.id,
          amount,
          createdBy: currentUser?.uid,
        });
        showToast("success", "Payment made successfully");
      }
      setAmount("");
      onSuccess?.();
      onClose();
    } catch (err) {
      showToast("error", err.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  if (!entity) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-[400px]">
      <form onSubmit={handleSubmit}>
        <p className="text-[13px] text-text-dark mb-1">
          {label}: <strong>{entity.name}</strong>
        </p>
        <p className="text-text-muted text-xs mb-4">
          Current Due: <span className="font-semibold text-danger">{formatCurrency(entity.due)}</span>
        </p>

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