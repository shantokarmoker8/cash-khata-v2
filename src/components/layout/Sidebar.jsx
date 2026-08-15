// src/components/layout/Sidebar.jsx
import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaWallet,
  FaGaugeHigh,
  FaCartShopping,
  FaTags,
  FaReceipt,
  FaGear,
} from "react-icons/fa6";
import { useSettingsContext } from "../../hooks/useSettingsContext";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: FaGaugeHigh },
  { to: "/purchase", label: "Purchase", icon: FaCartShopping },
  { to: "/sales", label: "Sales", icon: FaTags },
  { to: "/expenses", label: "Expenses", icon: FaReceipt },
  { to: "/settings", label: "Settings", icon: FaGear },
];

export default function Sidebar() {
  const { businessName } = useSettingsContext();

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed top-0 left-0 w-[250px] h-screen bg-sidebar-bg border-r border-border-color z-[1100] flex-col max-lg:hidden lg:flex"
    >
      <div className="h-[68px] flex items-center gap-3 px-[22px] border-b border-border-color">
        <div className="w-[38px] h-[38px] bg-primary-blue rounded-[10px] flex items-center justify-center text-white text-base">
          <FaWallet />
        </div>
        <div className="font-bold text-[17px] text-text-dark truncate">
          {businessName || "Cash Khata"}
        </div>
      </div>

      <nav className="p-3.5 flex flex-col gap-1">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-3 rounded-[10px] text-sm font-medium cursor-pointer transition-all ${
                isActive
                  ? "bg-primary-blue text-white"
                  : "text-text-muted hover:bg-light-blue hover:text-primary-blue"
              }`
            }
          >
            <Icon className="w-5 text-center text-[15px]" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </motion.aside>
  );
}