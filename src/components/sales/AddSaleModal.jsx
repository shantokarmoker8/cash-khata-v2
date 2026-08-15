// src/components/sales/AddSaleModal.jsx
import { useEffect, useMemo, useState } from "react";
import { FaPlus } from "react-icons/fa6";
import Modal from "../common/Modal";
import { showToast } from "../common/Toast";
import { formatCurrency } from "../../utils/formatCurrency";
import { createSale } from "../../services/salesService";

export default function AddSaleModal({ isOpen, onClose, product, customers, onSuccess, onQuickAddCustomer }) {
  const [quantity, setQuantity] = useState("1");
  const [salePrice, setSalePrice] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [discount, setDiscount] = useState("0");
  const [paidAmount, setPaidAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && product) {
      setQuantity("1");
      setSalePrice(String(product.sale_price ?? ""));
      setCustomerId("");
      setDiscount("0");
      setPaidAmount("");
    }
  }, [isOpen, product]);

  const qtyNum = Number(quantity) || 0;
  const priceNum = Number(salePrice) || 0;
  const discountNum = Number(discount) || 0;
  const paidNum = Number(paidAmount) || 0;

  const grossAmount = qtyNum * priceNum;
  const totalCost = product ? Number(product.purchase_price) * qtyNum : 0;
  const maxAllowedDiscount = Math.max(grossAmount - totalCost, 0);
  const totalAmount = Math.max(grossAmount - discountNum, 0);
  const dueAmount = Math.max(totalAmount - paidNum, 0);
  const discountTooHigh = discountNum > maxAllowedDiscount;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!product) return;

    setSubmitting(true);
    try {
      const selectedCustomer = customers.find((c) => c.id === customerId);
      await createSale({
        productId: product.id,
        productName: product.name,
        customerId: customerId || null,
        customerName: selectedCustomer?.name || null,
        quantity: qtyNum,
        salePrice: priceNum,
        discountAmount: discountNum,
        paidAmount: paidNum,
      });
      showToast("success", "Sale completed successfully");
      onSuccess?.();
      onClose();
    } catch (err) {
      showToast("error", err.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  if (!product) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Sell: ${product.name}`}>
      <form onSubmit={handleSubmit}>
        <p className="text-text-muted mb-3 text-xs">
          Stock: <span className="font-semibold text-text-dark">{product.stock}</span>
        </p>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[13px] font-medium text-text-dark mb-1.5 block">Quantity</label>
            <input
              type="number"
              min="1"
              max={product.stock}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
              className="ck-input"
            />
          </div>
          <div>
            <label className="text-[13px] font-medium text-text-dark mb-1.5 block">Sale Price</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={salePrice}
              onChange={(e) => setSalePrice(e.target.value)}
              required
              className="ck-input"
            />
          </div>
        </div>

        <label className="text-[13px] font-medium text-text-dark mb-1.5 mt-3 block">
          Customer <span className="text-text-muted font-normal">(optional)</span>
        </label>
        <div className="flex gap-2">
          <select
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            className="ck-input"
          >
            <option value="">-- Walk-in Customer --</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.mobile})
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={onQuickAddCustomer}
            title="Add New Customer"
            className="border-[1.5px] border-border-color rounded-[10px] px-3.5 shrink-0 hover:bg-slate-50 transition-colors"
          >
            <FaPlus className="text-text-muted text-sm" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-3">
          <div>
            <label className="text-[13px] font-medium text-text-dark mb-1.5 block">Gross Amount</label>
            <div className="ck-input bg-slate-50 text-text-muted">{formatCurrency(grossAmount)}</div>
          </div>
          <div>
            <label className="text-[13px] font-medium text-text-dark mb-1.5 block">Discount</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
              placeholder="0.00"
              className="ck-input"
            />
          </div>
        </div>

        <p className="text-text-muted mb-0 mt-1.5 text-[11px]">
          Max Discount (No Loss):{" "}
          <span className="font-semibold text-success">{formatCurrency(maxAllowedDiscount)}</span>
        </p>
        {discountTooHigh && (
          <p className="mb-0 mt-1 text-[11px] text-danger">
            ⚠ এর বেশি Discount দিলে Loss হবে!
          </p>
        )}

        <div className="flex justify-between items-center mt-3 bg-light-blue px-3.5 py-2.5 rounded-[10px]">
          <span className="text-[13px] text-text-dark">Total Amount (After Discount)</span>
          <span className="text-[15px] font-bold text-primary-blue">{formatCurrency(totalAmount)}</span>
        </div>

        <label className="text-[13px] font-medium text-text-dark mb-1.5 mt-3 block">Pay Amount</label>
        <input
          type="number"
          step="0.01"
          min="0"
          value={paidAmount}
          onChange={(e) => setPaidAmount(e.target.value)}
          placeholder="0.00"
          className="ck-input"
        />

        <div className="flex justify-between mt-2.5 text-xs">
          <span className="text-text-muted">Due Amount</span>
          <span className="font-semibold text-danger">{formatCurrency(dueAmount)}</span>
        </div>

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
            disabled={submitting || discountTooHigh}
            className="ck-btn-primary flex-1 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? "Saving..." : "Sell"}
          </button>
        </div>
      </form>
    </Modal>
  );
}