// src/layouts/AdminLayout.jsx
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { validateHref } from "../utils/notificationRoutes.js";
import Logo from "../components/brand/Logo.jsx";
import { getRoleLandingPath } from "../utils/roleLanding.js";

const NAV_ITEMS = [
  { to: "/admin/appointments", label: "Appointments" },
  { to: "/admin/properties", label: "Properties" },
  { to: "/admin/maintenance", label: "Maintenance" },
  { to: "/admin/users", label: "Users" },
  { to: "/admin/commissions", label: "Commissions" },
  { to: "/admin/finance", label: "Finance" },
  { to: "/admin/aging", label: "A/R Aging" },
  { to: "/admin/operations", label: "Operations" },
  { to: "/admin/market-recovery", label: "Market Recovery" },
  { to: "/admin/intelligence-monitor", label: "AI Intelligence Monitor" },
];

const PAGE_TITLES = {
  "/admin": "Admin Dashboard",
  "/admin/appointments": "Appointments",
  "/admin/properties": "Properties",
  "/admin/maintenance": "Maintenance",
  "/admin/users": "Users",
  "/admin/commissions": "Commissions",
  "/admin/finance": "Finance & Reports",
  "/admin/aging": "A/R Aging",
  "/admin/operations": "Operations",
  "/admin/market-recovery": "Market Recovery",
  "/admin/intelligence-monitor": "AI Intelligence Monitor",
};

