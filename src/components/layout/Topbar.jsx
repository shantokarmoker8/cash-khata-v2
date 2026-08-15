// src/components/layout/Topbar.jsx
import { motion } from "framer-motion";
import { FaWallet } from "react-icons/fa6";
import CashBalanceBox from "./CashBalanceBox";
import ProfileDropdown from "./ProfileDropdown";
import { useSettingsContext } from "../../hooks/useSettingsContext";

export default function Topbar() {
  const { businessName } = useSettingsContext();

  return (
    <motion.header
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed top-0 left-0 lg:left-[250px] right-0 h-[68px] bg-white border-b border-border-color flex items-center justify-between px-4 sm:px-[26px] z-[1000] transition-[left] duration-200"
    >
      <div className="flex lg:hidden items-center gap-3">
        <div className="w-9 h-9 bg-primary-blue rounded-[10px] flex items-center justify-center text-white text-[15px]">
          <FaWallet />
        </div>
      </div>

      <div className="flex items-center gap-3.5 ml-auto">
        <CashBalanceBox />
        <ProfileDropdown />
      </div>
    </motion.header>
  );
}