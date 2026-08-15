// src/components/common/SearchInput.jsx
import { FaMagnifyingGlass } from "react-icons/fa6";

export default function SearchInput({ value, onChange, placeholder = "Search..." }) {
  return (
    <div className="relative">
      <FaMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted text-sm" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-3.5 py-2.5 border-[1.5px] border-border-color rounded-[10px] text-[13px] outline-none transition-colors focus:border-primary-blue"
      />
    </div>
  );
}