// src/components/expenses/ExpenseTable.jsx
import { FaTrash } from "react-icons/fa6";
import { formatCurrency } from "../../utils/formatCurrency";
import { timeAgo } from "../../utils/formatDate";

export default function ExpenseTable({ expenses, loading, onDelete }) {
  return (
    <div className="ck-card p-0 overflow-hidden">
      <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-320px)]">
        <table className="w-full text-left min-w-[420px]">
          <thead>
            <tr className="border-b border-border-color sticky top-0 bg-white">
              <th className="text-xs font-semibold text-text-muted px-4 py-3">Expense Name</th>
              <th className="text-xs font-semibold text-text-muted px-4 py-3">Amount</th>
              <th className="text-xs font-semibold text-text-muted px-4 py-3">Date</th>
              <th className="text-xs font-semibold text-text-muted px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="text-center py-8 text-text-muted text-sm">
                  Loading...
                </td>
              </tr>
            ) : expenses.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-8 text-text-muted text-sm">
                  No expenses found
                </td>
              </tr>
            ) : (
              expenses.map((e) => (
                <tr key={e.id} className="border-b border-border-color last:border-none hover:bg-slate-50">
                  <td className="px-4 py-3 text-[13px] font-medium text-text-dark">{e.name}</td>
                  <td className="px-4 py-3 text-[13px] font-semibold text-danger">
                    {formatCurrency(e.amount)}
                  </td>
                  <td className="px-4 py-3 text-[12px] text-text-muted whitespace-nowrap">
                    {timeAgo(e.created_at?.toDate ? e.created_at.toDate() : e.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => onDelete(e)}
                      title="Delete"
                      className="ck-icon-btn bg-red-50 text-danger hover:bg-red-100"
                    >
                      <FaTrash className="text-xs" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}