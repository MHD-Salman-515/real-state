// src/layouts/OwnerLayout.jsx
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import NotificationBell from "../components/NotificationBell.jsx";
import Logo from "../components/brand/Logo.jsx";
import { getRoleLandingPath } from "../utils/roleLanding.js";

function Item({ to, label, onClick }) {
  return (
    <NavLink
      to={to}
      end
      onClick={onClick}
      className={({ isActive }) =>
        "block rounded-xl border px-3 py-2.5 text-sm font-medium transition duration-200 " +
        (isActive
          ? "border-white/15 bg-white/10 text-white/90 shadow-[0_0_0_1px_rgba(52,211,153,0.16)]"
          : "border-white/10 bg-white/5 text-slate-200 hover:border-white/15 hover:bg-white/10 hover:text-white")
      }
    >
      {label}
    </NavLink>
  );
}

export default function OwnerLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const role = user?.role?.toLowerCase();
  const [open, setOpen] = useState(false);
  const [brandMenuOpen, setBrandMenuOpen] = useState(false);
  const brandMenuRef = useRef(null);
  const displayName =
    user?.name ||
    user?.fullName ||
    user?.full_name ||
    user?.username ||
    (user?.email ? String(user.email).split("@")[0] : "") ||
    "User";

  useEffect(() => {
    function onMouseDown(e) {
      if (brandMenuRef.current && !brandMenuRef.current.contains(e.target)) {
        setBrandMenuOpen(false);
      }
    }
    function onKeyDown(e) {
      if (e.key === "Escape") setBrandMenuOpen(false);
    }
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const handleLogoNavigate = () => {
    setBrandMenuOpen(false);
    navigate(getRoleLandingPath(user));
  };

  const handleDropdownLogout = () => {
    setBrandMenuOpen(false);
    logout();
    navigate("/home", { replace: true });
  };

  const Sidebar = ({ onNav }) => (
    <aside className="flex h-full flex-col border-e border-white/10 bg-[#050912]/90 backdrop-blur-xl">
      <div className="border-b border-white/10 px-4 py-5">
        <p className="text-[11px] uppercase tracking-[0.16em] text-white/90">
          CREOS Owner
        </p>
        <h2 className="mt-1 text-lg font-semibold text-white">Operations Panel</h2>
        <div className="mt-2 text-[11px] text-slate-300">
          User: <strong className="text-white/90">{displayName}</strong>{" "}
          <span className="text-slate-500">|</span> Role:{" "}
          <strong className="text-slate-100">{role || "-"}</strong>
        </div>
      </div>

      <nav className="space-y-2 p-3">
        <Item to="/owner" label="Dashboard" onClick={onNav} />
        <Item to="/owner/appointments" label="Appointments" onClick={onNav} />
        <Item to="/owner/properties" label="Properties" onClick={onNav} />
        <Item to="/owner/market-watch" label="Market Watch" onClick={onNav} />
        <Item to="/owner/decision-simulator" label="Decision Simulator" onClick={onNav} />
        <Item to="/owner/chat" label="AI Chat" onClick={onNav} />

        <hr className="my-3 border-white/10" />

        <Link
          to="/home"
          onClick={onNav}
          className="block rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-slate-200 transition duration-200 hover:border-white/15 hover:bg-white/10 hover:text-white/90"
        >
          Back to Site
        </Link>
      </nav>
    </aside>
  );

  return (
    <div className="grid min-h-screen bg-[#030712] text-white lg:grid-cols-[280px_1fr]">
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      <div className="min-w-0 flex flex-col">
        <header className="hidden">
          <div className="flex items-center justify-between gap-3 px-4 py-3 lg:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <button
                className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-2.5 py-1.5 text-sm transition hover:bg-white/10 lg:hidden"
                onClick={() => setOpen(true)}
                aria-label="open menu"
              >
                Menu
              </button>
              <div className="relative flex items-center gap-2" ref={brandMenuRef}>
                <button
                  type="button"
                  onClick={handleLogoNavigate}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/15 bg-black/30 transition hover:border-white/15 hover:bg-white/10"
                  aria-label="Go to dashboard home"
                >
                  <Logo className="h-5 w-5 text-white/90" />
                </button>
                <button
                  type="button"
                  onClick={() => setBrandMenuOpen((v) => !v)}
                  className="text-sm font-semibold tracking-[0.14em] text-white"
                  aria-haspopup="menu"
                  aria-expanded={brandMenuOpen}
                >
                  CREOS
                </button>
                {brandMenuOpen ? (
                  <div className="absolute left-0 top-full z-40 mt-2 w-64 rounded-2xl border border-white/10 bg-[#050912]/95 p-2 backdrop-blur-xl">
                    <div className="border-b border-white/10 px-3 py-2">
                      <p className="truncate text-sm font-medium text-slate-100">{displayName}</p>
                      <p className="text-xs uppercase tracking-wide text-slate-400">{role || "owner"}</p>
                    </div>
                    <Link
                      to="/client/profile"
                      onClick={() => setBrandMenuOpen(false)}
                      className="mt-1 block rounded-xl px-3 py-2 text-sm text-slate-100 transition hover:bg-white/10 hover:text-white/90"
                    >
                      Profile Settings
                    </Link>
                    <button
                      type="button"
                      onClick={handleDropdownLogout}
                      className="mt-1 block w-full rounded-xl px-3 py-2 text-left text-sm text-slate-100 transition hover:bg-white/10 hover:text-white/90"
                    >
                      Log out
                    </button>
                  </div>
                ) : null}
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs uppercase tracking-[0.14em] text-white/90">
                  Owner Workspace
                </p>
                <h1 className="truncate text-sm font-semibold text-white md:text-base">
                  Property Operations
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2 md:gap-3">
              <div className="hidden md:block">
                <input
                  type="search"
                  placeholder="Search..."
                  className="w-48 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-400 outline-none transition focus:border-white/15 focus:bg-white/10"
                />
              </div>
              <NotificationBell />
              <button
                className="rounded-xl border border-white/20 px-3 py-1.5 text-xs text-slate-100 transition hover:bg-white/10 md:text-sm"
                onClick={logout}
              >
                Logout
              </button>

              <div
                className="h-9 w-9 rounded-full border border-white/15 bg-white/10 shadow-[0_0_24px_rgba(16,185,129,0.18)]"
                title={displayName}
              />
            </div>
          </div>
        </header>

        <main className="p-4 lg:p-6">
          <Outlet />
        </main>
      </div>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 start-0 w-72">
            <Sidebar onNav={() => setOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
