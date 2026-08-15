// src/components/dashboard/AddSupplierModal.jsx
import { useState } from "react";
import { FaList } from "react-icons/fa6";
import Modal from "../common/Modal";
import { showToast } from "../common/Toast";
import { addSupplier } from "../../services/supplierService";

export default function AddSupplierModal({ isOpen, onClose, onSuccess, onViewList }) {
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [address, setAddress] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function resetForm() {
    setName("");
    setMobile("");
    setAddress("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await addSupplier({ name, mobile, address });
      showToast("success", "Supplier added successfully");
      resetForm();
      onSuccess?.();
      onClose();
    } catch (err) {
      showToast("error", err.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Supplier">
      <form onSubmit={handleSubmit}>
        <label className="text-[13px] font-medium text-text-dark mb-1.5 block">Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="ck-input mb-3.5"
        />

        <label className="text-[13px] font-medium text-text-dark mb-1.5 block">Mobile</label>
        <input
          type="text"
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
          required
          className="ck-input mb-3.5"
        />

        <label className="text-[13px] font-medium text-text-dark mb-1.5 block">
          Address <span className="text-text-muted font-normal">(optional)</span>
        </label>
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="ck-input"
        />

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

        <button
          type="button"
          onClick={() => {
            onClose();
            onViewList?.();
          }}
          className="w-full flex items-center justify-center gap-2 mt-2.5 border-[1.5px] border-border-color text-text-dark rounded-[10px] py-2.5 text-sm font-medium hover:bg-slate-50 transition-colors"
        >
          <FaList /> View Supplier List
        </button>
      </form>
    </Modal>
  );
}