// src/components/purchase/PurchaseFilters.jsx
import { FaPlus } from "react-icons/fa6";
import SearchInput from "../common/SearchInput";

export default function PurchaseFilters({ search, onSearchChange, onAddPurchase }) {
  return (
    <div className="shrink-0">
      <div className="flex justify-between items-center gap-3 mb-3 flex-wrap max-[767px]:flex-col max-[767px]:text-center">
        <div>
          <h4 className="font-semibold text-text-dark m-0 mb-0.5">Purchase</h4>
          <p className="text-text-muted text-[13px] m-0">Manage stock purchases from suppliers</p>
        </div>
        <button
          type="button"
          onClick={onAddPurchase}
          className="ck-btn-primary flex items-center gap-2"
        >
          <FaPlus /> Add Purchase
        </button>
      </div>

      <div className="ck-card mb-3">
        <SearchInput value={search} onChange={onSearchChange} placeholder="Search purchases..." />
      </div>
    </div>
  );
}