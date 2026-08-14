// src/services/authService.js
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, getDoc, query, where, getDocs, limit } from "firebase/firestore";
import { auth, db } from "../firebase/firebaseConfig";
import { usersCol } from "../firebase/firestoreRefs";

/**
 * Username দিয়ে Firestore থেকে user document খুঁজে বের করা হয়,
 * কারণ Firebase Auth সরাসরি username সাপোর্ট করে না — শুধু email/password করে।
 */
async function findUserByUsername(username) {
  const q = query(usersCol, where("username", "==", username), limit(1));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const docSnap = snapshot.docs[0];
  return { id: docSnap.id, ...docSnap.data() };
}

/**
 * Username + Password দিয়ে Login করা।
 * PHP এর api/auth/login.php এর সমতুল্য।
 */
export async function loginWithUsername(username, password) {
  const trimmedUsername = username.trim();
  const trimmedPassword = password.trim();

  if (!trimmedUsername || !trimmedPassword) {
    throw new Error("Username and Password are required");
  }

  const userDoc = await findUserByUsername(trimmedUsername);

  if (!userDoc || !userDoc.email) {
    throw new Error("Invalid Username or Password");
  }

  try {
    const credential = await signInWithEmailAndPassword(
      auth,
      userDoc.email,
      trimmedPassword
    );

    return {
      uid: credential.user.uid,
      id: userDoc.id,
      username: userDoc.username,
      full_name: userDoc.full_name,
      role: userDoc.role || "staff",
    };
  } catch (err) {
    // Firebase Auth এর নানা error code কে একটাই সাধারণ মেসেজে রূপান্তর করা হলো,
    // যাতে ইউজার আগের মতোই "Invalid Username or Password" মেসেজ দেখে
    throw new Error("Invalid Username or Password");
  }
}

/**
 * Logout — PHP এর api/auth/logout.php এর সমতুল্য
 */
export async function logoutUser() {
  await signOut(auth);
}

/**
 * uid দিয়ে Firestore থেকে ইউজারের প্রোফাইল ডেটা (full_name, role ইত্যাদি) আনা হয়
 */
export async function fetchUserProfile(uid) {
  const q = query(usersCol, where("uid", "==", uid), limit(1));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const docSnap = snapshot.docs[0];
  return { id: docSnap.id, ...docSnap.data() };
}

/**
 * Firebase Auth এর built-in listener — session persistence, page refresh এর পরেও
 * লগইন স্টেট মনে রাখার জন্য (আগে PHP session যেভাবে করত, ঠিক সেভাবে)
 */
export function subscribeToAuthChanges(callback) {
  return onAuthStateChanged(auth, callback);
}