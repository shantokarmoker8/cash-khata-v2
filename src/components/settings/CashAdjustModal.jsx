// src/components/settings/CashAdjustModal.jsx
import { useEffect, useState } from "react";
import { FaCheck } from "react-icons/fa6";
import Modal from "../common/Modal";
import { showToast } from "../common/Toast";
import { formatCurrency } from "../../utils/formatCurrency";
import { timeAgo } from "../../utils/formatDate";
import { addCashTransaction, subscribeToCashHistory } from "../../services/cashService";
import { useSettingsContext } from "../../hooks/useSettingsContext";
import { useAuth } from "../../hooks/useAuth";

export default function CashAdjustModal({ isOpen, onClose }) {
  const { cashBalance } = useSettingsContext();
  const { currentUser } = useAuth();

  const [type, setType] = useState("add"); // "add" | "withdraw"
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;
    const unsubscribe = subscribeToCashHistory((rows) => {
      setHistory(rows);
      setHistoryLoading(false);
    });
    return () => unsubscribe();
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setType("add");
      setAmount("");
      setNote("");
    }
  }, [isOpen]);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await addCashTransaction({ type, amount, note, createdBy: currentUser?.uid });
      showToast("success", type === "add" ? "Cash added successfully" : "Cash withdrawn successfully");
      setAmount("");
      setNote("");
    } catch (err) {
      showToast("error", err.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Cash Balance" maxWidth="max-w-[480px]">
      <div className="bg-light-blue rounded-[10px] px-4 py-3.5 mb-4 flex items-center justify-between">
        <span className="text-[13px] text-text-dark">Current Balance</span>
        <span className="text-[17px] font-bold text-primary-blue">{formatCurrency(cashBalance)}</span>
      </div>

      <div className="ck-toggle-tabs mb-3.5">
        <button type="button" onClick={() => setType("add")} className={type === "add" ? "active" : ""}>
          Add Cash
        </button>
        <button type="button" onClick={() => setType("withdraw")} className={type === "withdraw" ? "active" : ""}>
          Withdraw Cash
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <label className="text-[13px] font-medium text-text-dark mb-1.5 block">Amount</label>
        <input
          type="number"
          step="0.01"
          min="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="e.g. 5000"
          required
          className="ck-input mb-3.5"
        />

        <label className="text-[13px] font-medium text-text-dark mb-1.5 block">
          Note <span className="text-text-muted font-normal">(optional)</span>
        </label>
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="ck-input"
        />

        <button
          type="submit"
          disabled={submitting}
          className="ck-btn-primary w-full flex items-center justify-center gap-2 mt-3 disabled:opacity-60"
        >
          <FaCheck /> {submitting ? "Saving..." : type === "add" ? "Add Cash" : "Withdraw Cash"}
        </button>
      </form>

      <h6 className="text-[13px] font-semibold text-text-dark mt-5 mb-2.5">Recent Transactions</h6>
      <div className="max-h-[220px] overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden border border-border-color rounded-[12px] divide-y divide-border-color">
        {historyLoading ? (
          <p className="text-text-muted text-center py-6 text-[13px]">Loading...</p>
        ) : history.length === 0 ? (
          <p className="text-text-muted text-center py-6 text-[13px]">No transactions yet</p>
        ) : (
          history.map((h) => (
            <div key={h.id} className="flex justify-between items-center px-3.5 py-2.5">
              <div>
                <div className="text-[13px] text-text-dark font-medium">{h.note || "—"}</div>
                <div className="text-[11px] text-text-muted mt-0.5">
                  {timeAgo(h.created_at?.toDate ? h.created_at.toDate() : h.created_at)}
                </div>
              </div>
              <span className={`text-[13px] font-semibold ${h.type === "add" ? "text-success" : "text-danger"}`}>
                {h.type === "add" ? "+" : "-"}
                {formatCurrency(h.amount)}
              </span>
            </div>
          ))
        )}
      </div>
    </Modal>
  );
}