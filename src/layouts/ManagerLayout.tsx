import { Outlet } from "react-router-dom";
import ManagerSidebar from "../components/ManagerSidebar";

export default function ManagerLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-[#16181f]">
      <ManagerSidebar />
      <main className="flex-1 overflow-y-auto overflow-x-hidden p-6">
        <Outlet />
      </main>
    </div>
  );
}