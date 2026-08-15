// src/services/userService.js
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
import { db } from "../firebase/firebaseConfig";
import { usersCol } from "../firebase/firestoreRefs";

export function subscribeToUsers(callback) {
  const q = query(usersCol, orderBy("created_at", "asc"));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

async function isUsernameTaken(username, excludeId = null) {
  const q = query(usersCol, where("username", "==", username));
  const snap = await getDocs(q);
  if (snap.empty) return false;
  if (excludeId) return snap.docs.some((d) => d.id !== excludeId);
  return true;
}

export async function addUser({ username, password, fullName, role, isCurrentUserAdmin }) {
  const trimmedUsername = username.trim();
  const trimmedPassword = password.trim();
  const trimmedFullName = fullName.trim();
  let safeRole = role === "admin" ? "admin" : "staff";

  if (!trimmedUsername || !trimmedPassword || !trimmedFullName) {
    throw new Error("All fields are required");
  }
  if (!isCurrentUserAdmin) safeRole = "staff";
  if (await isUsernameTaken(trimmedUsername)) {
    throw new Error("Username already exists");
  }

  const docRef = await addDoc(usersCol, {
    username: trimmedUsername,
    password: trimmedPassword,
    full_name: trimmedFullName,
    role: safeRole,
    created_at: new Date().toISOString(),
  });

  return { id: docRef.id, username: trimmedUsername, full_name: trimmedFullName, role: safeRole };
}

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
  if (trimmedPassword) {
    updates.password = trimmedPassword;
  }

  await updateDoc(userRef, updates);
  return updates;
}

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