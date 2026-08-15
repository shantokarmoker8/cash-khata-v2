// src/pages/Expenses.jsx
import { useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa6";
import { subscribeToExpenses, filterExpenses, deleteExpense } from "../services/expenseService";
import { showToast } from "../components/common/Toast";
import SearchInput from "../components/common/SearchInput";
import ExpenseTable from "../components/expenses/ExpenseTable";
import AddExpenseModal from "../components/expenses/AddExpenseModal";
import ConfirmDialog from "../components/common/ConfirmDialog";
import { formatCurrency } from "../utils/formatCurrency";

export default function Expenses() {
  const [search, setSearch] = useState("");
  const [expenses, setExpenses] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const [addOpen, setAddOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToExpenses(({ rows, total: sum }) => {
      setExpenses(rows);
      setTotal(sum);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  async function handleDeleteConfirm() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteExpense(deleteTarget.id);
      showToast("success", "Expense deleted successfully");
      setDeleteTarget(null);
    } catch (err) {
      showToast("error", err.message || "Something went wrong");
    } finally {
      setDeleting(false);
    }
  }

  const visibleExpenses = filterExpenses(expenses, search);

  return (
    <div>
      <div className="flex justify-between items-center gap-3 mb-3 flex-wrap max-[767px]:flex-col max-[767px]:text-center">
        <div>
          <h4 className="font-semibold text-text-dark m-0 mb-0.5">Expenses</h4>
          <p className="text-text-muted text-[13px] m-0">
            Total Expenses:{" "}
            <span className="font-semibold text-danger">{formatCurrency(total)}</span>
          </p>
        </div>
        <button type="button" onClick={() => setAddOpen(true)} className="ck-btn-primary flex items-center gap-2">
          <FaPlus /> Add Expense
        </button>
      </div>

      <div className="ck-card mb-3">
        <SearchInput value={search} onChange={setSearch} placeholder="Search expenses..." />
      </div>

      <ExpenseTable expenses={visibleExpenses} loading={loading} onDelete={setDeleteTarget} />

      <AddExpenseModal isOpen={addOpen} onClose={() => setAddOpen(false)} />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Expense?"
        message="This will reverse the cash balance deduction. This cannot be undone."
        confirmLabel={deleting ? "Deleting..." : "Delete"}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}