const DEFAULT_ADMIN_NOTIFICATIONS = [
  { id: "ad-1", text: "A new user was added to the system." },
  { id: "ad-2", text: "A maintenance ticket needs assignment." },
];

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

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [brandMenuOpen, setBrandMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const notifRef = useRef(null);
  const userMenuRef = useRef(null);
  const brandMenuRef = useRef(null);

  const displayName =
    user?.fullName ||
    user?.name ||
    (user?.email ? String(user.email).split("@")[0] : "") ||
    user?.username ||
    "User";

  const initials = useMemo(() => {
    const parts = String(displayName).trim().split(/\s+/);
    if (!parts[0]) return "U";
    if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }, [displayName]);

  const unreadCount = notifications.length;
  const pageTitle = PAGE_TITLES[location.pathname] || "Admin Panel";
  const userStorageKey = useMemo(() => {
    const scopedUserKey = user?.id ?? user?.email ?? user?.username;
    if (!scopedUserKey) return null;
    return `creos_admin_notifications__${String(scopedUserKey)}`;
  }, [user?.id, user?.email, user?.username]);

  useEffect(() => {
    if (!userStorageKey) {
      setNotifications([]);
      return;
    }
    try {
      const raw = localStorage.getItem(userStorageKey);
      if (raw === null) {
        setNotifications(DEFAULT_ADMIN_NOTIFICATIONS);
        return;
      }
      const parsed = JSON.parse(raw);
      setNotifications(Array.isArray(parsed) ? parsed : []);
    } catch {
      setNotifications(DEFAULT_ADMIN_NOTIFICATIONS);
    }
  }, [userStorageKey]);

  useEffect(() => {
    if (!userStorageKey) return;
    try {
      localStorage.setItem(userStorageKey, JSON.stringify(notifications));
    } catch {
      // Keep in-memory notifications if storage is unavailable.
    }
  }, [notifications, userStorageKey]);

  useEffect(() => {
    function onAdd(e) {
      const d = e.detail || {};
      const ts = Number(d.time || d.createdAt || Date.now());
      const item = {
        id: `ad-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        text: d.message || d.text || "New admin notification",
        type: d.type || "info",
        title: d.title || "",
        createdAt: ts,
        href: d.href || "",
        hrefLabel: d.hrefLabel || "",
        meta: d.meta,
      };
      setNotifications((prev) => [item, ...prev]);
    }

    window.addEventListener("admin:addNotif", onAdd);
    window.addEventListener("notify:add", onAdd);
    return () => {
      window.removeEventListener("admin:addNotif", onAdd);
      window.removeEventListener("notify:add", onAdd);
    };
  }, []);

  useEffect(() => {
    function onMouseDown(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
      if (brandMenuRef.current && !brandMenuRef.current.contains(e.target)) {
        setBrandMenuOpen(false);
      }
    }

    function onKeyDown(e) {
      if (e.key === "Escape") {
        setNotifOpen(false);
        setUserMenuOpen(false);
        setBrandMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const clearNotifications = () => {
    setNotifications([]);
    if (!userStorageKey) return;
    try {
      localStorage.setItem(userStorageKey, JSON.stringify([]));
    } catch {
      // Keep clear action functional even if storage write fails.
    }
  };

  const resolveHref = (notification) => {
    const check = validateHref(notification?.href, "admin");
    return check.ok ? notification?.href : check.fallbackHref;
  };

  const handleNotificationNavigate = (notification) => {
    const target = resolveHref(notification);
    if (!target) return;
    navigate(target);
    setNotifOpen(false);
  };

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
          CREOS Admin
        </p>
        <h2 className="mt-1 text-lg font-semibold text-white">Control Panel</h2>
        <div className="mt-2 text-[11px] text-slate-300">
          User: <strong className="text-white/90">{displayName}</strong>
        </div>
      </div>

      <nav className="space-y-2 p-3">
        {NAV_ITEMS.map((item) => (
          <Item key={item.to} to={item.to} label={item.label} onClick={onNav} />
        ))}

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
                onClick={() => setMobileOpen(true)}
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
                      <p className="text-xs uppercase tracking-wide text-slate-400">
                        {String(user?.role || "admin")}
                      </p>
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
                  Admin Workspace
                </p>
                <h1 className="truncate text-sm font-semibold text-white md:text-base">
                  {pageTitle}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2 md:gap-3">
              <div className="hidden md:block">
                <input
                  type="search"
                  placeholder="Search admin tools..."
                  className="w-52 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-400 outline-none transition focus:border-white/15 focus:bg-white/10"
                />
              </div>

              <div className="relative" ref={notifRef}>
                <button
                  type="button"
                  onClick={() => setNotifOpen((v) => !v)}
                  className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-slate-200 transition duration-200 hover:border-white/15 hover:bg-white/10 hover:text-white/90"
                  aria-label="notifications"
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2c0 .5-.2 1-.6 1.4L4 17h5" />
                    <path d="M9 17a3 3 0 0 0 6 0" />
                  </svg>
                  {unreadCount > 0 ? (
                    <span className="absolute -right-1 -top-1 min-w-[18px] rounded-full bg-white/10 px-1 text-center text-[10px] font-bold leading-[18px] text-black">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  ) : null}
                </button>

                {notifOpen ? (
                  <div className="absolute right-0 z-30 mt-2 w-[340px] rounded-2xl border border-white/10 bg-[#050912]/95 backdrop-blur-xl">
                    <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                      <h3 className="text-sm font-semibold text-white">Admin Notifications</h3>
                      <div className="flex items-center gap-2">
                        {notifications.length > 0 ? (
                          <button
                            onClick={clearNotifications}
                            className="text-xs text-rose-300 transition hover:text-rose-200"
                          >
                            مسح الإشعارات
                          </button>
                        ) : null}
                        <button
                          onClick={() => setNotifOpen(false)}
                          className="text-xs text-slate-400 transition hover:text-white/90"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                    <div className="max-h-80 overflow-auto">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-sm text-slate-400">لا توجد إشعارات</div>
                      ) : (
                        notifications.map((n) => {
                          const target = resolveHref(n);
                          const isClickable = Boolean(target);
                          return (
                          <div
                            key={n.id}
                            className={[
                              "flex gap-2 border-b border-white/5 px-4 py-2.5 text-sm text-slate-100 last:border-b-0 hover:bg-white/5",
                              isClickable ? "cursor-pointer" : "",
                            ].join(" ")}
                            onClick={() => handleNotificationNavigate(n)}
                          >
                            <span className="mt-1 h-2 w-2 rounded-full bg-white/10" />
                            <div className="min-w-0 flex-1">
                              <p>{n.text || n.message}</p>
                              {isClickable ? (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleNotificationNavigate(n);
                                  }}
                                  className="mt-1 text-xs font-medium text-white/90 transition hover:text-white/90"
                                >
                                  {n.hrefLabel || "Open"}
                                </button>
                              ) : null}
                              {n.createdAt ? (
                                <p className="mt-0.5 text-[11px] text-slate-500">
                                  {new Date(n.createdAt).toLocaleString()}
                                </p>
                              ) : null}
                            </div>
                          </div>
                        );
                        })
                      )}
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="relative" ref={userMenuRef}>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setUserMenuOpen((v) => !v)}
                    className="inline-flex h-9 min-w-9 items-center justify-center rounded-xl border border-white/20 bg-white/5 px-2.5 text-xs text-slate-100 transition hover:bg-white/10"
                    aria-label="open user menu"
                  >
                    {initials}
                  </button>
                  <div className="hidden text-right md:block">
                    <p className="max-w-[130px] truncate text-xs text-slate-200">{displayName}</p>
                    <p className="text-[11px] text-slate-400">System Admin</p>
                  </div>
                  <button
                    type="button"
                    onClick={logout}
                    className="rounded-xl border border-white/20 px-3 py-1.5 text-xs text-slate-100 transition hover:bg-white/10 md:text-sm"
                  >
                    Logout
                  </button>
                </div>
                {userMenuOpen ? (
                  <div className="absolute right-0 z-30 mt-2 w-48 rounded-xl border border-white/10 bg-[#0b121b]/95 p-1 text-sm shadow-xl shadow-black/40">
                    <div className="border-b border-white/10 px-3 py-2 text-xs text-slate-400">{displayName}</div>
                    <button type="button" className="block w-full rounded-lg px-3 py-2 text-left text-slate-200 transition hover:bg-white/10">
                      Profile
                    </button>
                    <button type="button" className="block w-full rounded-lg px-3 py-2 text-left text-slate-200 transition hover:bg-white/10">
                      Settings
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </header>

        <main className="p-4 lg:p-6">
          <Outlet />
        </main>
      </div>

      {mobileOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <div className="absolute inset-y-0 start-0 w-72">
            <Sidebar onNav={() => setMobileOpen(false)} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
