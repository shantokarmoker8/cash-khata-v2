// src/components/common/ConfirmDialog.jsx
import { AnimatePresence, motion } from "framer-motion";
import { FaTriangleExclamation } from "react-icons/fa6";

export default function ConfirmDialog({
  isOpen,
  title = "Are you sure?",
  message,
  confirmLabel = "Delete",
  danger = true,
  onConfirm,
  onCancel,
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/40 z-[2200] flex items-center justify-center p-4"
          onClick={onCancel}
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl p-6 w-full max-w-[360px] text-center"
          >
            <FaTriangleExclamation className="text-warning text-[32px] mx-auto mb-3" />
            <h5 className="font-semibold text-text-dark mb-1.5">{title}</h5>
            {message && <p className="text-text-muted text-sm mb-5">{message}</p>}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 border-[1.5px] border-border-color text-text-dark rounded-[10px] py-2.5 text-sm font-medium hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onConfirm}
                className={`flex-1 rounded-[10px] py-2.5 text-sm font-medium text-white transition-colors ${
                  danger ? "bg-danger hover:bg-red-700" : "bg-primary-blue hover:bg-dark-blue"
                }`}
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}