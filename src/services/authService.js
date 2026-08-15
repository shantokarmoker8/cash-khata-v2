// src/services/authService.js
import { getDocs, query, where } from "firebase/firestore";
import { usersCol } from "../firebase/firestoreRefs";

const SESSION_KEY = "ck_session";

/**
 * Username + Password দিয়ে সরাসরি Firestore এ চেক করা হয় — Firebase Auth নেই
 */
export async function loginWithUsername(username, password) {
  const trimmedUsername = username.trim();
  const trimmedPassword = password.trim();

  if (!trimmedUsername || !trimmedPassword) {
    throw new Error("Username and Password are required");
  }

  const q = query(usersCol, where("username", "==", trimmedUsername));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    throw new Error("Invalid Username or Password");
  }

  const userDoc = snapshot.docs[0];
  const userData = userDoc.data();

  if (userData.password !== trimmedPassword) {
    throw new Error("Invalid Username or Password");
  }

  const sessionUser = {
    id: userDoc.id,
    username: userData.username,
    full_name: userData.full_name,
    role: userData.role || "staff",
  };

  // localStorage এ session সেভ — PHP এর $_SESSION এর ব্রাউজার-সাইড সমতুল্য
  localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));

  return sessionUser;
}

export function logoutUser() {
  localStorage.removeItem(SESSION_KEY);
}

/**
 * পেজ রিফ্রেশ হলে localStorage থেকে session ফিরিয়ে আনা হয়
 */
export function getStoredSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}