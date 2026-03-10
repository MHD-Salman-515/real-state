// src/layouts/PublicLayout.jsx
import { Outlet, Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import Logo from "../components/brand/Logo.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { getRoleLandingPath } from "../utils/roleLanding.js";

const AUTH_BG_IMAGES = [
  "https://images.unsplash.com/photo-1502672023488-70e25813eb80?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1505691723518-36a5ac3be353?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?auto=format&fit=crop&w=1600&q=80",
];

const PUBLIC_NAV_ITEMS = [
  // ✅ IMPORTANT: removed `end: true` so Home does not behave differently across "/" vs "/home"
  { label: "Home", to: "/home" },
  { label: "Properties", to: "/properties" },
  { label: "Services", to: "/services" },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
];

export default function PublicLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [brandMenuOpen, setBrandMenuOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const { user, token, logout } = useAuth();
  const isAuthenticated = Boolean(user || token);

  const brandMenuRef = useRef(null);

  const isAuthPage = location.pathname.startsWith("/auth");
  const [authBgImage, setAuthBgImage] = useState(AUTH_BG_IMAGES[0]);

  useEffect(() => {
    if (isAuthPage) {
      const idx = Math.floor(Math.random() * AUTH_BG_IMAGES.length);
      setAuthBgImage(AUTH_BG_IMAGES[idx]);
    }
  }, [isAuthPage, location.pathname]);

  // Header classes: always transparent (no scroll-based glass effect)
  const defaultHeaderClass = "sticky top-0 z-50 w-full transition-all duration-300 bg-transparent";

  useEffect(() => {
    if (mobileMenuOpen) setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (brandMenuOpen) setBrandMenuOpen(false);
  }, [location.pathname]);

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

  const desktopNavClass = ({ isActive }) =>
    `relative px-1 py-2 text-sm tracking-wide transition ${
      isActive
        ? "text-white after:absolute after:-bottom-0.5 after:left-0 after:h-0.5 after:w-full after:rounded-full after:bg-white/10"
        : "text-slate-200/90 hover:text-white"
    }`;

  const mobileNavClass = ({ isActive }) =>
    `rounded-lg px-3 py-2 text-sm transition ${
      isActive ? "bg-white/10 text-white/90" : "text-slate-200 hover:bg-white/10 hover:text-white"
    }`;

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    setBrandMenuOpen(false);
    navigate("/", { replace: true });
  };

  const handleLogoNavigate = () => {
    setBrandMenuOpen(false);
    navigate(getRoleLandingPath(user), { replace: false });
  };

  return (
    <div className="creos-theme relative min-h-screen overflow-x-hidden bg-[var(--creos-bg)] text-[var(--creos-text)]">
      {isAuthPage && (
        <div className="pointer-events-none absolute inset-0 -z-20 overflow-hidden">
          <div
            className="absolute inset-0 scale-110 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url('${authBgImage}')` }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/75 to-black/95" />
        </div>
      )}

      {!isAuthPage && (
        <header className="hidden">
          <div className="flex h-20 w-full items-center justify-between px-4">
            <div className="group relative flex min-w-0 items-center gap-3" ref={brandMenuRef}>
              <button
                type="button"
                onClick={handleLogoNavigate}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-transparent transition hover:border-white/15 hover:bg-white/10"
                aria-label="Go to dashboard home"
              >
                <Logo className="h-5 w-5 text-white/90" />
              </button>

              <button
                type="button"
                onClick={() => setBrandMenuOpen((v) => !v)}
                className="min-w-0 rounded-lg px-1 py-1 text-left leading-tight focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2 focus-visible:ring-offset-black/40"
                aria-haspopup="menu"
                aria-expanded={brandMenuOpen}
                aria-controls="creos-menu"
                id="creos-menu-button"
              >
                <span className="block text-base font-semibold tracking-[0.18em] text-white">CREOS</span>
                <span className="hidden text-[10px] text-slate-300/90 sm:block">
                  Centralized Real Estate Operations System
                </span>
              </button>

              {brandMenuOpen ? (
                <div
                  id="creos-menu"
                  role="menu"
                  aria-labelledby="creos-menu-button"
                  className="absolute left-0 top-full z-[80] mt-2 w-64 rounded-2xl border border-white/10 bg-[#050912]/95 p-2 backdrop-blur-xl"
                >
                  <div className="border-b border-white/10 px-3 py-2">
                    <p className="truncate text-sm font-medium text-slate-100">
                      {user?.fullName ||
                        user?.name ||
                        (user?.email ? String(user.email).split("@")[0] : "User")}
                    </p>
                    <p className="text-xs uppercase tracking-wide text-slate-400">{user?.role || "guest"}</p>
                  </div>

                  <Link
                    to="/client/profile"
                    onClick={() => setBrandMenuOpen(false)}
                    role="menuitem"
                    className="mt-1 block rounded-xl px-3 py-2 text-sm text-slate-100 transition hover:bg-white/10 hover:text-white/90 focus:outline-none focus-visible:bg-white/10"
                  >
                    Profile Settings
                  </Link>

                  <Link
                    to="/client/favorites"
                    onClick={() => setBrandMenuOpen(false)}
                    role="menuitem"
                    className="mt-1 block rounded-xl px-3 py-2 text-sm text-slate-100 transition hover:bg-white/10 hover:text-white/90 focus:outline-none focus-visible:bg-white/10"
                  >
                    Favorites
                  </Link>

                  <Link
                    to="/client/appointments"
                    onClick={() => setBrandMenuOpen(false)}
                    role="menuitem"
                    className="mt-1 block rounded-xl px-3 py-2 text-sm text-slate-100 transition hover:bg-white/10 hover:text-white/90 focus:outline-none focus-visible:bg-white/10"
                  >
                    Appointments
                  </Link>

                  {isAuthenticated ? (
                    <button
                      type="button"
                      onClick={handleLogout}
                      role="menuitem"
                      className="mt-1 block w-full rounded-xl px-3 py-2 text-left text-sm text-slate-100 transition hover:bg-white/10 hover:text-white/90"
                    >
                      Log out
                    </button>
                  ) : (
                    <Link
                      to="/auth/login"
                      onClick={() => setBrandMenuOpen(false)}
                      role="menuitem"
                      className="mt-1 block rounded-xl px-3 py-2 text-sm text-slate-100 transition hover:bg-white/10 hover:text-white/90"
                    >
                      Log in
                    </Link>
                  )}
                </div>
              ) : null}
            </div>

            <nav className="hidden items-center gap-7 md:flex">
              {PUBLIC_NAV_ITEMS.map((item) => (
                <NavLink key={item.label} to={item.to} className={desktopNavClass}>
                  {item.label}
                </NavLink>
              ))}
            </nav>

            <div className="hidden items-center gap-4 md:flex">
              {isAuthenticated ? (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-sm text-slate-200/90 transition hover:text-white"
                >
                  Log out
                </button>
              ) : (
                <NavLink
                  to="/auth/login"
                  end
                  className={({ isActive }) =>
                    `text-sm transition ${isActive ? "text-white" : "text-slate-200/90 hover:text-white"}`
                  }
                >
                  Login
                </NavLink>
              )}

              <Link
                to="/properties"
                className="inline-flex items-center rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-black transition hover:bg-white/10"
              >
                Explore Properties
              </Link>
            </div>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-label="Open menu"
              aria-expanded={mobileMenuOpen}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-transparent text-white transition hover:bg-white/10 md:hidden"
            >
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M4 7H20M4 12H20M4 17H20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <div
            className={`fixed inset-0 z-[60] md:hidden transition-opacity duration-300 ${
              mobileMenuOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
            }`}
          >
            <div className="fixed inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
            <aside
              className={`fixed right-0 top-0 h-full w-[85%] max-w-sm border-l border-white/10 bg-[#050912]/95 backdrop-blur transition-transform duration-300 ${
                mobileMenuOpen ? "translate-x-0" : "translate-x-full"
              }`}
            >
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-4">
                <div className="text-sm font-semibold text-white">Menu</div>
                <button
                  type="button"
                  aria-label="Close menu"
                  onClick={() => setMobileMenuOpen(false)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/20 bg-black/30 text-white transition hover:bg-white/10"
                >
                  X
                </button>
              </div>

              <nav className="flex flex-col gap-1 px-4 py-4">
                {PUBLIC_NAV_ITEMS.map((item) => (
                  <NavLink
                    key={item.label}
                    to={item.to}
                    className={mobileNavClass}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </NavLink>
                ))}

                {isAuthenticated ? (
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="rounded-lg px-3 py-2 text-left text-sm text-slate-200 transition hover:bg-white/10 hover:text-white"
                  >
                    Log out
                  </button>
                ) : (
                  <NavLink
                    to="/auth/login"
                    end
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `rounded-lg px-3 py-2 text-sm transition ${
                        isActive ? "bg-white/10 text-white/90" : "text-slate-200 hover:bg-white/10 hover:text-white"
                      }`
                    }
                  >
                    Login
                  </NavLink>
                )}

                <Link
                  to="/properties"
                  onClick={() => setMobileMenuOpen(false)}
                  className="mt-2 inline-flex items-center justify-center rounded-lg bg-white/10 px-3 py-2 text-sm font-semibold text-black transition hover:bg-white/10"
                >
                  Explore Properties
                </Link>
              </nav>
            </aside>
          </div>
        </header>
      )}

      <main className="relative z-10 flex-1">
        <Outlet />
      </main>
    </div>
  );
}
