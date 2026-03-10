import { Outlet } from "react-router-dom";

import TopBar from "@/components/layout/TopBar";

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      <TopBar />
      <main className="min-h-[calc(100vh-64px)]">
        <Outlet />
      </main>
    </div>
  );
}
