// src/pages/Purchase.jsx
import { useEffect, useState } from "react";
import { subscribeToPurchases, filterPurchases, deletePurchase } from "../services/purchaseService";
import { subscribeToSuppliers } from "../services/supplierService";
import { showToast } from "../components/common/Toast";
import PurchaseFilters from "../components/purchase/PurchaseFilters";
import PurchaseTable from "../components/purchase/PurchaseTable";
import AddPurchaseModal from "../components/purchase/AddPurchaseModal";
import EditPurchaseModal from "../components/purchase/EditPurchaseModal";
import ConfirmDialog from "../components/common/ConfirmDialog";
import AddSupplierModal from "../components/dashboard/AddSupplierModal";

export default function Purchase() {
  const [search, setSearch] = useState("");
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [suppliers, setSuppliers] = useState([]);

  const [addOpen, setAddOpen] = useState(false);
  const [payDueTarget, setPayDueTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [quickAddSupplierOpen, setQuickAddSupplierOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToPurchases((rows) => {
      setPurchases(rows);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToSuppliers((rows) => setSuppliers(rows));
    return () => unsubscribe();
  }, []);

  async function handleDeleteConfirm() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deletePurchase(deleteTarget.id);
      showToast("success", "Purchase deleted successfully");
      setDeleteTarget(null);
    } catch (err) {
      showToast("error", err.message || "Something went wrong");
    } finally {
      setDeleting(false);
    }
  }

  const visiblePurchases = filterPurchases(purchases, search);

  return (
    <div>
      <PurchaseFilters search={search} onSearchChange={setSearch} onAddPurchase={() => setAddOpen(true)} />

      <PurchaseTable
        purchases={visiblePurchases}
        loading={loading}
        onPayDue={setPayDueTarget}
        onDelete={setDeleteTarget}
      />

      <AddPurchaseModal
        isOpen={addOpen}
        onClose={() => setAddOpen(false)}
        suppliers={suppliers}
        onQuickAddSupplier={() => setQuickAddSupplierOpen(true)}
      />

      <EditPurchaseModal
        isOpen={!!payDueTarget}
        onClose={() => setPayDueTarget(null)}
        purchase={payDueTarget}
      />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Purchase?"
        message="This will reverse stock, cash, and supplier due changes. This cannot be undone."
        confirmLabel={deleting ? "Deleting..." : "Delete"}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />

      <AddSupplierModal
        isOpen={quickAddSupplierOpen}
        onClose={() => setQuickAddSupplierOpen(false)}
      />
    </div>
  );
}