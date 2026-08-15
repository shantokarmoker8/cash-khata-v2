// src/firebase/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyClWG1Vr0C4upuMO5ZAjhCUKCT8nqR5NRc",
  authDomain: "cash-khata-72b29.firebaseapp.com",
  projectId: "cash-khata-72b29",
  storageBucket: "cash-khata-72b29.firebasestorage.app",
  messagingSenderId: "87349598162",
  appId: "1:87349598162:web:f0180c52b5e5617a92da0b",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);

export default app;