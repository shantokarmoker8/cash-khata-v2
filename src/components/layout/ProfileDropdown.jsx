// src/components/layout/ProfileDropdown.jsx
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { FaChevronDown, FaGear, FaRightFromBracket } from "react-icons/fa6";
import { useAuth } from "../../hooks/useAuth";

export default function ProfileDropdown() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  const fullName = currentUser?.full_name || "User";
  const initial = fullName.charAt(0).toUpperCase();

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2.5 bg-transparent border-none cursor-pointer px-2 py-1.5 rounded-[10px] transition-colors hover:bg-slate-100"
      >
        <div className="w-9 h-9 rounded-full bg-primary-blue text-white flex items-center justify-center font-semibold text-sm">
          {initial}
        </div>
        <span className="text-[13px] font-medium text-text-dark hidden lg:block">
          {fullName}
        </span>
        <FaChevronDown className="text-[11px] text-text-muted" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute top-[52px] right-0 bg-white border border-border-color rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.08)] min-w-[180px] p-2 z-[1200]"
          >
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                navigate("/settings");
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-text-dark text-[13px] cursor-pointer transition-colors hover:bg-light-blue hover:text-primary-blue"
            >
              <FaGear /> Settings
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-text-dark text-[13px] cursor-pointer transition-colors hover:bg-red-50 hover:text-danger"
            >
              <FaRightFromBracket /> Logout
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}