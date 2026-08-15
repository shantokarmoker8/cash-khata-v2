// src/utils/formatDate.js

/**
 * PHP এর timeAgo() JS ফাংশনের হুবহু সমতুল্য —
 * "Just now" / "5m ago" / "3h ago" / "2d ago"
 */
export function timeAgo(dateInput) {
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
  const diffSeconds = Math.floor((new Date() - date) / 1000);

  if (diffSeconds < 60) return "Just now";
  if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
  if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}h ago`;
  return `${Math.floor(diffSeconds / 86400)}d ago`;
}

/**
 * Chart label এর জন্য — PHP date('M d', strtotime($d)) এর সমতুল্য, যেমন "Aug 15"
 */
export function formatChartLabel(dateInput) {
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
  return date.toLocaleDateString("en-US", { month: "short", day: "2-digit" });
}

/**
 * YYYY-MM-DD ফরম্যাটে — Firestore query range তৈরি করতে ব্যবহার হয়
 */
export function toDateKey(dateInput) {
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
  return date.toISOString().split("T")[0];
}