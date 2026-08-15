// src/context/AuthContext.jsx
import { createContext, useEffect, useState } from "react";
import { loginWithUsername, logoutUser, getStoredSession } from "../services/authService";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    // পেজ লোড হওয়ার সাথে সাথে localStorage থেকে session restore করা হয়
    const stored = getStoredSession();
    setCurrentUser(stored);
    setAuthLoading(false);
  }, []);

  async function login(username, password) {
    const user = await loginWithUsername(username, password);
    setCurrentUser(user);
    return user;
  }

  function logout() {
    logoutUser();
    setCurrentUser(null);
  }

  const value = {
    currentUser,
    authLoading,
    isAdmin: currentUser?.role === "admin",
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}