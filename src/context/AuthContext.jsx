// src/context/AuthContext.jsx
import { createContext, useEffect, useState } from "react";
import {
  loginWithUsername,
  logoutUser,
  fetchUserProfile,
  subscribeToAuthChanges,
} from "../services/authService";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null); // { uid, username, full_name, role }
  const [authLoading, setAuthLoading] = useState(true);  // প্রথমবার Firebase auth state resolve হওয়া পর্যন্ত true

  useEffect(() => {
    // পেজ রিফ্রেশ হলেও Firebase নিজে থেকেই session persist রাখে,
    // এই listener দিয়ে সেই স্টেট React এ sync করা হচ্ছে
    const unsubscribe = subscribeToAuthChanges(async (firebaseUser) => {
      if (firebaseUser) {
        const profile = await fetchUserProfile(firebaseUser.uid);
        if (profile) {
          setCurrentUser({
            uid: firebaseUser.uid,
            id: profile.id,
            username: profile.username,
            full_name: profile.full_name,
            role: profile.role || "staff",
          });
        } else {
          // Auth এ আছে কিন্তু Firestore এ profile নাই — invalid অবস্থা, লগ-আউট করে দাও
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  async function login(username, password) {
    const user = await loginWithUsername(username, password);
    setCurrentUser(user);
    return user;
  }

  async function logout() {
    await logoutUser();
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