// src/components/sales/SalesTable.jsx
import { FaTag } from "react-icons/fa6";
import { formatCurrency } from "../../utils/formatCurrency";

export default function SalesTable({ products, loading, onSell }) {
  return (
    <div className="ck-card p-0 overflow-hidden">
      <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-320px)]">
        <table className="w-full text-left min-w-[560px]">
          <thead>
            <tr className="border-b border-border-color sticky top-0 bg-white">
              <th className="text-xs font-semibold text-text-muted px-4 py-3">Product Name</th>
              <th className="text-xs font-semibold text-text-muted px-4 py-3 max-md:hidden">Description</th>
              <th className="text-xs font-semibold text-text-muted px-4 py-3">Sale Price</th>
              <th className="text-xs font-semibold text-text-muted px-4 py-3">Stock</th>
              <th className="text-xs font-semibold text-text-muted px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-text-muted text-sm">
                  Loading...
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-text-muted text-sm">
                  No products available in stock
                </td>
              </tr>
            ) : (
              products.map((p) => (
                <tr key={p.id} className="border-b border-border-color last:border-none hover:bg-slate-50">
                  <td className="px-4 py-3 text-[13px] font-medium text-text-dark">{p.name}</td>
                  <td className="px-4 py-3 text-[13px] text-text-muted max-md:hidden">
                    {p.description || "—"}
                  </td>
                  <td className="px-4 py-3 text-[13px] font-semibold text-text-dark">
                    {formatCurrency(p.sale_price)}
                  </td>
                  <td className="px-4 py-3 text-[13px]">
                    <span
                      className={
                        Number(p.stock) <= Number(p.low_stock_alert)
                          ? "badge-due"
                          : "badge-cash"
                      }
                    >
                      {p.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => onSell(p)}
                      className="ck-btn-primary flex items-center gap-1.5 !py-2"
                    >
                      <FaTag className="text-[11px]" /> Sell
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