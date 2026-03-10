import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Building2, CircleUserRound, LogOut } from "lucide-react";

import NotificationsBell from "@/components/notifications/NotificationsBell";
import { useAuth } from "@/context/AuthContext.jsx";
import { getUserIdentity, normalizeRoleLabel } from "@/lib/notifications/storage";

const DASHBOARD_BY_ROLE = {
  admin: "/admin",
  owner: "/owner",
  agent: "/agent",
  accountant: "/accountant",
  supplier: "/supplier",
  worker: "/worker",
  client: "/client/appointments",
};

function normalizeRoleKey(role) {
  const value = String(role || "").trim().toLowerCase();
  if (!value) return "client";
  if (value === "clint") return "client";
  if (value === "suppliser") return "supplier";
  if (value === "accounter") return "accountant";
  return value;
}

function profileLinksByRole(role) {
  const normalized = normalizeRoleKey(role);

  const base = [{ label: "Settings", to: "/client/profile" }];

  if (normalized === "owner") {
    return [
      ...base,
      { label: "My Properties", to: "/owner/properties" },
      { label: "My Bookings", to: "/owner/appointments" },
      { label: "Owner Dashboard", to: "/owner" },
    ];
  }

  if (normalized === "admin") {
    return [...base, { label: "Admin Dashboard", to: "/admin" }];
  }

  if (normalized === "accountant") {
    return [...base, { label: "Accountant Dashboard", to: "/accountant" }];
  }

  if (normalized === "supplier") {
    return [...base, { label: "Supplier Dashboard", to: "/supplier" }];
  }

  if (normalized === "worker") {
    return [...base, { label: "Worker Dashboard", to: "/worker" }];
  }

  if (normalized === "agent") {
    return [...base, { label: "Agent Dashboard", to: "/agent" }];
  }

  return [
    ...base,
    { label: "Favorites", to: "/client/favorites" },
    { label: "My Bookings", to: "/client/appointments" },
  ];
}

export default function TopBar() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onMouseDown = (event) => {
      if (!menuRef.current?.contains(event.target)) setProfileOpen(false);
    };
    const onEsc = (event) => {
      if (event.key === "Escape") setProfileOpen(false);
    };

    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  const identity = getUserIdentity(user, token);
  const roleKey = normalizeRoleKey(user?.role || identity.role);
  const role = normalizeRoleLabel(roleKey || "Guest");
  const isAuthenticated = Boolean(user || token);
  const dashboardPath = isAuthenticated ? DASHBOARD_BY_ROLE[roleKey] || "/" : "/auth/login";
  const displayName =
    user?.fullName ||
    user?.full_name ||
    user?.name ||
    (user?.email ? String(user.email).split("@")[0] : identity.name || "Guest");
  const profileLinks = useMemo(() => profileLinksByRole(roleKey), [roleKey]);

  const onLogout = async () => {
    try {
      await logout();
    } finally {
      setProfileOpen(false);
      navigate("/auth/login", { replace: true });
    }
  };

  return (
    <header
      className={`sticky top-0 z-50 h-16 w-full transition-all duration-300 ${
        scrolled ? "bg-black/35 backdrop-blur-xl" : "bg-transparent"
      }`}
    >
      <div className="flex h-16 w-full items-center justify-between px-4">
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-xl px-2 py-1.5 text-white/90 transition hover:bg-white/5 hover:text-white"
          aria-label="CREOS home"
        >
          <Building2 className="h-5 w-5" />
          <span className="text-sm font-semibold tracking-[0.2em]">CREOS</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link to="/properties" className="text-sm text-white/70 transition hover:text-white">
            Properties
          </Link>
          <Link to="/search" className="text-sm text-white/70 transition hover:text-white">
            Search
          </Link>
          <Link to={dashboardPath} className="text-sm text-white/70 transition hover:text-white">
            Dashboard
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <NotificationsBell />

          {isAuthenticated ? (
            <div ref={menuRef} className="relative">
              <button
                type="button"
                onClick={() => setProfileOpen((v) => !v)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/35 text-white transition hover:bg-white/5"
                aria-label="Profile menu"
                aria-expanded={profileOpen}
              >
                <CircleUserRound className="h-5 w-5" />
              </button>

              {profileOpen ? (
                <div className="absolute right-0 z-[95] mt-3 w-[92vw] max-w-[280px] overflow-hidden rounded-2xl border border-white/10 bg-black/70 shadow-2xl backdrop-blur-xl">
                  <div className="border-b border-white/10 px-4 py-3">
                    <p className="truncate text-sm font-semibold text-white">{displayName}</p>
                    <p className="text-xs text-white/60">{role}</p>
                  </div>

                  <div className="p-2">
                    {profileLinks.map((item) => (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={() => setProfileOpen(false)}
                        className="block rounded-xl px-3 py-2 text-sm text-white/75 transition hover:bg-white/5 hover:text-white"
                      >
                        {item.label}
                      </Link>
                    ))}
                    <button
                      type="button"
                      onClick={onLogout}
                      className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-white/75 transition hover:bg-white/5 hover:text-white"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/auth/register"
                className="hidden rounded-xl border border-white/10 bg-black/35 px-3 py-2 text-sm text-white/70 transition hover:bg-white/5 hover:text-white sm:inline-flex"
              >
                Register
              </Link>
              <Link
                to="/auth/login"
                className="inline-flex rounded-xl border border-white/10 bg-black/35 px-3 py-2 text-sm text-white/80 transition hover:bg-white/5 hover:text-white"
              >
                Log in
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
