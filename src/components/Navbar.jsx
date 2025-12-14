export default function Navbar() {
  return (
    <header 
      className="
        sticky top-0 z-40 
        bg-black/20 backdrop-blur-xl 
        border-b border-white/10
        shadow-md shadow-emerald-500/10
      "
    >
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">

        {/* ===== الشعار ===== */}
        <div className="flex items-center gap-3 group">
          <div
            className="
              h-10 w-10 rounded-2xl 
              bg-gradient-to-br from-emerald-400 to-cyan-400 
              shadow-lg shadow-emerald-500/40 
              flex items-center justify-center 
              group-hover:scale-110 transition
            "
          >
            <span className="text-black font-black text-xl">R</span>
          </div>

          <div className="leading-tight">
            <div className="text-xs uppercase text-emerald-300 tracking-wide">
              Luxury Real Estate
            </div>
            <div className="font-bold text-lg group-hover:text-cyan-300 transition">
              RealEstate
            </div>
          </div>
        </div>

        {/* ===== الروابط ===== */}
        <nav className="flex items-center gap-6 text-sm">
          <a
            href="/"
            className="
              text-slate-200 hover:text-emerald-300 
              transition font-medium
            "
          >
            الرئيسية
          </a>

          <a
            href="/search"
            className="
              text-slate-200 hover:text-emerald-300 
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
              bg-gradient-to-r from-emerald-500 to-cyan-500
              text-black font-semibold 
              shadow-lg shadow-emerald-500/30
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
