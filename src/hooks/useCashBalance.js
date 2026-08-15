// src/hooks/useCashBalance.js
import { useSettingsContext } from "./useSettingsContext";

/**
 * CashBalanceBox কম্পোনেন্ট এই হুক ব্যবহার করে —
 * SettingsContext এর realtime cashBalance এখান থেকেই আসে
 */
export function useCashBalance() {
  const { cashBalance, settingsLoading } = useSettingsContext();
  return { cashBalance, loading: settingsLoading };
}