// src/utils/formatCurrency.js

/**
 * PHP এর number_format($amount, 2) এর সমতুল্য — ৳ symbol সহ, 2 decimal, thousand separator
 */
export function formatCurrency(amount) {
  const value = Number(amount) || 0;
  const formatted = value.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `৳${formatted}`;
}

/**
 * Symbol ছাড়া শুধু নাম্বার ফরম্যাট (ইনপুট ফিল্ড বা টেবিল সেলে যেখানে ৳ আলাদাভাবে বসানো হয়)
 */
export function formatNumber(amount) {
  const value = Number(amount) || 0;
  return value.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}