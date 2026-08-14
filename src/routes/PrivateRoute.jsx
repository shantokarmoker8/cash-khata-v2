// src/routes/PrivateRoute.jsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Loader from "../components/common/Loader";

export default function PrivateRoute() {
  const { currentUser, authLoading } = useAuth();

  // Firebase প্রথমবার auth state resolve করার সময় একটা লোডার দেখানো হচ্ছে,
  // নাহলে রিফ্রেশ করলে এক মুহূর্তের জন্য login page flash করবে (bad UX)
  if (authLoading) {
    return <Loader fullScreen />;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}