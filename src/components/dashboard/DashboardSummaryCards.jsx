// src/components/dashboard/DashboardSummaryCards.jsx
import {
  FaCartShopping,
  FaTags,
  FaChartLine,
  FaUserClock,
  FaTruckFast,
  FaReceipt,
} from "react-icons/fa6";
import StatCard from "../common/StatCard";

const CARD_META = [
  { key: "total_purchase", label: "Total Purchase", icon: FaCartShopping, color: "#2563eb", bg: "#eff6ff", type: "purchase" },
  { key: "total_sales", label: "Total Sales", icon: FaTags, color: "#16a34a", bg: "#f0fdf4", type: "sales" },
  { key: "total_profit", label: "Total Profit", icon: FaChartLine, color: "#7c3aed", bg: "#f5f3ff", type: "profit" },
  { key: "customer_due", label: "Customer Due", icon: FaUserClock, color: "#d97706", bg: "#fff7ed", type: "customer_due" },
  { key: "supplier_due", label: "Supplier Due", icon: FaTruckFast, color: "#dc2626", bg: "#fef2f2", type: "supplier_due" },
  { key: "total_expenses", label: "Total Expenses", icon: FaReceipt, color: "#0891b2", bg: "#ecfeff", type: "expenses" },
];

export default function DashboardSummaryCards({ data, loading, onCardClick }) {
  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-2 mb-3">
        {CARD_META.map((m) => (
          <div key={m.key} className="ck-skeleton h-[74px]" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-2 mb-3">
      {CARD_META.map((m) => (
        <StatCard
          key={m.key}
          icon={m.icon}
          label={m.label}
          value={data[m.key]}
          color={m.color}
          bg={m.bg}
          onClick={() => onCardClick(m.type, m.label)}
        />
      ))}
    </div>
  );
}