// src/components/layout/BottomNav.jsx
import { NavLink } from "react-router-dom";
import { FaGaugeHigh, FaCartShopping, FaTags, FaReceipt } from "react-icons/fa6";

const bottomItems = [
  { to: "/dashboard", label: "Dashboard", icon: FaGaugeHigh },
  { to: "/purchase", label: "Purchase", icon: FaCartShopping },
  { to: "/sales", label: "Sales", icon: FaTags },
  { to: "/expenses", label: "Expenses", icon: FaReceipt },
];

export default function BottomNav() {
  return (
    <nav className="hidden max-lg:flex fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-border-color z-[1100] items-center justify-around shadow-[0_-4px_16px_rgba(0,0,0,0.04)]">
      {bottomItems.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 text-[10px] cursor-pointer flex-1 py-1.5 transition-colors ${
              isActive ? "text-primary-blue" : "text-text-muted"
            }`
          }
        >
          <Icon className="text-[17px]" />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}