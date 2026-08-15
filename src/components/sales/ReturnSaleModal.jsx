// src/components/sales/ReturnSaleModal.jsx
import { useState } from "react";
import Modal from "../common/Modal";
import { showToast } from "../common/Toast";
import { formatCurrency } from "../../utils/formatCurrency";
import { returnSale } from "../../services/salesService";

export default function ReturnSaleModal({ isOpen, onClose, sale, onSuccess }) {
  const [returnQty, setReturnQty] = useState("1");
  const [submitting, setSubmitting] = useState(false);

  const qtyNum = Number(returnQty) || 0;
  const refundAmount = sale ? qtyNum * Number(sale.sale_price) : 0;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!sale) return;

    setSubmitting(true);
    try {
      await returnSale({ saleId: sale.id, returnQty: qtyNum });
      showToast("success", "Return processed successfully");
      setReturnQty("1");
      onSuccess?.();
      onClose();
    } catch (err) {
      showToast("error", err.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  if (!sale) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Return Product" maxWidth="max-w-[400px]">
      <form onSubmit={handleSubmit}>
        <p className="text-[13px] text-text-dark mb-1">
          Product: <strong>{sale.product_name}</strong>
        </p>
        <p className="text-text-muted text-xs mb-4">
          Sold Quantity: <span className="font-semibold">{sale.quantity}</span>
        </p>

        <label className="text-[13px] font-medium text-text-dark mb-1.5 block">Return Quantity</label>
        <input
          type="number"
          min="1"
          max={sale.quantity}
          value={returnQty}
          onChange={(e) => setReturnQty(e.target.value)}
          required
          className="ck-input"
        />

        <div className="flex justify-between items-center mt-3 bg-light-blue px-3.5 py-2.5 rounded-[10px]">
          <span className="text-[13px] text-text-dark">Refund Amount</span>
          <span className="text-[15px] font-bold text-primary-blue">{formatCurrency(refundAmount)}</span>
        </div>
        <p className="text-text-muted mb-0 mt-2 text-[11px]">
          Stock ফেরত যাবে, এবং Refund Amount Cash Balance অথবা Customer Due থেকে সমন্বয় হবে।
        </p>

        <div className="flex gap-2 mt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 border-[1.5px] border-border-color text-text-dark rounded-[10px] py-2.5 text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 bg-red-50 text-danger hover:bg-red-100 rounded-[10px] py-2.5 text-sm font-semibold transition-colors disabled:opacity-60"
          >
            {submitting ? "Processing..." : "Confirm Return"}
          </button>
        </div>
      </form>
    </Modal>
  );
}