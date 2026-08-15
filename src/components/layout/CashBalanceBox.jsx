// src/components/layout/CashBalanceBox.jsx
import { FaSackDollar } from "react-icons/fa6";
import { useCashBalance } from "../../hooks/useCashBalance";
import { formatCurrency } from "../../utils/formatCurrency";

export default function CashBalanceBox() {
  const { cashBalance, loading } = useCashBalance();

  return (
    <div className="flex items-center gap-2.5 bg-light-blue border border-blue-100 px-4 py-2 rounded-[10px] max-[480px]:px-3">
      <FaSackDollar className="text-primary-blue text-sm" />
      <div>
        <span className="block text-[11px] leading-none text-text-muted mb-[3px] max-[480px]:hidden">
          Cash Balance
        </span>
        <span className="text-sm font-semibold leading-none text-primary-blue">
          {loading ? "৳ --" : formatCurrency(cashBalance)}
        </span>
      </div>
    </div>
  );
}