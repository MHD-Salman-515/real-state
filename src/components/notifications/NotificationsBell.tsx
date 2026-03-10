import { useEffect, useMemo, useRef, useState } from "react";
import { Bell, CheckCheck, Trash2 } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

import { useNotifications } from "@/components/notifications/useNotifications";
import { useAuth } from "@/context/AuthContext.jsx";
import type { NotificationItem } from "@/lib/notifications/types";

function formatTime(ts: number): string {
  const d = new Date(ts);
  const now = Date.now();
  const diff = Math.max(0, now - ts);

  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diff < minute) return "Just now";
  if (diff < hour) return `${Math.floor(diff / minute)}m ago`;
  if (diff < day) return `Today ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;

  return d.toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

function splitByDate(items: NotificationItem[]): { today: NotificationItem[]; earlier: NotificationItem[] } {
  const now = new Date();
  const todayKey = now.toDateString();
  const today: NotificationItem[] = [];
  const earlier: NotificationItem[] = [];

  for (const item of items) {
    const key = new Date(item.createdAt).toDateString();
    if (key === todayKey) today.push(item);
    else earlier.push(item);
  }

  return { today, earlier };
}

export default function NotificationsBell() {
  const { user, token } = useAuth();
  const isAuthenticated = Boolean(user || token);
  const navigate = useNavigate();
  const location = useLocation();
  const {
    items,
    unreadCount,
    activeFilter,
    setActiveFilter,
    markRead,
    markAllRead,
    clearAll,
  } = useNotifications();

  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  const filtered = useMemo(() => {
    if (activeFilter === "all") return items;
    return items.filter((item) => item.type === activeFilter);
  }, [items, activeFilter]);

  const { today, earlier } = useMemo(() => splitByDate(filtered), [filtered]);
  const nextPath = `${location.pathname}${location.search || ""}`;

  const tabs: Array<{ id: "all" | "system" | "properties" | "search"; label: string }> = [
    { id: "all", label: "All" },
    { id: "system", label: "System" },
    { id: "properties", label: "Properties" },
    { id: "search", label: "Search" },
  ];

  const renderItem = (item: NotificationItem) => (
    <li key={item.id}>
      <button
        type="button"
        onClick={() => markRead(item.id)}
        className={`w-full rounded-xl border px-3 py-2.5 text-left transition ${
          item.read
            ? "border-white/10 bg-white/[0.02] text-white/65"
            : "border-white/15 bg-white/[0.04] text-white"
        } hover:bg-white/5`}
      >
        <div className="flex items-start gap-2">
          <span className={`mt-1.5 h-1.5 w-1.5 rounded-full ${item.read ? "bg-white/20" : "bg-white"}`} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <p className="truncate text-sm font-medium">{item.title}</p>
              <span className="shrink-0 text-[10px] text-white/45">{formatTime(item.createdAt)}</span>
            </div>
            <p className="mt-1 text-xs text-white/70">{item.message}</p>
          </div>
        </div>
      </button>
    </li>
  );

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/35 text-white transition hover:bg-white/5"
        aria-label="Notifications"
        aria-expanded={open}
      >
        <Bell className="h-5 w-5" />
        {isAuthenticated && unreadCount > 0 ? (
          <span className="absolute -right-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-full border border-white/20 bg-white px-1.5 text-[10px] font-semibold text-black">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 z-[90] mt-3 w-[92vw] max-w-[360px] overflow-hidden rounded-2xl border border-white/10 bg-black/70 shadow-2xl backdrop-blur-xl">
          {!isAuthenticated ? (
            <div className="p-5">
              <h3 className="text-sm font-semibold text-white">Sign in to see notifications</h3>
              <p className="mt-2 text-xs text-white/70">
                Create an account or sign in to receive updates about bookings, properties, and system alerts.
              </p>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  navigate(`/auth/login?next=${encodeURIComponent(nextPath)}`, { replace: true });
                }}
                className="mt-4 inline-flex rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm font-medium text-white transition hover:bg-white/20"
              >
                Log in
              </button>
            </div>
          ) : (
            <>
              <div className="border-b border-white/10 px-4 py-3">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold text-white">Notifications</h3>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={markAllRead}
                      className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-2 py-1 text-[11px] text-white/70 transition hover:bg-white/5 hover:text-white"
                    >
                      <CheckCheck className="h-3.5 w-3.5" />
                      Mark all read
                    </button>
                    <button
                      type="button"
                      onClick={clearAll}
                      className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-2 py-1 text-[11px] text-white/70 transition hover:bg-white/5 hover:text-white"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Clear all
                    </button>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {tabs.map((tab) => {
                    const active = activeFilter === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveFilter(tab.id)}
                        className={`rounded-full border px-2.5 py-1 text-[11px] transition ${
                          active
                            ? "border-white/30 bg-white/10 text-white"
                            : "border-white/10 text-white/70 hover:bg-white/5"
                        }`}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="max-h-[420px] overflow-y-auto px-3 py-2">
                {filtered.length === 0 ? (
                  <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5 text-center text-sm text-white/60">
                    No notifications yet
                  </div>
                ) : (
                  <div className="space-y-3">
                    {today.length > 0 ? (
                      <section>
                        <p className="px-1 pb-1 text-[10px] uppercase tracking-[0.18em] text-white/45">Today</p>
                        <ul className="space-y-2">{today.map(renderItem)}</ul>
                      </section>
                    ) : null}

                    {earlier.length > 0 ? (
                      <section>
                        <p className="px-1 pb-1 text-[10px] uppercase tracking-[0.18em] text-white/45">Earlier</p>
                        <ul className="space-y-2">{earlier.map(renderItem)}</ul>
                      </section>
                    ) : null}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
