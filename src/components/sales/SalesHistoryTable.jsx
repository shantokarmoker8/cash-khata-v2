// src/components/sales/SalesHistoryTable.jsx
import { FaMoneyBillWave, FaRotateLeft, FaTrash } from "react-icons/fa6";
import { formatCurrency } from "../../utils/formatCurrency";
import { timeAgo } from "../../utils/formatDate";

export default function SalesHistoryTable({ sales, loading, onPayDue, onReturn, onDelete }) {
  return (
    <div className="ck-card p-0 overflow-hidden">
      <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-320px)]">
        <table className="w-full text-left min-w-[820px]">
          <thead>
            <tr className="border-b border-border-color sticky top-0 bg-white">
              <th className="text-xs font-semibold text-text-muted px-4 py-3">Product</th>
              <th className="text-xs font-semibold text-text-muted px-4 py-3">Customer</th>
              <th className="text-xs font-semibold text-text-muted px-4 py-3">Qty</th>
              <th className="text-xs font-semibold text-text-muted px-4 py-3">Sale Price</th>
              <th className="text-xs font-semibold text-text-muted px-4 py-3">Total</th>
              <th className="text-xs font-semibold text-text-muted px-4 py-3">Status</th>
              <th className="text-xs font-semibold text-text-muted px-4 py-3">Date</th>
              <th className="text-xs font-semibold text-text-muted px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="text-center py-8 text-text-muted text-sm">
                  Loading...
                </td>
              </tr>
            ) : sales.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-8 text-text-muted text-sm">
                  No sales found
                </td>
              </tr>
            ) : (
              sales.map((s) => {
                const isPartial = Number(s.due_amount) > 0 && Number(s.paid_amount) > 0;
                const isFullDue = Number(s.due_amount) > 0 && Number(s.paid_amount) <= 0;
                return (
                  <tr key={s.id} className="border-b border-border-color last:border-none hover:bg-slate-50">
                    <td className="px-4 py-3 text-[13px] font-medium text-text-dark">{s.product_name}</td>
                    <td className="px-4 py-3 text-[13px] text-text-muted">
                      {s.customer_name || "Walk-in Customer"}
                    </td>
                    <td className="px-4 py-3 text-[13px]">{s.quantity}</td>
                    <td className="px-4 py-3 text-[13px]">{formatCurrency(s.sale_price)}</td>
                    <td className="px-4 py-3 text-[13px] font-semibold text-text-dark">
                      {formatCurrency(s.total_amount)}
                    </td>
                    <td className="px-4 py-3">
                      {isPartial || isFullDue ? (
                        <div>
                          <span className="badge-due">{isPartial ? "Partial" : "Due"}</span>
                          <div className="text-[10px] text-danger mt-0.5">
                            Due: {formatCurrency(s.due_amount)}
                          </div>
                        </div>
                      ) : (
                        <span className="badge-cash">Paid</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-[12px] text-text-muted whitespace-nowrap">
                      {timeAgo(s.created_at?.toDate ? s.created_at.toDate() : s.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {Number(s.due_amount) > 0 && (
                          <button
                            type="button"
                            onClick={() => onPayDue(s)}
                            title="Pay Due"
                            className="ck-icon-btn bg-green-50 text-success hover:bg-green-100"
                          >
                            <FaMoneyBillWave className="text-xs" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => onReturn(s)}
                          title="Return Product"
                          className="ck-icon-btn bg-orange-50 text-warning hover:bg-orange-100"
                        >
                          <FaRotateLeft className="text-xs" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(s)}
                          title="Delete"
                          className="ck-icon-btn bg-red-50 text-danger hover:bg-red-100"
                        >
                          <FaTrash className="text-xs" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}