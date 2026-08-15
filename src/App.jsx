// src/App.jsx
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { SettingsProvider } from "./context/SettingsContext";
import AppRoutes from "./routes/AppRoutes";
import ToastProvider from "./components/common/Toast";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SettingsProvider>
          <AppRoutes />
          <ToastProvider />
        </SettingsProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}