import { useMemo, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
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
    `group flex items-center gap-3 dashboard-nav-link ${
      isActive
        ? "dashboard-nav-link-active"
        : ""
    }`;

  const shellPadding = sidebarCollapsed ? "lg:pl-24" : "lg:pl-72";

  return (
    <div className="dashboard-shell creos-theme relative overflow-hidden">
      <aside
        className={`dashboard-sidebar fixed inset-y-0 left-0 z-40 hidden lg:block ${
          sidebarCollapsed ? "w-20" : "w-68"
        } transition-all duration-300`}
      >
        <div className="flex h-16 items-center justify-between border-b border-[var(--creos-border-soft)] px-4">
          <Link to="/home" className="flex items-center gap-2">
            <Logo className="text-white/90" size={20} />
            {!sidebarCollapsed && (
              <span className="text-sm font-semibold tracking-[0.18em] text-[color:var(--creos-text)]">CREOS</span>
            )}
          </Link>
          <button
            type="button"
            onClick={() => setSidebarCollapsed((v) => !v)}
            className="dashboard-icon-btn h-8 w-8 rounded-xl text-[color:var(--creos-muted)]"
            aria-label={t("Toggle sidebar")}
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
              {!sidebarCollapsed && <span>{t(item.label)}</span>}
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
          className={`dashboard-sidebar absolute inset-y-0 left-0 w-[85%] max-w-sm p-4 transition-transform duration-300 ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Logo className="text-white/90" size={20} />
              <span className="text-sm font-semibold tracking-[0.18em] text-[color:var(--creos-text)]">CREOS</span>
            </div>
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="dashboard-icon-btn h-9 w-9 rounded-xl"
              aria-label={t("Close sidebar")}
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
                <span>{t(item.label)}</span>
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
                className="dashboard-icon-btn h-9 w-9 rounded-xl lg:hidden"
                aria-label={t("Open sidebar")}
              >
              <span className="text-sm">|||</span>
            </button>

            <div className="min-w-0 flex-1">
              <h1 className="truncate text-base font-semibold text-[color:var(--creos-text)]">{t(computedTitle)}</h1>
              <p className="truncate text-[11px] text-[color:var(--creos-muted)]">{t(subtitle)}</p>
            </div>

            <div className="hidden min-w-[240px] flex-1 md:block lg:max-w-sm">
              <input
                type="search"
                placeholder={t("Search dashboard...")}
                className="dashboard-search w-full"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                className="btn-glass px-3 py-2 text-xs"
              >
                {t("New Task")}
              </button>
              <button
                type="button"
                className="btn-gold px-3 py-2 text-xs"
              >
                {t("Quick Add")}
              </button>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserMenuOpen((v) => !v)}
                  className="dashboard-icon-btn h-10 w-10 rounded-full"
                  aria-label={t("Open user menu")}
                >
                  U
                </button>
                {userMenuOpen && (
                  <div className="dashboard-dropdown absolute end-0 mt-2 w-44 text-sm">
                    <button
                      type="button"
                      className="block w-full rounded-xl px-3 py-2 text-left text-[color:rgb(var(--creos-text-rgb)/0.84)] transition hover:bg-white/10"
                    >
                      {t("Profile")}
                    </button>
                    <button
                      type="button"
                      className="block w-full rounded-xl px-3 py-2 text-left text-[color:rgb(var(--creos-text-rgb)/0.84)] transition hover:bg-white/10"
                    >
                      {t("Preferences")}
                    </button>
                    <button
                      type="button"
                      className="block w-full rounded-lg px-3 py-2 text-left text-rose-300 transition hover:bg-rose-500/10"
                    >
                      {t("Logout")}
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
