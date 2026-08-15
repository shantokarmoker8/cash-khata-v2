// src/components/dashboard/SupplierListModal.jsx
import { useEffect, useState } from "react";
import { FaHandHoldingDollar, FaTrash } from "react-icons/fa6";
import Modal from "../common/Modal";
import SearchInput from "../common/SearchInput";
import ConfirmDialog from "../common/ConfirmDialog";
import PaymentModal from "./PaymentModal";
import { showToast } from "../common/Toast";
import { formatCurrency } from "../../utils/formatCurrency";
import {
  subscribeToSuppliers,
  filterSuppliers,
  deleteSupplier,
} from "../../services/supplierService";

export default function SupplierListModal({ isOpen, onClose }) {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [paymentTarget, setPaymentTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const unsubscribe = subscribeToSuppliers((rows) => {
      setSuppliers(rows);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [isOpen]);

  async function handleDeleteConfirm() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteSupplier(deleteTarget.id);
      showToast("success", "Supplier deleted successfully");
      setDeleteTarget(null);
    } catch (err) {
      showToast("error", err.message || "Something went wrong");
    } finally {
      setDeleting(false);
    }
  }

  const filtered = filterSuppliers(suppliers, search);

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Supplier" maxWidth="max-w-[640px]">
        <div className="mb-3">
          <SearchInput value={search} onChange={setSearch} placeholder="Search suppliers..." />
        </div>

        <div className="max-h-[400px] overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden border border-border-color rounded-[14px]">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border-color">
                <th className="text-xs font-semibold text-text-muted px-3.5 py-3">Name</th>
                <th className="text-xs font-semibold text-text-muted px-3.5 py-3">Mobile</th>
                <th className="text-xs font-semibold text-text-muted px-3.5 py-3">Due</th>
                <th className="text-xs font-semibold text-text-muted px-3.5 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-text-muted text-sm">
                    Loading...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-text-muted text-sm">
                    No suppliers found
                  </td>
                </tr>
              ) : (
                filtered.map((s) => (
                  <tr key={s.id} className="border-b border-border-color last:border-none">
                    <td className="px-3.5 py-3 text-[13px] text-text-dark">{s.name}</td>
                    <td className="px-3.5 py-3 text-[13px] text-text-muted">{s.mobile}</td>
                    <td className="px-3.5 py-3 text-[13px] font-semibold">
                      {Number(s.due) > 0 ? (
                        <span className="text-danger">{formatCurrency(s.due)}</span>
                      ) : (
                        <span className="text-success">{formatCurrency(0)}</span>
                      )}
                    </td>
                    <td className="px-3.5 py-3">
                      <div className="flex items-center gap-1.5">
                        {Number(s.due) > 0 && (
                          <button
                            type="button"
                            onClick={() => setPaymentTarget(s)}
                            title="Make Payment"
                            className="ck-icon-btn bg-green-50 text-success hover:bg-green-100"
                          >
                            <FaHandHoldingDollar className="text-xs" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(s)}
                          title="Delete"
                          className="ck-icon-btn bg-red-50 text-danger hover:bg-red-100"
                        >
                          <FaTrash className="text-xs" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Modal>

      <PaymentModal
        isOpen={!!paymentTarget}
        onClose={() => setPaymentTarget(null)}
        type="supplier"
        entity={paymentTarget}
      />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Supplier?"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This cannot be undone.`}
        confirmLabel={deleting ? "Deleting..." : "Delete"}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}