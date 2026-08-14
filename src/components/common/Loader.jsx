// src/components/common/Loader.jsx
import { motion } from "framer-motion";

export default function Loader({ fullScreen = false, size = 36 }) {
  const spinner = (
    <motion.div
      style={{
        width: size,
        height: size,
        border: "3px solid #e6ebf3",
        borderTopColor: "var(--primary-blue)",
        borderRadius: "50%",
      }}
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
    />
  );

  if (!fullScreen) return spinner;

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--body-bg)",
      }}
    >
      {spinner}
    </div>
  );
}