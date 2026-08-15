// src/pages/Sales.jsx
import { useEffect, useState } from "react";
import { fetchSellableProducts, filterProducts } from "../services/productService";
import { subscribeToSales, filterSales, deleteSale } from "../services/salesService";
import { subscribeToCustomers } from "../services/customerService";
import { showToast } from "../components/common/Toast";
import SalesFilters from "../components/sales/SalesFilters";
import SalesTable from "../components/sales/SalesTable";
import SalesHistoryTable from "../components/sales/SalesHistoryTable";
import AddSaleModal from "../components/sales/AddSaleModal";
import EditSaleModal from "../components/sales/EditSaleModal";
import ReturnSaleModal from "../components/sales/ReturnSaleModal";
import ConfirmDialog from "../components/common/ConfirmDialog";
import AddCustomerModal from "../components/dashboard/AddCustomerModal";

export default function Sales() {
  const [showHistory, setShowHistory] = useState(false);
  const [search, setSearch] = useState("");

  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);

  const [sales, setSales] = useState([]);
  const [salesLoading, setSalesLoading] = useState(true);

  const [customers, setCustomers] = useState([]);

  const [sellTarget, setSellTarget] = useState(null);
  const [payDueTarget, setPayDueTarget] = useState(null);
  const [returnTarget, setReturnTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [quickAddCustomerOpen, setQuickAddCustomerOpen] = useState(false);

  function reloadProducts() {
    setProductsLoading(true);
    fetchSellableProducts().then((rows) => {
      setProducts(rows);
      setProductsLoading(false);
    });
  }

  useEffect(() => {
    reloadProducts();
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToSales((rows) => {
      setSales(rows);
      setSalesLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToCustomers((rows) => setCustomers(rows));
    return () => unsubscribe();
  }, []);

  async function handleDeleteConfirm() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteSale(deleteTarget.id);
      showToast("success", "Sale deleted successfully");
      setDeleteTarget(null);
      reloadProducts();
    } catch (err) {
      showToast("error", err.message || "Something went wrong");
    } finally {
      setDeleting(false);
    }
  }

  const visibleProducts = filterProducts(products, showHistory ? "" : search);
  const visibleSales = filterSales(sales, showHistory ? search : "");

  return (
    <div>
      <SalesFilters
        search={search}
        onSearchChange={setSearch}
        showHistory={showHistory}
        onToggleHistory={() => {
          setShowHistory((prev) => !prev);
          setSearch("");
        }}
      />

      {showHistory ? (
        <SalesHistoryTable
          sales={visibleSales}
          loading={salesLoading}
          onPayDue={setPayDueTarget}
          onReturn={setReturnTarget}
          onDelete={setDeleteTarget}
        />
      ) : (
        <SalesTable products={visibleProducts} loading={productsLoading} onSell={setSellTarget} />
      )}

      <AddSaleModal
        isOpen={!!sellTarget}
        onClose={() => setSellTarget(null)}
        product={sellTarget}
        customers={customers}
        onSuccess={reloadProducts}
        onQuickAddCustomer={() => setQuickAddCustomerOpen(true)}
      />

      <EditSaleModal
        isOpen={!!payDueTarget}
        onClose={() => setPayDueTarget(null)}
        sale={payDueTarget}
      />

      <ReturnSaleModal
        isOpen={!!returnTarget}
        onClose={() => setReturnTarget(null)}
        sale={returnTarget}
        onSuccess={reloadProducts}
      />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Sale?"
        message="This will restore stock and reverse cash/due changes. This cannot be undone."
        confirmLabel={deleting ? "Deleting..." : "Delete"}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />

      <AddCustomerModal
        isOpen={quickAddCustomerOpen}
        onClose={() => setQuickAddCustomerOpen(false)}
      />
    </div>
  );
}