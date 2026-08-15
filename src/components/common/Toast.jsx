// src/components/common/Toast.jsx
import toast, { Toaster } from "react-hot-toast";

/**
 * PHP এর ckToast(type, message) ফাংশনের সমতুল্য — সরাসরি import করে
 * showToast('success', 'Saved!') / showToast('error', 'Something went wrong') আকারে ব্যবহার হবে
 */
export function showToast(type, message) {
  if (type === "success") {
    toast.success(message);
  } else if (type === "error") {
    toast.error(message);
  } else {
    toast(message);
  }
}

/**
 * App.jsx এ একবার বসাতে হবে — সব toast এখান থেকেই রেন্ডার হবে
 */
export default function ToastProvider() {
  return (
    <Toaster
      position="top-center"
      toastOptions={{
        style: {
          fontSize: "13px",
          borderRadius: "10px",
          fontFamily: "Poppins, sans-serif",
        },
        success: { iconTheme: { primary: "#16a34a", secondary: "#fff" } },
        error: { iconTheme: { primary: "#dc2626", secondary: "#fff" } },
      }}
    />
  );
}