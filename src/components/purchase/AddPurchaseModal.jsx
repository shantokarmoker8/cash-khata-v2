// src/components/purchase/AddPurchaseModal.jsx
import { useEffect, useMemo, useState } from "react";
import { FaPlus } from "react-icons/fa6";
import Modal from "../common/Modal";
import { showToast } from "../common/Toast";
import { formatCurrency } from "../../utils/formatCurrency";
import { createPurchase } from "../../services/purchaseService";

export default function AddPurchaseModal({ isOpen, onClose, suppliers, onSuccess, onQuickAddSupplier }) {
  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [supplierId, setSupplierId] = useState("");
  const [paidAmount, setPaidAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setProductName("");
      setDescription("");
      setPurchasePrice("");
      setSalePrice("");
      setQuantity("1");
      setSupplierId("");
      setPaidAmount("");
    }
  }, [isOpen]);

  const qtyNum = Number(quantity) || 0;
  const priceNum = Number(purchasePrice) || 0;
  const paidNum = Number(paidAmount) || 0;
  const totalAmount = qtyNum * priceNum;
  const dueAmount = Math.max(totalAmount - paidNum, 0);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const selectedSupplier = suppliers.find((s) => s.id === supplierId);
      await createPurchase({
        productName,
        description,
        purchasePrice: priceNum,
        salePrice: Number(salePrice),
        quantity: qtyNum,
        supplierId: supplierId || null,
        supplierName: selectedSupplier?.name || null,
        paidAmount: paidNum,
      });
      showToast("success", "Purchase saved successfully");
      onSuccess?.();
      onClose();
    } catch (err) {
      showToast("error", err.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Purchase">
      <form onSubmit={handleSubmit}>
        <label className="text-[13px] font-medium text-text-dark mb-1.5 block">Product Name</label>
        <input
          type="text"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
          required
          placeholder="Existing name = restock, new name = new product"
          className="ck-input mb-3.5"
        />

        <label className="text-[13px] font-medium text-text-dark mb-1.5 block">
          Description <span className="text-text-muted font-normal">(optional)</span>
        </label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="ck-input mb-3.5"
        />

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[13px] font-medium text-text-dark mb-1.5 block">Purchase Price</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={purchasePrice}
              onChange={(e) => setPurchasePrice(e.target.value)}
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

        <label className="text-[13px] font-medium text-text-dark mb-1.5 mt-3.5 block">Quantity</label>
        <input
          type="number"
          min="1"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          required
          className="ck-input"
        />

        <label className="text-[13px] font-medium text-text-dark mb-1.5 mt-3.5 block">
          Supplier <span className="text-text-muted font-normal">(optional)</span>
        </label>
        <div className="flex gap-2">
          <select
            value={supplierId}
            onChange={(e) => setSupplierId(e.target.value)}
            className="ck-input"
          >
            <option value="">-- No Supplier --</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.mobile})
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={onQuickAddSupplier}
            title="Add New Supplier"
            className="border-[1.5px] border-border-color rounded-[10px] px-3.5 shrink-0 hover:bg-slate-50 transition-colors"
          >
            <FaPlus className="text-text-muted text-sm" />
          </button>
        </div>

        <div className="flex justify-between items-center mt-3.5 bg-light-blue px-3.5 py-2.5 rounded-[10px]">
          <span className="text-[13px] text-text-dark">Total Amount</span>
          <span className="text-[15px] font-bold text-primary-blue">{formatCurrency(totalAmount)}</span>
        </div>

        <label className="text-[13px] font-medium text-text-dark mb-1.5 mt-3.5 block">Pay Amount</label>
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
          <button type="submit" disabled={submitting} className="ck-btn-primary flex-1 disabled:opacity-60">
            {submitting ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </Modal>
  );
}