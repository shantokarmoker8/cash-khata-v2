// src/context/SettingsContext.jsx
import { createContext, useEffect, useState } from "react";
import { fetchSettings, subscribeToSettings } from "../services/settingsService";

export const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState({
    business_name: "Cash Khata",
    business_address: "",
    business_phone: "",
    cash_balance: 0,
    opening_cash_set: false,
    language: "en",
  });
  const [settingsLoading, setSettingsLoading] = useState(true);

  useEffect(() => {
    let unsubscribe;

    async function init() {
      // প্রথমবার নিশ্চিত করা হয় settings ডকুমেন্ট Firestore এ আছে (না থাকলে তৈরি হয়ে যায়)
      await fetchSettings();
      // এরপর realtime listener বসানো হয় — settings পেজ থেকে বদলালে সাথে সাথে
      // Sidebar/Topbar এর businessName, cashBalance auto-update হবে
      unsubscribe = subscribeToSettings((data) => {
        setSettings(data);
        setSettingsLoading(false);
      });
    }

    init();
    return () => unsubscribe && unsubscribe();
  }, []);

  const value = {
    businessName: settings.business_name,
    businessAddress: settings.business_address,
    businessPhone: settings.business_phone,
    cashBalance: Number(settings.cash_balance) || 0,
    openingCashSet: !!settings.opening_cash_set,
    language: settings.language || "en",
    settingsLoading,
  };

  return (
    <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
  );
}