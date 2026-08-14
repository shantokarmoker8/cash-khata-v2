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
  const [errorKey, setErrorKey] = useState(0); // প্রতিবার নতুন error এ shake animation replay করার জন্য
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
    <div
      style={{
        minHeight: "100vh",
        background: "var(--light-blue)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <motion.div
        id="loginWrapper"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="login-wrapper"
        style={{
          display: "flex",
          width: "100%",
          maxWidth: 900,
          background: "#ffffff",
          borderRadius: 20,
          overflow: "hidden",
          boxShadow: "0 10px 40px rgba(37, 99, 235, 0.12)",
        }}
      >
        {/* ============ Left Panel ============ */}
        <div
          className="login-left"
          style={{
            flex: 1,
            background: "var(--primary-blue)",
            color: "#ffffff",
            padding: "50px 40px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "flex-start",
          }}
        >
          <div
            style={{
              width: 70,
              height: 70,
              background: "rgba(255,255,255,0.15)",
              borderRadius: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 30,
              marginBottom: 25,
            }}
          >
            <FaWallet />
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 12 }}>
            Cash Khata
          </h1>
          <p style={{ fontSize: 14, opacity: 0.9, lineHeight: 1.7 }}>
            Manage your purchase, sales, stock, customer due, supplier due
            and daily expenses — all in one simple dashboard.
          </p>
        </div>

        {/* ============ Right Panel (Form) ============ */}
        <div className="login-right" style={{ flex: 1, padding: "50px 40px" }}>
          <h2 style={{ fontSize: 24, fontWeight: 600, color: "var(--text-dark)", marginBottom: 6 }}>
            Welcome Back
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 30 }}>
            Login to manage your business
          </p>

          {errorMsg && (
            <motion.div
              key={errorKey}
              initial={{ x: -10 }}
              animate={{ x: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              style={{
                background: "#fef2f2",
                color: "#dc2626",
                padding: "10px 14px",
                borderRadius: 8,
                fontSize: 13,
                marginBottom: 18,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <FaCircleExclamation />
              <span>{errorMsg}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit}>
            <div>
              <label
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: "var(--text-dark)",
                  marginBottom: 6,
                  display: "block",
                }}
              >
                Username
              </label>
              <div style={{ position: "relative", marginBottom: 20 }}>
                <FaUser
                  style={{
                    position: "absolute",
                    left: 16,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--text-muted)",
                  }}
                />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  required
                  autoComplete="off"
                  style={{
                    width: "100%",
                    padding: "12px 16px 12px 44px",
                    border: "1.5px solid var(--border-color)",
                    borderRadius: 10,
                    fontSize: 14,
                    outline: "none",
                  }}
                  className="ck-login-input"
                />
              </div>
            </div>

            <div>
              <label
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: "var(--text-dark)",
                  marginBottom: 6,
                  display: "block",
                }}
              >
                Password
              </label>
              <div style={{ position: "relative", marginBottom: 20 }}>
                <FaLock
                  style={{
                    position: "absolute",
                    left: 16,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--text-muted)",
                  }}
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                  autoComplete="off"
                  style={{
                    width: "100%",
                    padding: "12px 16px 12px 44px",
                    border: "1.5px solid var(--border-color)",
                    borderRadius: 10,
                    fontSize: 14,
                    outline: "none",
                  }}
                  className="ck-login-input"
                />
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={!loading ? { y: -1 } : {}}
              style={{
                width: "100%",
                padding: 13,
                background: "var(--primary-blue)",
                color: "#fff",
                border: "none",
                borderRadius: 10,
                fontWeight: 600,
                fontSize: 15,
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              {loading ? (
                <>
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                    style={{ display: "inline-flex" }}
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