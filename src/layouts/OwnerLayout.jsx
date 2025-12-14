// src/layouts/OwnerLayout.jsx
import { Link, NavLink, Outlet } from "react-router-dom";
import { useState } from "react";
// import { useAuthRole } from "../context/AuthRoleProvider";
import { useAuth } from "../context/AuthContext";



function Item({ to, label, onClick }) {
  return (
    <NavLink
      to={to}
      end
      onClick={onClick}
      className={({ isActive }) =>
        "block px-3 py-2 rounded-lg text-sm border transition " +
        (isActive
          ? "bg-amber-400/80 text-black border-amber-300 shadow-soft"
          : "bg-white/5 hover:bg-white/10 border-white/15 text-slate-100")
      }
    >
      {label}
    </NavLink>
  );
}

export default function OwnerLayout() {
  // const { user, role, logout } = useAuthRole();
 
  const { user, logout } = useAuth();
  const role = user?.role?.toLowerCase();

  const [open, setOpen] = useState(false);

  const Sidebar = ({ onNav }) => (
    <aside className="flex flex-col h-full border-e border-white/10 bg-white/5 backdrop-blur-xl card-glass">

      {/* رأس اللوحة */}
      <div className="px-4 py-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-amber-400/70 shadow-soft shadow-amber-400/60" />
          <div className="font-semibold">
            <span className="text-amber-200">Owner</span> Panel
          </div>
        </div>

        <div className="text-[11px] text-slate-300 mt-1">
          المستخدم:{" "}
          <strong className="text-emerald-200">
            {user?.full_name || "غير مسجل"}
          </strong>{" "}
          — الدور:{" "}
          <strong className="text-slate-100">{role || "—"}</strong>
        </div>
      </div>

      {/* القائمة */}
      <nav className="p-3 space-y-1 text-sm">

        {/* اللوحة الرئيسية */}
        <Item to="/owner" label="اللوحة الرئيسية" onClick={onNav} />

        {/* المواعيد — يظهر دائماً */}
        <Item to="/owner/appointments" label="المواعيد" onClick={onNav} />

        {/* العقارات */}
        <Item to="/owner/properties" label="العقارات" onClick={onNav} />

        <hr className="my-3 border-white/10" />

        <Link
          to="/"
          onClick={onNav}
          className="block px-3 py-2 rounded-lg text-sm border border-transparent text-slate-200 hover:text-emerald-200 hover:border-emerald-400/40 hover:bg-emerald-500/5 transition"
        >
          ← العودة للموقع
        </Link>
      </nav>

    </aside>
  );

  return (
    <div className="min-h-screen bg-luxury text-white grid lg:grid-cols-[260px_1fr]">
      {/* Sidebar: Desktop */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Main */}
      <div className="min-w-0 flex flex-col">

        {/* الهيدر */}
        <header className="sticky top-0 z-30 backdrop-blur bg-black/40 border-b border-white/10">
          <div className="px-4 py-3 flex items-center justify-between">

            <div className="flex items-center gap-3">
              <button
                className="lg:hidden inline-flex items-center justify-center rounded-lg border border-white/15 bg-white/5 px-2.5 py-1.5 text-sm hover:bg-white/10 transition"
                onClick={() => setOpen(true)}
                aria-label="open menu"
              >
                ☰
              </button>

              <div className="font-semibold text-sm md:text-base">
                لوحة المالك
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                className="px-3 py-1.5 rounded-lg border border-white/20 text-xs md:text-sm text-slate-100 hover:bg-white/10 transition"
                onClick={logout}
              >
                تسجيل خروج
              </button>

              <div
                className="h-9 w-9 rounded-full bg-amber-400/30 border border-amber-300/60 shadow-soft"
                title={user?.full_name || "Owner"}
              />
            </div>

          </div>
        </header>

        {/* المحتوى */}
        <main className="p-4 lg:p-6">
          <Outlet />
        </main>

      </div>

      {/* Sidebar: Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-y-0 start-0 w-72">
            <Sidebar onNav={() => setOpen(false)} />
          </div>
        </div>
      )}

    </div>
  );
}
