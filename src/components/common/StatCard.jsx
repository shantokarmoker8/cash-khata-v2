// src/components/common/StatCard.jsx
import { motion } from "framer-motion";
import { formatCurrency } from "../../utils/formatCurrency";

export default function StatCard({ icon: Icon, label, value, color, bg, onClick }) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      onClick={onClick}
      className="bg-white border border-border-color rounded-[14px] p-4 cursor-pointer transition-shadow h-full flex flex-row-reverse items-center justify-between gap-2.5 hover:border-primary-blue hover:shadow-[0_6px_18px_rgba(37,99,235,0.1)] max-[767px]:flex-col max-[767px]:text-center max-[767px]:px-1 max-[767px]:py-2 max-[767px]:gap-1"
    >
      <div
        className="w-10 h-10 max-[767px]:w-[26px] max-[767px]:h-[26px] rounded-[10px] flex items-center justify-center text-[15px] max-[767px]:text-[11px] shrink-0"
        style={{ background: bg, color }}
      >
        <Icon />
      </div>
      <div className="flex flex-col gap-1 min-w-0 max-[767px]:items-center">
        <div className="text-[11px] max-[767px]:text-[8.5px] text-text-muted whitespace-nowrap overflow-hidden text-ellipsis max-[767px]:whitespace-normal">
          {label}
        </div>
        <div className="text-base max-[767px]:text-[11px] font-bold text-text-dark whitespace-nowrap overflow-hidden text-ellipsis">
          {formatCurrency(value)}
        </div>
      </div>
    </motion.div>
  );
}