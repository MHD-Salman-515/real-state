// src/layouts/SupplierLayout.jsx
import { useEffect, useState } from "react";
import { Outlet, NavLink, Link } from "react-router-dom";

// مفتاح التخزين المحلي للإشعارات
const LS_NOTIFS = "supplier_notifications_v1";

// فورمات "منذ ..."
function timeago(ts) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return "الآن";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} دقيقة`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} ساعة`;
  const d = Math.floor(h / 24);
  return `${d} يوم`;
}

// جرس الإشعارات – ستايل داكن فخم
function Bell({ items, onMarkReadAll, onClear }) {
  const unread = items.filter((n) => !n.read).length;
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onEsc = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, []);

  return (
    <div className="relative select-none">
      {/* زر الجرس */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative h-10 w-10 rounded-xl border border-white/20 bg-white/10 backdrop-blur hover:bg-white/20 transition shadow-soft"
        aria-label="الإشعارات"
      >
        <svg viewBox="0 0 24 24" className="mx-auto h-5 w-5 text-emerald-200">
          <path
            fill="currentColor"
            d="M12 2a2 2 0 0 0-2 2v1.03A7 7 0 0 0 5 12v3l-1.29 1.29A1 1 0 0 0 4.41 18h15.18a1 1 0 0 0 .7-1.71L19 15v-3a7 7 0 0 0-5-6.97V4a2 2 0 0 0-2-2Z"
          />
        </svg>

        {/* عدّاد + وميض */}
        {unread > 0 && (
          <>
            <span className="absolute -top-1 -right-1 min-w-5 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 text-white px-1 text-[10px] leading-5 text-center shadow">
              {unread > 9 ? "9+" : unread}
            </span>
            <span className="absolute -top-1 -right-1 inline-flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            </span>
          </>
        )}
      </button>

      {/* لوحة الإشعارات */}
      {open && (
        <div
          className="absolute end-0 mt-2 w-[360px] rounded-2xl border border-white/15 bg-slate-950/95 backdrop-blur-xl shadow-2xl z-20
                     origin-top-right animate-[fadeIn_.12s_ease-out]"
          style={{ transformOrigin: "top right" }}
        >
          <div className="flex items-center justify-between px-3 py-2 border-b border-white/10">
            <div className="font-semibold text-sm text-white">الإشعارات</div>
            <div className="flex items-center gap-2">
              <button
                className="text-xs md:text-sm underline text-emerald-200 hover:text-emerald-100"
                onClick={onMarkReadAll}
              >
                تمييز كمقروء
              </button>
              <button
                className="text-xs md:text-sm underline text-rose-200 hover:text-rose-100"
                onClick={onClear}
              >
                مسح الكل
              </button>
            </div>
          </div>

          <div className="max-h-[320px] overflow-auto">
            {items.length === 0 ? (
              <div className="p-4 text-sm text-slate-300">
                لا يوجد إشعارات حاليًا
              </div>
            ) : (
              items.map((n) => (
                <div
                  key={n.id}
                  className="px-3 py-3 border-b border-white/5 last:border-b-0 hover:bg-white/5 transition"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px]
                          ${
                            n.type === "task"
                              ? "border-emerald-400 bg-emerald-500/10 text-emerald-200"
                              : n.type === "bill"
                              ? "border-amber-300 bg-amber-500/10 text-amber-200"
                              : "border-sky-300 bg-sky-500/10 text-sky-200"
                          }`}
                        >
                          {n.type === "task"
                            ? "تكليف"
                            : n.type === "bill"
                            ? "فاتورة"
                            : "ربط تكلفة"}
                        </span>
                        {!n.read && (
                          <span className="h-2 w-2 rounded-full bg-emerald-400" />
                        )}
                      </div>
                      <div className="text-sm text-slate-100">{n.title}</div>
                      {n.meta?.ref && (
                        <div className="text-xs text-slate-400">
                          مرجع: {n.meta.ref}
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 whitespace-nowrap">
                      {timeago(n.createdAt)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ============== التخطيط الكامل للمورّد ==============
export default function SupplierLayout() {
  const [notifs, setNotifs] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(LS_NOTIFS) || "[]");
    } catch {
      return [];
    }
  });

  // حفظ عند التغيير
  useEffect(() => {
    try {
      localStorage.setItem(LS_NOTIFS, JSON.stringify(notifs));
    } catch {
      // no-op
    }
  }, [notifs]);

  // استقبال إشعارات من صفحات أخرى (مثل AcceptAssignments.jsx)
  useEffect(() => {
    function onAdd(e) {
      // payload المتوقع: { type, title, meta }
      const p = e.detail || {};
      const item = {
        id: `ntf-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        type: p.type || "info",
        title: p.title || "إشعار",
        meta: p.meta || {},
        read: false,
        createdAt: Date.now(),
      };
      setNotifs((prev) => [item, ...prev]);
    }

    window.addEventListener("supplier:addNotif", onAdd);
    window.addEventListener("notify:add", onAdd); // للتوافق

    return () => {
      window.removeEventListener("supplier:addNotif", onAdd);
      window.removeEventListener("notify:add", onAdd);
    };
  }, []);

  const markAllRead = () =>
    setNotifs((list) => list.map((n) => ({ ...n, read: true })));
  const clearAll = () => setNotifs([]);

  return (
    <div className="min-h-screen bg-luxury text-white grid lg:grid-cols-[260px_1fr]">
      {/* Sidebar */}
      <aside className="hidden lg:flex lg:flex-col border-e border-white/10 bg-white/5 backdrop-blur-xl card-glass">
        <div className="px-4 py-4 flex items-center gap-2 border-b border-white/10">
          <div className="h-8 w-8 rounded-full bg-emerald-400/70 shadow-soft shadow-emerald-400/60" />
          <div className="font-semibold">
            <span className="text-emerald-200">Supplier</span> Panel
          </div>
        </div>

        <nav className="p-3 space-y-1 text-sm">
          <NavLink
            to="/supplier/tasks"
            className={({ isActive }) =>
              "block px-3 py-2 rounded-lg text-sm border transition " +
              (isActive
                ? "bg-emerald-500/30 text-emerald-100 border-emerald-400/60 shadow-soft"
                : "bg-white/5 hover:bg-white/10 border-white/15 text-slate-100")
            }
          >
            المهام
          </NavLink>

          <NavLink
            to="/supplier/bills"
            className={({ isActive }) =>
              "block px-3 py-2 rounded-lg text-sm border transition " +
              (isActive
                ? "bg-emerald-500/30 text-emerald-100 border-emerald-400/60 shadow-soft"
                : "bg-white/5 hover:bg-white/10 border-white/15 text-slate-100")
            }
          >
            فواتير المورد
          </NavLink>

          <NavLink
            to="/supplier/cost-link"
            className={({ isActive }) =>
              "block px-3 py-2 rounded-lg text-sm border transition " +
              (isActive
                ? "bg-emerald-500/30 text-emerald-100 border-emerald-400/60 shadow-soft"
                : "bg-white/5 hover:bg-white/10 border-white/15 text-slate-100")
            }
          >
            ربط التكلفة
          </NavLink>

          <hr className="my-3 border-white/10" />

          <Link
            to="/"
            className="block px-3 py-2 rounded-lg text-sm border border-transparent text-slate-200 hover:text-emerald-200 hover:bg-emerald-500/5 hover:border-emerald-400/40 transition"
          >
            ⟵ الرجوع للموقع
          </Link>
        </nav>
      </aside>

      {/* Main */}
      <main className="min-h-screen flex flex-col">
        <header className="sticky top-0 z-20 bg-black/40 backdrop-blur border-b border-white/10">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="font-semibold text-sm md:text-base">
              لوحة المورد / المقاول
            </div>
            <Bell
              items={notifs}
              onMarkReadAll={markAllRead}
              onClear={clearAll}
            />
          </div>
        </header>

        <div className="max-w-6xl mx-auto p-4 flex-1 w-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

// (اختياري) لو حابب تستخدم Bell خارجياً
export { Bell };
