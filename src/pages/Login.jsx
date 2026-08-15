// src/pages/Login.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaWallet,
  FaUser,
  FaLock,
  FaCircleExclamation,
  FaSpinner,
} from "react-icons/fa6";
import { useAuth } from "../hooks/useAuth";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [errorKey, setErrorKey] = useState(0); // error আসলে key বদলে shake animation replay করার জন্য
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      await login(username.trim(), password.trim());
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setErrorMsg(err.message || "Something went wrong. Please try again.");
      setErrorKey((prev) => prev + 1);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-light-blue flex items-center justify-center p-5">
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="flex w-full max-w-[900px] bg-white rounded-[20px] overflow-hidden shadow-[0_10px_40px_rgba(37,99,235,0.12)]"
      >
        {/* ============ Left Panel ============ */}
        <div className="hidden md:flex flex-1 bg-primary-blue text-white p-10 flex-col justify-center items-start">
          <div className="w-[70px] h-[70px] bg-white/15 rounded-2xl flex items-center justify-center text-3xl mb-6">
            <FaWallet />
          </div>
          <h1 className="text-[28px] font-bold mb-3">Cash Khata</h1>
          <p className="text-sm opacity-90 leading-7">
            Manage your purchase, sales, stock, customer due, supplier due
            and daily expenses — all in one simple dashboard.
          </p>
        </div>

        {/* ============ Right Panel (Form) ============ */}
        <div className="flex-1 p-10 sm:p-10 max-sm:p-7">
          <h2 className="text-2xl font-semibold text-text-dark mb-1.5">
            Welcome Back
          </h2>
          <p className="text-text-muted text-sm mb-7">
            Login to manage your business
          </p>

          {errorMsg && (
            <motion.div
              key={errorKey}
              initial={{ x: -10 }}
              animate={{ x: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="bg-red-50 text-danger px-3.5 py-2.5 rounded-lg text-[13px] mb-4.5 flex items-center gap-2"
            >
              <FaCircleExclamation className="shrink-0" />
              <span>{errorMsg}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit}>
            <div>
              <label className="text-[13px] font-medium text-text-dark mb-1.5 block">
                Username
              </label>
              <div className="relative mb-5">
                <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  required
                  autoComplete="off"
                  className="w-full pl-11 pr-4 py-3 border-[1.5px] border-border-color rounded-[10px] text-sm outline-none transition-colors focus:border-primary-blue focus:ring-4 focus:ring-primary-blue/10"
                />
              </div>
            </div>

            <div>
              <label className="text-[13px] font-medium text-text-dark mb-1.5 block">
                Password
              </label>
              <div className="relative mb-5">
                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                  autoComplete="off"
                  className="w-full pl-11 pr-4 py-3 border-[1.5px] border-border-color rounded-[10px] text-sm outline-none transition-colors focus:border-primary-blue focus:ring-4 focus:ring-primary-blue/10"
                />
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={!loading ? { y: -1 } : {}}
              className="w-full py-3.5 bg-primary-blue hover:bg-dark-blue text-white border-none rounded-[10px] font-semibold text-[15px] flex items-center justify-center gap-2 transition-colors disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? (
                <>
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                    className="inline-flex"
                  >
                    <FaSpinner />
                  </motion.span>
                  Please wait...
                </>
              ) : (
                "Login"
              )}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}