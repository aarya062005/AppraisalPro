import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";

export default function MainLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-[#16181f]">
      <Sidebar />
      <main className="flex-1 overflow-y-auto overflow-x-hidden p-6">
        <Outlet />
      </main>
    </div>
  );
}