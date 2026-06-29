import { Outlet } from "react-router-dom";
import HRSidebar from "../components/HRSidebar";

export default function HRLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-[#16181f]">
      <HRSidebar />
      <main className="flex-1 overflow-y-auto overflow-x-hidden px-6 py-4">
        <Outlet />
      </main>
    </div>
  );
}