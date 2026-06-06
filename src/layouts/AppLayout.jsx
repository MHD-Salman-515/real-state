import { Outlet, useLocation } from "react-router-dom";

import TopBar from "@/components/layout/TopBar";

export default function AppLayout() {
  const location = useLocation();
  const pathname = location.pathname;

  const hideTopBar =
    pathname === "/" ||
    pathname === "/home" ||
    pathname.startsWith("/client/chat") ||
    pathname.startsWith("/owner") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/agent") ||
    pathname.startsWith("/accountant") ||
    pathname.startsWith("/supplier") ||
    pathname.startsWith("/worker");

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {!hideTopBar ? <TopBar /> : null}
      <main className={hideTopBar ? "min-h-screen" : "min-h-[calc(100vh-64px)]"}>
        <Outlet />
      </main>
    </div>
  );
}
