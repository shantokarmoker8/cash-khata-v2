// js/firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyD8BMzS1L-_48vmKnM6rAbAoEwWko5q4Os",
  authDomain: "mobile-store-89acb.firebaseapp.com",
  projectId: "mobile-store-89acb",
  storageBucket: "mobile-store-89acb.firebasestorage.app",
  messagingSenderId: "1010453289979",
  appId: "1:1010453289979:web:d5928faa941e6b083f895e"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { app, db };