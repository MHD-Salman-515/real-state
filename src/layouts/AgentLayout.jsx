// src/layouts/AgentLayout.jsx
import { NavLink, Outlet, Link } from "react-router-dom";
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
          ? "bg-white/10 text-black border-white/15 shadow-soft"
          : "bg-white/5 hover:bg-white/10 border-white/15 text-slate-100")
      }
    >
      {label}
    </NavLink>
  );
}

export default function AgentLayout() {
  const [notifOpen, setNotifOpen] = useState(false);
  const [open, setOpen] = useState(false);

  // ✅ حالة الإشعارات (تبدأ بدمي داتا، وتتحدّث من الصفحات عن طريق Events)
  const [notifications, setNotifications] = useState([
    { id: "ntf-1", text: "موعد معاينة مع ليلى حسن اليوم 12:00" },
    { id: "ntf-2", text: "تم ربط عمولة جديدة على عقار في يعفور" },
    { id: "ntf-3", text: "موعد معاينة جديد بانتظار تأكيدك" },
  ]);

  const unreadCount = notifications.length;

  // ✅ استقبال إشعارات من الصفحات (مثلاً AgentAppointments / AgentLinkOps)
  useEffect(() => {
    function onAdd(e) {
      const p = e.detail || {};
      const item = {
        id: `ntf-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        text: p.text || p.title || "إشعار جديد",
        createdAt: Date.now(),
      };
      setNotifications((prev) => [item, ...prev]);
    }

    window.addEventListener("agent:addNotif", onAdd);
    window.addEventListener("notify:add", onAdd); // لو حبيت تستخدم نفس الإيفنت العام

    return () => {
      window.removeEventListener("agent:addNotif", onAdd);
      window.removeEventListener("notify:add", onAdd);
    };
  }, []);

  // ✅ زر لمسح كل الإشعارات
  const clearNotifications = () => {
    setNotifications([]);
  };

  const Sidebar = ({ onNav }) => (
    <aside className="flex flex-col h-full border-e border-white/10 bg-white/5 backdrop-blur-xl card-glass">
      {/* رأس اللوحة */}
      <div className="px-4 py-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-white/10 shadow-soft shadow-white/10" />
          <div className="font-semibold">
            <span className="text-white/90">Agent</span> Panel
          </div>
        </div>
        <div className="text-[11px] text-slate-300 mt-1">
          الواجهة الخاصة بالوكيل العقاري لإدارة المواعيد والارتباطات.
        </div>
      </div>

      {/* القائمة */}
      <nav className="p-3 space-y-1 text-sm">
        <Item to="/agent/appointments" label="مواعيدي" onClick={onNav} />
        <Item to="/agent/link-ops" label="ربط العمليات" onClick={onNav} />

        <hr className="my-3 border-white/10" />

        <Link
          to="/"
          onClick={onNav}
          className="block px-3 py-2 rounded-lg text-sm border border-transparent text-slate-200 hover:text-white/90 hover:border-white/15 hover:bg-white/10 transition"
        >
          ← العودة للموقع
        </Link>
      </nav>
    </aside>
  );

  return (
    <div className="min-h-screen bg-luxury text-white grid lg:grid-cols-[260px_1fr]">
      {/* Sidebar: Desktop */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Main */}
      <div className="min-w-0 flex flex-col">
        {/* الهيدر مع زر المنيو + زر الإشعارات */}
        <header className="hidden">
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* زر منيو للموبايل */}
              <button
                className="lg:hidden inline-flex items-center justify-center rounded-lg border border-white/15 bg-white/5 px-2.5 py-1.5 text-sm hover:bg-white/10 transition"
                onClick={() => setOpen(true)}
                aria-label="open menu"
              >
                ☰
              </button>
              <div className="font-semibold text-sm md:text-base">
                لوحة الوكيل العقاري
              </div>
            </div>

            {/* زر الإشعارات البلّوري */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setNotifOpen((v) => !v)}
                aria-label="إشعارات الوكيل"
                className="
                  relative h-10 w-10 md:h-11 md:w-11 flex items-center justify-center
                  rounded-2xl border border-white/25
                  bg-white/5 bg-gradient-to-br from-white/20 via-transparent to-white/10
                  backdrop-blur-xl
                  shadow-soft
                  transition
                  hover:-translate-y-0.5 hover:scale-105
                  hover:shadow-lg hover:shadow-white/10
                  active:scale-95
                "
              >
                {/* glow خفيف خلف الأيقونة */}
                <span className="absolute inset-0.5 rounded-2xl bg-white/10 blur-md pointer-events-none" />
                {/* Icon */}
                <span className="relative text-lg md:text-xl text-white/90">
                  🔔
                </span>

                {/* عداد + حركة Ping */}
                {unreadCount > 0 && (
                  <>
                    <span className="absolute -top-1 -right-1 h-4 min-w-[16px] px-1 rounded-full bg-white/10 text-[10px] font-bold text-black flex items-center justify-center">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                    <span className="absolute -top-1 -right-1 inline-flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white/10 opacity-75" />
                    </span>
                  </>
                )}
              </button>

              {/* قائمة الإشعارات المنسدلة */}
              {notifOpen && (
                <div
                  className="
                    absolute right-0 mt-3 w-80 max-w-sm
                    rounded-2xl bg-[#050911]/95 border border-white/15
                    shadow-xl shadow-white/10 backdrop-blur-2xl z-30
                    origin-top-right animate-[fadeIn_.15s_ease-out]
                  "
                  style={{ transformOrigin: "top right" }}
                >
                  <div className="px-3 py-2 border-b border-white/10 flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-white/90">
                      إشعارات الوكيل
                    </span>
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
                        className="text-[11px] text-slate-400 hover:text-white/90 transition"
                        type="button"
                        onClick={() => setNotifOpen(false)}
                      >
                        إغلاق
                      </button>
                    </div>
                  </div>

                  <div className="max-h-64 overflow-y-auto py-1.5">
                    {notifications.length === 0 ? (
                      <div className="px-3 py-3 text-xs text-slate-400">
                        لا توجد إشعارات جديدة.
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          className="px-3 py-2.5 text-[13px] text-slate-200 border-b border-white/5 last:border-b-0 hover:bg-white/5 cursor-default"
                        >
                          {n.text}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* المحتوى */}
        <main className="p-4 lg:p-6">
          <Outlet />
        </main>
      </div>

      {/* Sidebar: Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-72">
            <Sidebar onNav={() => setOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
