// src/hooks/useSettingsContext.js
import { useContext } from "react";
import { SettingsContext } from "../context/SettingsContext";

export function useSettingsContext() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettingsContext must be used within a SettingsProvider");
  }
  return context;
}