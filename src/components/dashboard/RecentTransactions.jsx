// src/components/dashboard/RecentTransactions.jsx
import { useNavigate } from "react-router-dom";
import { FaCartShopping, FaTags } from "react-icons/fa6";
import { formatCurrency } from "../../utils/formatCurrency";
import { timeAgo } from "../../utils/formatDate";

function ListRow({ title, sub, amount, isDue }) {
  return (
    <div className="flex justify-between items-center py-2.5 border-b border-dashed border-border-color last:border-none">
      <div className="min-w-0">
        <div className="text-[13px] font-medium text-text-dark truncate">{title}</div>
        <div className="text-[11px] text-text-muted mt-0.5 truncate">{sub}</div>
      </div>
      <div className="text-right shrink-0 ml-3">
        <div className="text-[13px] font-semibold text-text-dark">{formatCurrency(amount)}</div>
        <span className={isDue ? "badge-due" : "badge-cash"}>{isDue ? "Due" : "Cash"}</span>
      </div>
    </div>
  );
}

export default function RecentTransactions({ recentPurchases, recentSales, loading }) {
  const navigate = useNavigate();

  return (
    <div className="flex-1 min-h-0 grid grid-cols-2 gap-4 mt-1.5 max-[767px]:flex max-[767px]:overflow-x-auto max-[767px]:[scroll-snap-type:x_mandatory] max-[767px]:gap-3">
      {/* ============ Recent Purchase ============ */}
      <div className="ck-card flex flex-col overflow-hidden h-full max-[767px]:shrink-0 max-[767px]:basis-full max-[767px]:[scroll-snap-align:start]">
        <div className="flex justify-between items-center mb-3 shrink-0">
          <h6 className="font-semibold text-sm text-text-dark m-0">Recent Purchase</h6>
          <button
            type="button"
            onClick={() => navigate("/purchase")}
            title="View Purchase List"
            className="w-[30px] h-[30px] rounded-lg flex items-center justify-center text-text-muted hover:text-primary-blue hover:bg-light-blue transition-colors"
          >
            <FaCartShopping className="text-[15px]" />
          </button>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto pr-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {loading ? (
            <div className="space-y-2">
              <div className="ck-skeleton h-12" />
              <div className="ck-skeleton h-12" />
              <div className="ck-skeleton h-12" />
            </div>
          ) : recentPurchases.length === 0 ? (
            <p className="text-text-muted text-center py-8 text-[13px]">No data found</p>
          ) : (
            recentPurchases.map((p) => (
              <ListRow
                key={p.id}
                title={p.product_name}
                sub={`${p.supplier_name || "No Supplier"} • Qty: ${p.quantity} • ${timeAgo(
                  p.created_at?.toDate ? p.created_at.toDate() : p.created_at
                )}`}
                amount={p.total_amount}
                isDue={Number(p.due_amount) > 0}
              />
            ))
          )}
        </div>
      </div>

      {/* ============ Recent Sales ============ */}
      <div className="ck-card flex flex-col overflow-hidden h-full max-[767px]:shrink-0 max-[767px]:basis-full max-[767px]:[scroll-snap-align:start]">
        <div className="flex justify-between items-center mb-3 shrink-0">
          <h6 className="font-semibold text-sm text-text-dark m-0">Recent Sales</h6>
          <button
            type="button"
            onClick={() => navigate("/sales")}
            title="View Sales History"
            className="w-[30px] h-[30px] rounded-lg flex items-center justify-center text-text-muted hover:text-primary-blue hover:bg-light-blue transition-colors"
          >
            <FaTags className="text-[15px]" />
          </button>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto pr-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {loading ? (
            <div className="space-y-2">
              <div className="ck-skeleton h-12" />
              <div className="ck-skeleton h-12" />
              <div className="ck-skeleton h-12" />
            </div>
          ) : recentSales.length === 0 ? (
            <p className="text-text-muted text-center py-8 text-[13px]">No data found</p>
          ) : (
            recentSales.map((s) => (
              <ListRow
                key={s.id}
                title={s.product_name}
                sub={`${s.customer_name || "Walk-in Customer"} • Qty: ${s.quantity} • ${timeAgo(
                  s.created_at?.toDate ? s.created_at.toDate() : s.created_at
                )}`}
                amount={s.total_amount}
                isDue={Number(s.due_amount) > 0}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}