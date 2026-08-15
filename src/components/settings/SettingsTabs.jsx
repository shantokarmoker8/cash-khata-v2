// src/components/settings/SettingsTabs.jsx
import {
  FaUser,
  FaStore,
  FaSackDollar,
  FaUserGroup,
  FaUsers,
  FaTruck,
  FaDatabase,
} from "react-icons/fa6";

const TABS = [
  { key: "account", label: "My Account", icon: FaUser },
  { key: "business", label: "Business Info", icon: FaStore },
  { key: "cash", label: "Cash Balance", icon: FaSackDollar },
  { key: "users", label: "Users", icon: FaUserGroup },
  { key: "customers", label: "Customer", icon: FaUsers },
  { key: "suppliers", label: "Supplier", icon: FaTruck },
  { key: "data", label: "Data Backup", icon: FaDatabase },
];

export default function SettingsTabs({ onSelect }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {TABS.map(({ key, label, icon: Icon }) => (
        <button
          key={key}
          type="button"
          onClick={() => onSelect(key)}
          className="ck-card flex flex-col items-center justify-center gap-2.5 py-6 hover:border-primary-blue hover:shadow-[0_6px_18px_rgba(37,99,235,0.1)] transition-all"
        >
          <div className="w-11 h-11 rounded-xl bg-light-blue text-primary-blue flex items-center justify-center text-lg">
            <Icon />
          </div>
          <span className="text-[13px] font-medium text-text-dark">{label}</span>
        </button>
      ))}
    </div>
  );
}