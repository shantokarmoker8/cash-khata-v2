// src/components/sales/SalesFilters.jsx
import { FaClockRotateLeft } from "react-icons/fa6";
import SearchInput from "../common/SearchInput";

export default function SalesFilters({ search, onSearchChange, showHistory, onToggleHistory }) {
  return (
    <div className="shrink-0">
      <div className="flex justify-between items-center gap-3 mb-3 flex-wrap max-[767px]:flex-col max-[767px]:text-center">
        <div>
          <h4 className="font-semibold text-text-dark m-0 mb-0.5">Sales</h4>
          <p className="text-text-muted text-[13px] m-0">Sell products from your available stock</p>
        </div>
        <button
          type="button"
          onClick={onToggleHistory}
          className="flex items-center gap-2 border-[1.5px] border-border-color text-text-dark rounded-[10px] px-[18px] py-2.5 text-[13px] font-semibold hover:bg-slate-50 transition-colors"
        >
          <FaClockRotateLeft />
          {showHistory ? "Sell Products" : "View History"}
        </button>
      </div>

      <div className="ck-card mb-3">
        <SearchInput
          value={search}
          onChange={onSearchChange}
          placeholder={showHistory ? "Search sales..." : "Search products..."}
        />
      </div>
    </div>
  );
}