import { useEffect, useState } from "react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header 
      className={
        "sticky top-0 z-40 " +
        "backdrop-blur-md transition-colors duration-300 " +
        (scrolled
          ? "bg-slate-950/80 border-b border-white/10 shadow-sm shadow-black/30"
          : "bg-black/10 border-b border-white/5")
      }
    >
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">

        {/* ===== الشعار ===== */}
        <div className="flex items-center gap-3 group">
          <div
            className="
              h-10 w-10 rounded-2xl 
              bg-gradient-to-br from-white/20 to-white/10 
              shadow-lg shadow-white/10 
              flex items-center justify-center 
              group-hover:scale-110 transition
            "
          >
            <span className="text-black font-black text-xl">R</span>
          </div>

          <div className="leading-tight">
            <div className="text-xs uppercase text-white/90 tracking-wide">
              Luxury Real Estate
            </div>
            <div className="font-bold text-lg group-hover:text-white/80 transition">
              RealEstate
            </div>
          </div>
        </div>

        {/* ===== الروابط ===== */}
        <nav className="flex items-center gap-6 text-sm drop-shadow-[0_1px_1px_rgba(0,0,0,0.6)]">
          <a
            href="/"
            className="
              text-slate-200 hover:text-white/90 
              transition font-medium
            "
          >
            الرئيسية
          </a>

          <a
            href="/search"
            className="
              text-slate-200 hover:text-white/90 
              transition font-medium
            "
          >
            بحث
          </a>

          {/* زر الدخول */}
          <a
            href="/auth/login"
            className="
              px-4 py-2 rounded-xl
              bg-gradient-to-r from-white/20 to-white/10
              text-black font-semibold 
              shadow-lg shadow-white/10
              hover:scale-105 transition
            "
          >
            دخول
          </a>
        </nav>
      </div>
    </header>
  );
}
