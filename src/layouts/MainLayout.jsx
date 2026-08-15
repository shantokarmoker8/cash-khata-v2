// src/layouts/MainLayout.jsx
import { Outlet } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";
import BottomNav from "../components/layout/BottomNav";

export default function MainLayout() {
  return (
    <div>
      <Sidebar />
      <Topbar />

      <main className="lg:ml-[250px] mt-[68px] p-4 pb-[90px] lg:p-[26px] lg:pb-[26px] min-h-[calc(100vh-68px)] transition-[margin-left] duration-200">
        <div className="relative">
          <Outlet />
        </div>
      </main>

      <BottomNav />
    </div>
  );
}