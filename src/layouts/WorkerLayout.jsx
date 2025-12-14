// src/layouts/WorkerLayout.jsx
import { Outlet, NavLink, Link } from "react-router-dom";
import { useState, useEffect } from "react";

function Item({ to, label, onClick }) {
  return (
    <NavLink
      to={to}
      end
      onClick={onClick}
      className={({ isActive }) =>
        "block px-3 py-2 rounded-lg text-sm border transition " +
        (isActive
          ? "bg-emerald-500/30 text-emerald-100 border-emerald-400/60 shadow-soft"
          : "bg-white/5 hover:bg-white/10 border-white/15 text-slate-100")
      }
    >
      {label}
    </NavLink>
  );
}

export default function WorkerLayout() {
  const [open, setOpen] = useState(false);

  // 🔔 حالة الإشعارات الخاصة بالعامل
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: "wrk-1", text: "تم تعيين تذكرة صيانة جديدة لك." },
    { id: "wrk-2", text: "موعد صيانة اليوم الساعة 4:00 مساءً." },
  ]);

  const unreadCount = notifications.length;

  // ✅ استقبال إشعارات من صفحات العامل أو إشعارات عامة
  useEffect(() => {
    function onAdd(e) {
      const p = e.detail || {};
      const item = {
        id: `wrk-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        text: p.text || p.title || "إشعار جديد للعامل",
        createdAt: Date.now(),
      };
      setNotifications((prev) => [item, ...prev]);
    }

    // من صفحات العامل: window.dispatchEvent(new CustomEvent("worker:addNotif", { detail: { text: "..." }}))
    window.addEventListener("worker:addNotif", onAdd);
    // ومن قناة notify:add العامة
    window.addEventListener("notify:add", onAdd);

    return () => {
      window.removeEventListener("worker:addNotif", onAdd);
      window.removeEventListener("notify:add", onAdd);
    };
  }, []);

  const clearNotifications = () => setNotifications([]);

  const Sidebar = ({ onNav }) => (
    <aside className="flex flex-col border-e border-white/10 bg-white/5 backdrop-blur-xl card-glass h-full">
      <div className="px-4 py-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-emerald-400/70 shadow-soft shadow-emerald-400/60" />
          <div className="font-semibold">
            <span className="text-emerald-200">Worker</span> Panel
          </div>
        </div>
        <div className="mt-1">
          <span className="inline-flex items-center gap-2 text-[11px] text-slate-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />{" "}
            متصل الآن
          </span>
        </div>
      </div>

      <nav className="p-3 space-y-1 text-sm">
        <Item to="/worker" label="لوحتي" onClick={onNav} />
        {/* صفحات مستقبلية */}
        {/* <Item to="/worker/my-logs" label="سجلاتي" onClick={onNav} /> */}
        {/* <Item to="/worker/profile" label="ملفي" onClick={onNav} /> */}

        <hr className="my-3 border-white/10" />
        <Link
          to="/"
          onClick={onNav}
          className="block px-3 py-2 rounded-lg text-sm border border-transparent text-slate-200 hover:text-emerald-200 hover:bg-emerald-500/5 hover:border-emerald-400/40 transition"
        >
          ← العودة للموقع
        </Link>
      </nav>
    </aside>
  );

  return (
    <div className="min-h-screen bg-luxury text-white grid lg:grid-cols-[240px_1fr]">
      {/* Sidebar Desktop */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Main */}
      <div className="min-w-0 flex flex-col">
        <header className="sticky top-0 z-30 backdrop-blur bg-black/40 border-b border-white/10">
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                className="lg:hidden inline-flex items-center justify-center rounded-lg border border-white/20 bg-white/10 px-2.5 py-1.5 text-sm hover:bg-white/20 transition"
                onClick={() => setOpen(true)}
                aria-label="open menu"
              >
                ☰
              </button>
              <div className="font-semibold text-sm md:text-base">
                لوحة العامل
              </div>
            </div>

            {/* 🔔 زر إشعارات فخم + أفاتار بسيط */}
            <div className="flex items-center gap-3">
              {/* جرس فخم مثل المحاسب */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setNotifOpen((v) => !v)}
                  aria-label="إشعارات العامل"
                  className="
                    relative h-10 w-10 md:h-11 md:w-11 flex items-center justify-center
                    rounded-3xl border border-emerald-300/40
                    bg-white/5 bg-gradient-to-br from-emerald-400/20 via-[#060B10] to-cyan-400/25
                    backdrop-blur-2xl
                    shadow-[0_0_22px_rgba(16,185,129,0.35)]
                    transition
                    hover:-translate-y-0.5 hover:scale-105
                    hover:shadow-[0_0_36px_rgba(34,211,238,0.55)]
                    active:scale-95
                  "
                >
                  {/* هالة خارجية ناعمة */}
                  <span className="absolute -inset-[2px] rounded-[1.75rem] bg-gradient-to-br from-emerald-400/40 via-transparent to-cyan-400/40 opacity-70 blur-md pointer-events-none" />

                  {/* دائرة داخلية تعطي عمق */}
                  <span className="absolute inset-1 rounded-[1.5rem] bg-black/30 border border-emerald-200/20" />

                  {/* الأيقونة نفسها */}
                  <span className="relative text-lg md:text-xl text-emerald-50 drop-shadow-[0_0_8px_rgba(16,185,129,0.9)]">
                    🔔
                  </span>

                  {/* عداد + Ping */}
                  {unreadCount > 0 && (
                    <>
                      <span className="absolute -top-1 -right-1 h-4 min-w-[16px] px-1 rounded-full bg-gradient-to-r from-amber-300 to-rose-300 text-[10px] font-bold text-black flex items-center justify-center shadow-md shadow-amber-300/60">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                      <span className="absolute -top-1 -right-1 inline-flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-70" />
                      </span>
                    </>
                  )}
                </button>

                {/* قائمة الإشعارات */}
                {notifOpen && (
                  <div
                    className="
                      absolute right-0 mt-3 w-80 max-w-sm
                      rounded-3xl border border-emerald-400/30
                      bg-gradient-to-b from-[#050911]/95 via-[#020409]/98 to-[#020308]/98
                      shadow-2xl shadow-emerald-500/40 backdrop-blur-2xl z-30
                      origin-top-right
                    "
                    style={{ transformOrigin: "top right" }}
                  >
                    <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 border border-emerald-300/40 text-xs">
                          🛠️
                        </span>
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-emerald-200 tracking-wide">
                            إشعارات العامل
                          </span>
                          <span className="text-[10px] text-slate-400">
                            آخر المهام والتذاكر المرسلة إليك
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {notifications.length > 0 && (
                          <button
                            className="text-[11px] text-rose-300 hover:text-rose-200 transition"
                            type="button"
                            onClick={clearNotifications}
                          >
                            مسح الكل
                          </button>
                        )}
                        <button
                          className="text-[11px] text-slate-400 hover:text-emerald-300 transition"
                          type="button"
                          onClick={() => setNotifOpen(false)}
                        >
                          إغلاق
                        </button>
                      </div>
                    </div>

                    <div className="max-h-64 overflow-y-auto py-1.5">
                      {notifications.length === 0 ? (
                        <div className="px-4 py-4 text-xs text-slate-400 text-center">
                          لا توجد إشعارات حالياً.
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            className="
                              px-4 py-2.5 text-[13px] text-slate-100
                              border-b border-white/5 last:border-b-0
                              hover:bg-white/5 cursor-default
                              flex items-start gap-2
                            "
                          >
                            <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.9)]" />
                            <span>{n.text}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* أفاتار بسيط للعامل */}
              <div className="" />
            </div>
          </div>
        </header>

        <main className="p-4 lg:p-6">
          <Outlet />
        </main>
      </div>

      {/* Drawer Mobile */}
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
