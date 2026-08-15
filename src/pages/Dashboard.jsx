// src/pages/Dashboard.jsx
import { useEffect, useState } from "react";
import { FaUserPlus, FaTruck } from "react-icons/fa6";
import { fetchDashboardSummary } from "../services/dashboardService";
import DashboardSummaryCards from "../components/dashboard/DashboardSummaryCards";
import RecentTransactions from "../components/dashboard/RecentTransactions";
import RevenueChart from "../components/dashboard/RevenueChart";
import AddCustomerModal from "../components/dashboard/AddCustomerModal";
import AddSupplierModal from "../components/dashboard/AddSupplierModal";
import CustomerListModal from "../components/dashboard/CustomerListModal";
import SupplierListModal from "../components/dashboard/SupplierListModal";

const PERIOD_OPTIONS = [
  { value: "today", label: "Today" },
  { value: "7", label: "Last 7 Days" },
  { value: "30", label: "Last 1 Month" },
  { value: "365", label: "Last 1 Year" },
];

const EMPTY_SUMMARY = {
  total_purchase: 0,
  total_sales: 0,
  total_profit: 0,
  customer_due: 0,
  supplier_due: 0,
  total_expenses: 0,
  recent_purchases: [],
  recent_sales: [],
};

export default function Dashboard() {
  const [period, setPeriod] = useState("today");
  const [summary, setSummary] = useState(EMPTY_SUMMARY);
  const [loading, setLoading] = useState(true);
  const [chartState, setChartState] = useState({ open: false, type: null, title: "" });

  const [addCustomerOpen, setAddCustomerOpen] = useState(false);
  const [addSupplierOpen, setAddSupplierOpen] = useState(false);
  const [customerListOpen, setCustomerListOpen] = useState(false);
  const [supplierListOpen, setSupplierListOpen] = useState(false);

  function reloadSummary() {
    setLoading(true);
    fetchDashboardSummary(period).then((data) => {
      setSummary(data);
      setLoading(false);
    });
  }

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    fetchDashboardSummary(period).then((data) => {
      if (!cancelled) {
        setSummary(data);
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [period]);

  function openChart(type, title) {
    setChartState({ open: true, type, title });
  }

  function closeChart() {
    setChartState((prev) => ({ ...prev, open: false }));
  }

  return (
    <div className="flex flex-col h-[calc(100vh-68px-52px)] max-lg:h-[calc(100vh-68px-108px)]">
      {/* ============ Header ============ */}
      <div className="shrink-0">
        <div className="flex justify-between items-center gap-2.5 mb-3.5">
          <div className="min-w-0">
            <h4 className="font-semibold text-text-dark m-0 mb-0.5 truncate max-[380px]:text-sm">
              Dashboard
            </h4>
            <p className="text-text-muted text-[13px] m-0 truncate max-[380px]:hidden">
              Overview of your business performance
            </p>
          </div>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="border-[1.5px] border-border-color rounded-[10px] px-3.5 py-2 text-[12.5px] font-medium text-text-dark bg-white cursor-pointer outline-none shrink-0 focus:border-primary-blue"
          >
            {PERIOD_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <DashboardSummaryCards data={summary} loading={loading} onCardClick={openChart} />

        <div className="flex justify-center gap-3 mb-1 flex-wrap">
          <button
            type="button"
            onClick={() => setAddCustomerOpen(true)}
            className="ck-btn-primary flex items-center gap-2"
          >
            <FaUserPlus /> Add Customer
          </button>
          <button
            type="button"
            onClick={() => setAddSupplierOpen(true)}
            className="flex items-center gap-2 border-[1.5px] border-border-color text-text-dark rounded-[10px] px-[18px] py-2.5 text-[13px] font-semibold hover:bg-slate-50 transition-colors"
          >
            <FaTruck /> Add Supplier
          </button>
        </div>
      </div>

      {/* ============ Recent Purchase / Sales ============ */}
      <RecentTransactions
        recentPurchases={summary.recent_purchases}
        recentSales={summary.recent_sales}
        loading={loading}
      />

      {/* ============ Chart Popup ============ */}
      <RevenueChart
        isOpen={chartState.open}
        onClose={closeChart}
        type={chartState.type}
        title={chartState.title}
      />

      {/* ============ Quick Add Modals ============ */}
      <AddCustomerModal
        isOpen={addCustomerOpen}
        onClose={() => setAddCustomerOpen(false)}
        onSuccess={reloadSummary}
        onViewList={() => setCustomerListOpen(true)}
      />
      <AddSupplierModal
        isOpen={addSupplierOpen}
        onClose={() => setAddSupplierOpen(false)}
        onSuccess={reloadSummary}
        onViewList={() => setSupplierListOpen(true)}
      />

      {/* ============ List Modals ============ */}
      <CustomerListModal isOpen={customerListOpen} onClose={() => setCustomerListOpen(false)} />
      <SupplierListModal isOpen={supplierListOpen} onClose={() => setSupplierListOpen(false)} />
    </div>
  );
}