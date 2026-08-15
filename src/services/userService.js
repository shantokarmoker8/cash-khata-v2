// src/services/userService.js
import {
  createUserWithEmailAndPassword,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updateEmail,
} from "firebase/auth";
import {
  addDoc,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { auth, db } from "../firebase/firebaseConfig";
import { usersCol } from "../firebase/firestoreRefs";

// Firebase Auth email হিসেবে ব্যবহারের জন্য username কে synthetic email এ রূপান্তর
function usernameToEmail(username) {
  return `${username.toLowerCase().replace(/\s+/g, "")}@cashkhata.app`;
}

export function subscribeToUsers(callback) {
  const q = query(usersCol, orderBy("created_at", "asc"));
  return onSnapshot(q, (snapshot) => {
    const rows = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(rows);
  });
}

async function isUsernameTaken(username, excludeId = null) {
  const q = query(usersCol, where("username", "==", username));
  const snap = await getDocs(q);
  if (snap.empty) return false;
  if (excludeId) return snap.docs.some((d) => d.id !== excludeId);
  return true;
}

/**
 * নতুন User তৈরি — Firebase Auth account (synthetic email) + Firestore profile document।
 * ⚠️ শুধু Admin-ই role='admin' সেট করতে পারবে (UI-তেও এটা enforce করা হবে, এখানেও double-check)
 */
export async function addUser({ username, password, fullName, role, isCurrentUserAdmin }) {
  const trimmedUsername = username.trim();
  const trimmedPassword = password.trim();
  const trimmedFullName = fullName.trim();
  let safeRole = role === "admin" ? "admin" : "staff";

  if (!trimmedUsername || !trimmedPassword || !trimmedFullName) {
    throw new Error("All fields are required");
  }
  if (!isCurrentUserAdmin) {
    safeRole = "staff";
  }
  if (await isUsernameTaken(trimmedUsername)) {
    throw new Error("Username already exists");
  }

  const email = usernameToEmail(trimmedUsername);

  // ⚠️ নোট: createUserWithEmailAndPassword কল করলে Firebase Auth এ নতুন account
  // login অবস্থায় চলে যায় (client SDK এর সীমাবদ্ধতা) — admin আবার নিজের অ্যাকাউন্টে
  // ফিরে যেতে চাইলে re-login করতে হবে। Production এ এটা এড়াতে Cloud Function
  // (Admin SDK) ব্যবহার করা উচিত, কিন্তু client-only সেটআপে এটাই standard practical সমাধান।
  const credential = await createUserWithEmailAndPassword(auth, email, trimmedPassword);

  const docRef = await addDoc(usersCol, {
    uid: credential.user.uid,
    username: trimmedUsername,
    email,
    full_name: trimmedFullName,
    role: safeRole,
    created_at: new Date().toISOString(),
  });

  return { id: docRef.id, username: trimmedUsername, full_name: trimmedFullName, role: safeRole };
}

/**
 * User আপডেট — নাম/ইউজারনেম/রোল, পাসওয়ার্ড ঐচ্ছিক (blank রাখলে বদলাবে না)
 */
export async function updateUser({ id, fullName, username, password, role, isSelf, isCurrentUserAdmin }) {
  const trimmedFullName = fullName.trim();
  const trimmedUsername = username.trim();
  const trimmedPassword = password?.trim() || "";

  if (!trimmedFullName || !trimmedUsername) {
    throw new Error("Name and Username are required");
  }
  if (!isSelf && !isCurrentUserAdmin) {
    throw new Error("Only admin can edit other users");
  }
  if (await isUsernameTaken(trimmedUsername, id)) {
    throw new Error("This username is already taken");
  }

  const userRef = doc(db, "users", id);
  const updates = { full_name: trimmedFullName, username: trimmedUsername };

  if (isCurrentUserAdmin && (role === "admin" || role === "staff")) {
    updates.role = role;
  }

  await updateDoc(userRef, updates);

  // ⚠️ পাসওয়ার্ড পরিবর্তন Firebase Auth এ শুধু নিজের অ্যাকাউন্টের জন্যই ক্লায়েন্ট থেকে সম্ভব
  // (updatePassword শুধু currently-signed-in user এর উপর কাজ করে)। অন্য user এর পাসওয়ার্ড
  // পরিবর্তন করতে Cloud Function (Admin SDK) লাগবে — এটা এই migration এর scope এর বাইরে।
  if (trimmedPassword && isSelf && auth.currentUser) {
    await updatePassword(auth.currentUser, trimmedPassword);
  }

  return updates;
}

/**
 * User ডিলিট — শেষ user/শেষ admin protection সহ
 */
export async function deleteUser({ id, currentUserId }) {
  if (id === currentUserId) {
    throw new Error("You cannot delete your own account while logged in");
  }

  const allSnap = await getDocs(usersCol);
  if (allSnap.size <= 1) {
    throw new Error("At least one user must remain");
  }

  const targetDoc = allSnap.docs.find((d) => d.id === id);
  if (targetDoc?.data().role === "admin") {
    const adminCount = allSnap.docs.filter((d) => d.data().role === "admin").length;
    if (adminCount <= 1) {
      throw new Error("At least one admin must remain");
    }
  }

  await deleteDoc(doc(db, "users", id));
}