// src/components/common/Modal.jsx
import { AnimatePresence, motion } from "framer-motion";
import { FaXmark } from "react-icons/fa6";

export default function Modal({ isOpen, onClose, title, children, maxWidth = "max-w-[460px]" }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/40 z-[2000] flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            className={`ck-modal-box ${maxWidth}`}
          >
            <div className="flex justify-between items-center mb-4">
              <h5 className="text-base font-semibold text-text-dark m-0">{title}</h5>
              <button
                type="button"
                onClick={onClose}
                className="text-text-muted hover:text-text-dark transition-colors cursor-pointer"
              >
                <FaXmark />
              </button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}