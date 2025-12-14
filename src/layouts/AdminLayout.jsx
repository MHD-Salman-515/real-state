// src/layouts/AdminLayout.jsx
import { NavLink, Outlet, Link } from "react-router-dom";
import { useState, useEffect } from "react";

function Item({ to, label }) {
  return (
    <NavLink
      to={to}
      end
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

export default function AdminLayout() {
  // 🔔 حالة الإشعارات
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: "ad-1", text: "تمت إضافة مستخدم جديد للنظام." },
    { id: "ad-2", text: "طلب صيانة بحاجة لتعيين فني." },
  ]);

  const unreadCount = notifications.length;

  // استقبال إشعارات من أي صفحة مدير
  useEffect(() => {
    function onAdd(e) {
      const d = e.detail || {};
      const item = {
        id: `ad-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        text: d.text || "إشعار إداري جديد",
        createdAt: Date.now(),
      };
      setNotifications((prev) => [item, ...prev]);
    }

    window.addEventListener("admin:addNotif", onAdd);
    window.addEventListener("notify:add", onAdd); // لو حابب نفس القناة العامة

    return () => {
      window.removeEventListener("admin:addNotif", onAdd);
      window.removeEventListener("notify:add", onAdd);
    };
  }, []);

  const clearNotifications = () => setNotifications([]);

  return (
    <div className="min-h-screen bg-luxury text-white grid lg:grid-cols-[240px_1fr] relative">

      {/* ====== Sidebar ====== */}
      <aside className="hidden lg:flex lg:flex-col border-e border-white/10 bg-white/5 backdrop-blur-xl card-glass relative z-20">
        <div className="px-4 py-4 flex items-center gap-2 border-b border-white/10">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/40" />
          <div className="font-semibold">
            <span className="text-emerald-200">Admin</span> Panel
          </div>
        </div>

        <nav className="p-3 space-y-1 text-sm">
          <Item to="/admin/appointments" label="إدارة المواعيد" />
          <Item to="/admin/maintenance" label="الصيانة (تعيين/أولوية)" />
          <Item to="/admin/users" label="الموظفون" />
          {/* <Item to="/admin/permissions" label="الصلاحيات" /> */}
          <Item to="/admin/commissions" label="العمولات" />
          <Item to="/admin/finance" label="المالية / التقارير" />
          <Item to="/admin/aging" label="تقرير المتأخرات" />

          <hr className="border-white/10 my-3" />

          <Link
            to="/"
            className="block px-3 py-2 rounded-lg text-sm border border-transparent
                       text-slate-200 hover:text-emerald-200 hover:bg-emerald-500/5
                       hover:border-emerald-400/40 transition"
          >
            ⟵ العودة للواجهة
          </Link>
        </nav>
      </aside>

      {/* ====== Main ====== */}
      <main className="p-4 lg:p-6">

        {/* ====== الهيدر مع الجرس ====== */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl md:text-2xl font-semibold tracking-wide text-emerald-200">
            لوحة المدير العام
          </h1>

          {/* زر الإشعارات الفخم */}
          <div className="relative">
            <button
              onClick={() => setNotifOpen((v) => !v)}
              className="
                relative h-11 w-11 md:h-12 md:w-12 flex items-center justify-center
                rounded-3xl border border-emerald-300/40
                bg-white/5 bg-gradient-to-br from-emerald-400/20 via-[#07110f] to-cyan-400/25
                backdrop-blur-2xl
                shadow-[0_0_25px_rgba(16,185,129,0.35)]
                transition hover:-translate-y-0.5 hover:scale-105
                hover:shadow-[0_0_40px_rgba(16,185,129,0.65)]
                active:scale-95
              "
            >
              <span className="absolute -inset-[2px] rounded-[1.75rem]
                               bg-gradient-to-br from-emerald-400/40 via-transparent to-cyan-400/40 
                               opacity-70 blur-md pointer-events-none" />

              <span className="absolute inset-1 rounded-[1.5rem] bg-black/30 border border-emerald-200/20" />

              <span className="relative text-xl drop-shadow-[0_0_8px_rgba(16,185,129,0.9)]">
                🔔
              </span>

              {unreadCount > 0 && (
                <>
                  <span className="absolute -top-1 -right-1 h-4 min-w-[16px] px-1 
                                   rounded-full bg-gradient-to-r from-amber-300 to-rose-300 
                                   text-[10px] font-bold text-black flex items-center 
                                   justify-center shadow-md shadow-amber-300/60">
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
                  absolute right-0 mt-3 w-80 max-w-sm rounded-3xl border 
                  border-emerald-400/30 bg-gradient-to-b 
                  from-[#050911]/95 via-[#020409]/98 to-[#020308]/98 
                  shadow-2xl shadow-emerald-500/40 backdrop-blur-2xl z-30
                "
              >
                <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-6 w-6 rounded-full bg-emerald-500/20 border border-emerald-300/40 text-xs grid place-items-center">
                      🛡️
                    </span>
                    <div>
                      <span className="text-xs font-semibold text-emerald-200">إشعارات المدير</span>
                      <p className="text-[10px] text-slate-400">متابعة حالة النظام والموظفين</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {notifications.length > 0 && (
                      <button
                        onClick={clearNotifications}
                        className="text-[11px] text-rose-300 hover:text-rose-200 transition"
                      >
                        مسح الكل
                      </button>
                    )}
                    <button
                      onClick={() => setNotifOpen(false)}
                      className="text-[11px] text-slate-400 hover:text-emerald-300 transition"
                    >
                      إغلاق
                    </button>
                  </div>
                </div>

                <div className="max-h-64 overflow-y-auto py-1.5">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-xs text-slate-400 text-center">
                      لا توجد إشعارات حالياً.
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className="
                          px-4 py-2.5 text-[13px] text-slate-100 border-b border-white/5
                          last:border-b-0 hover:bg-white/5 cursor-default flex gap-2
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
        </div>

        {/* ====== محتوى صفحات المدير ====== */}
        <Outlet />
      </main>
    </div>
  );
}
