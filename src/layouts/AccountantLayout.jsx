// src/layouts/AccountantLayout.jsx
import { NavLink, Outlet, Link } from "react-router-dom";
import { useState, useEffect } from "react";

const Item = ({ to, label, icon }) => (
  <NavLink
    to={to}
    end
    className={({ isActive }) =>
      "group flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition border " +
      (isActive
        ? "bg-gradient-to-r from-emerald-400/20 to-cyan-400/20 border-emerald-400/40 text-emerald-300 shadow-lg shadow-emerald-500/20"
        : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-emerald-400/30 hover:text-emerald-200")
    }
  >
    <span className="text-lg opacity-80 group-hover:opacity-100">{icon}</span>
    {label}
  </NavLink>
);

export default function AccountantLayout() {
  // 🔔 حالة الإشعارات
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: "acc-1", text: "تم تسجيل دفعة جديدة لفاتورة إيجار." },
    { id: "acc-2", text: "فاتورة مبيعات تقترب من تاريخ الاستحقاق." },
  ]);

  const unreadCount = notifications.length;

  // ✅ استقبال إشعارات من صفحات المحاسب أو إشعارات عامة
  useEffect(() => {
    function onAdd(e) {
      const p = e.detail || {};
      const item = {
        id: `acc-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        text: p.text || p.title || "إشعار محاسبة جديد",
        createdAt: Date.now(),
      };
      setNotifications((prev) => [item, ...prev]);
    }

    window.addEventListener("accountant:addNotif", onAdd);
    window.addEventListener("notify:add", onAdd);

    return () => {
      window.removeEventListener("accountant:addNotif", onAdd);
      window.removeEventListener("notify:add", onAdd);
    };
  }, []);

  const clearNotifications = () => setNotifications([]);

  return (
    <div className="min-h-screen bg-[#060B10] text-white relative flex">
      {/* خلفيات فاخرة */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-20 -left-20 h-64 w-64 rounded-full bg-emerald-500/20 blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl animate-pulse" />
      </div>

      {/* ====== Sidebar ====== */}
      <aside className="hidden lg:flex lg:flex-col w-[260px] bg-black/25 backdrop-blur-xl border-e border-white/10 relative z-20">
        {/* Header */}
        <div className="px-5 py-5 flex items-center gap-3 border-b border-white/10 bg-white/5/">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-400 shadow-lg shadow-emerald-500/40" />
          <div className="font-semibold leading-tight">
            <div className="text-[11px] uppercase tracking-wide text-emerald-300">
              Accountant
            </div>
            <div className="text-sm text-cyan-200">Real State</div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          <Item
            to="/accountant/sales-invoices"
            icon="💰"
            label="فواتير المبيعات"
          />
          <Item
            to="/accountant/rent-invoices"
            icon="🏠"
            label="فواتير الإيجار"
          />
          <Item
            to="/accountant/record-payments"
            icon="💳"
            label="تسجيل الدفعات"
          />
          <Item
            to="/accountant/supplier-invoices"
            icon="📦"
            label="فواتير الموردين"
          />
          <Item
            to="/accountant/cost-allocation"
            icon="🔧"
            label="توزيع تكاليف الصيانة"
          />
          <Item to="/accountant/income" icon="📈" label="بيان الدخل" />
          <Item to="/accountant/aging" icon="⏳" label="تقرير المتأخرات" />

          <hr className="my-4 border-white/10" />

          <Link
            to="/"
            className="block px-4 py-2.5 rounded-xl text-sm text-slate-400 hover:text-emerald-300 hover:bg-white/10 transition"
          >
            ⟵ العودة للواجهة
          </Link>
        </nav>
      </aside>

      {/* ====== Main Content + Header + Bell ====== */}
      <main className="flex-1 p-6 relative z-10 flex flex-col">
        {/* الهيدر مع العنوان والجرس الفخم */}
        <header className="mb-4 flex items-center justify-between gap-3">
          <div>
            {/* بادج فخمة صغيرة فوق العنوان */}
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3 py-0.5 text-[10px] text-emerald-200 mb-1 tracking-wide">
              <span>📊</span>
              <span>وحدة المحاسبة المالية للنظام</span>
            </span>

            <h1 className="text-xl md:text-2xl font-semibold tracking-wide mt-1">
              لوحة المحاسب
            </h1>
            <p className="text-xs md:text-sm text-slate-300 mt-1">
              واجهة محاسبية احترافية لإدارة الفواتير، تسجيل الدفعات، ومتابعة
              التقارير والمؤشرات المالية للنظام العقاري.
            </p>
          </div>

          {/* 🔔 زر الإشعارات الفاخر */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setNotifOpen((v) => !v)}
              aria-label="إشعارات المحاسب"
              className="
                relative h-11 w-11 md:h-12 md:w-12 flex items-center justify-center
                rounded-3xl border border-emerald-300/40
                bg-white/5 bg-gradient-to-br from-emerald-400/20 via-[#060B10] to-cyan-400/25
                backdrop-blur-2xl
                shadow-[0_0_25px_rgba(16,185,129,0.35)]
                transition
                hover:-translate-y-0.5 hover:scale-105
                hover:shadow-[0_0_40px_rgba(34,211,238,0.55)]
                active:scale-95
              "
            >
              {/* هالة خارجية ناعمة */}
              <span className="absolute -inset-[2px] rounded-[1.75rem] bg-gradient-to-br from-emerald-400/40 via-transparent to-cyan-400/40 opacity-70 blur-md pointer-events-none" />

              {/* دائرة داخلية شفافة تعطي عمق */}
              <span className="absolute inset-1 rounded-[1.5rem] bg-black/30 border border-emerald-200/20" />

              {/* الأيقونة نفسها */}
              <span className="relative text-lg md:text-xl text-emerald-50 drop-shadow-[0_0_8px_rgba(16,185,129,0.9)]">
                🔔
              </span>

              {/* عداد + حركة Ping */}
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

            {/* قائمة الإشعارات الفاخرة */}
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
                      📊
                    </span>
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-emerald-200 tracking-wide">
                        إشعارات المحاسب
                      </span>
                      <span className="text-[10px] text-slate-400">
                        آخر التحديثات المالية والدفعات المسجّلة
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
        </header>

        {/* محتوى صفحات المحاسب */}
        <div className="mt-2">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
