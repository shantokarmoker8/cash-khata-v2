// src/pages/NotFound.jsx
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-2.5">
      <h1 className="text-[60px] font-bold text-primary-blue">404</h1>
      <p className="text-text-muted">Page not found</p>
      <Link to="/dashboard" className="text-primary-blue font-semibold">
        Go to Dashboard
      </Link>
    </div>
  );
}