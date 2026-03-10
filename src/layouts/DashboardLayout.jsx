import { useMemo, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import Logo from "../components/brand/Logo.jsx";

const DEFAULT_ITEMS = [
  { label: "Overview", to: "" },
  { label: "Dashboard", to: "dashboard" },
  { label: "Properties", to: "properties" },
  { label: "Appointments", to: "appointments" },
  { label: "Reports", to: "reports" },
  { label: "Settings", to: "settings" },
];

export default function DashboardLayout({
  title,
  subtitle = "Centralized Real Estate Operations",
  items = DEFAULT_ITEMS,
}) {
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const computedTitle = useMemo(() => {
    if (title) return title;
    const segments = location.pathname.split("/").filter(Boolean);
    const last = segments[segments.length - 1] || "dashboard";
    return last
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }, [location.pathname, title]);

  const sideLinkClass = ({ isActive }) =>
    `group flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition ${
      isActive
        ? "bg-white/10 text-white/90 border border-white/15"
        : "text-slate-300 hover:bg-white/5 hover:text-white border border-transparent"
    }`;

  const shellPadding = sidebarCollapsed ? "lg:pl-24" : "lg:pl-72";

  return (
    <div className="creos-theme relative min-h-screen overflow-hidden bg-[var(--creos-bg)] text-[var(--creos-text)]">
      <aside
        className={`fixed inset-y-0 left-0 z-40 hidden border-r border-white/10 bg-[#060b12]/95 backdrop-blur-xl lg:block ${
          sidebarCollapsed ? "w-20" : "w-68"
        } transition-all duration-300`}
      >
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-4">
          <Link to="/home" className="flex items-center gap-2">
            <Logo className="text-white/90" size={20} />
            {!sidebarCollapsed && (
              <span className="text-sm font-semibold tracking-[0.18em] text-white">CREOS</span>
            )}
          </Link>
          <button
            type="button"
            onClick={() => setSidebarCollapsed((v) => !v)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/20 bg-black/40 text-slate-200 transition hover:bg-white/10"
            aria-label="Toggle sidebar"
          >
            {sidebarCollapsed ? ">" : "<"}
          </button>
        </div>

        <nav className="space-y-1 p-3">
          {items.map((item) => (
            <NavLink
              key={`${item.to}-${item.label}`}
              to={item.to}
              end={item.to === "" || item.to === "/"}
              className={sideLinkClass}
            >
              <span className="inline-flex h-2 w-2 rounded-full bg-white/10" />
              {!sidebarCollapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div
        className={`fixed inset-0 z-50 lg:hidden transition-opacity duration-300 ${
          mobileOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <div className="absolute inset-0 bg-black/55" onClick={() => setMobileOpen(false)} />
        <aside
          className={`absolute inset-y-0 left-0 w-[85%] max-w-sm border-r border-white/10 bg-[#060b12]/95 p-4 backdrop-blur-xl transition-transform duration-300 ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Logo className="text-white/90" size={20} />
              <span className="text-sm font-semibold tracking-[0.18em] text-white">CREOS</span>
            </div>
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/20 bg-black/40 text-white transition hover:bg-white/10"
              aria-label="Close sidebar"
            >
              X
            </button>
          </div>
          <nav className="space-y-1">
            {items.map((item) => (
              <NavLink
                key={`m-${item.to}-${item.label}`}
                to={item.to}
                end={item.to === "" || item.to === "/"}
                className={sideLinkClass}
                onClick={() => setMobileOpen(false)}
              >
                <span className="inline-flex h-2 w-2 rounded-full bg-white/10" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </aside>
      </div>

      <div className={`relative z-10 min-h-screen ${shellPadding} transition-all duration-300`}>
        <header className="hidden">
          <div className="mx-auto flex h-16 w-full max-w-[1400px] items-center gap-3 px-4 lg:px-6">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/20 bg-black/40 text-white transition hover:bg-white/10 lg:hidden"
              aria-label="Open sidebar"
            >
              <span className="text-sm">|||</span>
            </button>

            <div className="min-w-0 flex-1">
              <h1 className="truncate text-base font-semibold text-white">{computedTitle}</h1>
              <p className="truncate text-[11px] text-slate-400">{subtitle}</p>
            </div>

            <div className="hidden min-w-[240px] flex-1 md:block lg:max-w-sm">
              <input
                type="search"
                placeholder="Search dashboard..."
                className="h-10 w-full rounded-xl border border-white/15 bg-black/40 px-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-white/15 focus:outline-none focus:ring-2 focus:ring-white/30"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                className="rounded-lg border border-white/20 bg-black/35 px-3 py-2 text-xs text-slate-200 transition hover:bg-white/10"
              >
                New Task
              </button>
              <button
                type="button"
                className="rounded-lg bg-white/10 px-3 py-2 text-xs font-semibold text-black transition hover:bg-white/10"
              >
                Quick Add
              </button>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserMenuOpen((v) => !v)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/45 text-white/90 transition hover:bg-white/10"
                  aria-label="Open user menu"
                >
                  U
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-44 rounded-xl border border-white/10 bg-[#0b121b]/95 p-1 text-sm shadow-xl shadow-black/40">
                    <button
                      type="button"
                      className="block w-full rounded-lg px-3 py-2 text-left text-slate-200 transition hover:bg-white/10"
                    >
                      Profile
                    </button>
                    <button
                      type="button"
                      className="block w-full rounded-lg px-3 py-2 text-left text-slate-200 transition hover:bg-white/10"
                    >
                      Preferences
                    </button>
                    <button
                      type="button"
                      className="block w-full rounded-lg px-3 py-2 text-left text-rose-300 transition hover:bg-rose-500/10"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="w-full p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
