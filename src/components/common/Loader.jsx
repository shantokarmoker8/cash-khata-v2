// src/components/common/Loader.jsx
import { motion } from "framer-motion";

export default function Loader({ fullScreen = false, size = "w-9 h-9" }) {
  const spinner = (
    <motion.div
      className={`${size} rounded-full border-4 border-border-color border-t-primary-blue`}
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
    />
  );

  if (!fullScreen) return spinner;

  return (
    <div className="min-h-screen flex items-center justify-center bg-body-bg">
      {spinner}
    </div>
  );
}