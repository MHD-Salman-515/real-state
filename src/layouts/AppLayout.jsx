import { Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

import TopBar from "@/components/layout/TopBar";

export default function AppLayout() {
  const location = useLocation();
  const pathname = location.pathname;
  const [showHomeTopBar, setShowHomeTopBar] = useState(false);

  const isHomePath = pathname === "/" || pathname === "/home";

  const hideTopBar =
    pathname.startsWith("/owner") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/agent") ||
    pathname.startsWith("/accountant") ||
    pathname.startsWith("/supplier") ||
    pathname.startsWith("/worker");

  useEffect(() => {
    if (!isHomePath) {
      setShowHomeTopBar(false);
      return;
    }

    const onScroll = () => {
      const threshold = window.innerHeight * 0.72;
      setShowHomeTopBar(window.scrollY > threshold);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHomePath]);

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {!hideTopBar ? (isHomePath ? <TopBar overlay visible={showHomeTopBar} /> : <TopBar />) : null}
      <main className={hideTopBar || isHomePath ? "min-h-screen" : "min-h-[calc(100vh-64px)]"}>
        <Outlet />
      </main>
    </div>
  );
}
