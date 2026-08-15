// src/services/productService.js
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

export const productsCol = collection(db, "products");

/**
 * Sales পেজে sell করার জন্য শুধু স্টকে থাকা (stock > 0) প্রোডাক্ট আনা হয় —
 * PHP এর form_data.php এর সমতুল্য
 */
export async function fetchSellableProducts() {
  const q = query(productsCol, where("stock", ">", 0), orderBy("stock"), orderBy("name"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * Purchase পেজে সব প্রোডাক্ট লাগবে (stock=0 হলেও দেখাতে হবে, restock করার জন্য)
 */
export async function fetchAllProducts() {
  const q = query(productsCol, orderBy("name"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export function filterProducts(products, search) {
  const term = search.trim().toLowerCase();
  if (!term) return products;
  return products.filter(
    (p) =>
      (p.name || "").toLowerCase().includes(term) ||
      (p.description || "").toLowerCase().includes(term)
  );
}