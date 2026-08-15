// src/services/settingsService.js
import { doc, getDoc, setDoc, updateDoc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { SETTINGS_DOC_ID } from "../firebase/firestoreRefs";

const settingsDocRef = doc(db, "settings", SETTINGS_DOC_ID);

const DEFAULT_SETTINGS = {
  business_name: "My Business",
  business_address: "",
  business_phone: "",
  cash_balance: 0,
  opening_cash_set: false,
  language: "en",
};

/**
 * Settings ডকুমেন্ট আনা হয়, না থাকলে default দিয়ে তৈরি করে দেওয়া হয়
 * (PHP এর database.sql এ যেমন id=1 দিয়ে seed করা ছিল)
 */
export async function fetchSettings() {
  const snap = await getDoc(settingsDocRef);
  if (snap.exists()) {
    return { id: snap.id, ...snap.data() };
  }
  await setDoc(settingsDocRef, {
    ...DEFAULT_SETTINGS,
    updated_at: new Date().toISOString(),
  });
  return { id: SETTINGS_DOC_ID, ...DEFAULT_SETTINGS };
}

/**
 * Settings পেজ থেকে business_name, business_address, business_phone আপডেট করার জন্য
 */
export async function updateSettings(partialData) {
  await updateDoc(settingsDocRef, {
    ...partialData,
    updated_at: new Date().toISOString(),
  });
}

/**
 * Realtime listener — Sidebar/Topbar এ businessName ও cashBalance সব জায়গায়
 * তাৎক্ষণিকভাবে sync থাকার জন্য (Firestore onSnapshot দিয়ে)
 */
export function subscribeToSettings(callback) {
  return onSnapshot(settingsDocRef, (snap) => {
    if (snap.exists()) {
      callback({ id: snap.id, ...snap.data() });
    }
  });
}