// src/layouts/PublicLayout.jsx
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useToast } from "../components/ToastProvider.jsx";

// 🖼️ صور الخلفية لصفحات /auth (login / register / ..)
const AUTH_BG_IMAGES = [
  "https://images.unsplash.com/photo-1502672023488-70e25813eb80?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1505691723518-36a5ac3be353?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?auto=format&fit=crop&w=1600&q=80",
];

export default function PublicLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ هل نحن في صفحة من صفحات الـ auth ؟ (login / register / إلخ)
  const isAuthPage = location.pathname.startsWith("/auth");

  // 🔁 صورة الخلفية لصفحات auth
  const [authBgImage, setAuthBgImage] = useState(AUTH_BG_IMAGES[0]);

  // اختيار صورة عشوائية في كل مرة ندخل صفحة من /auth
  useEffect(() => {
    if (isAuthPage) {
      const idx = Math.floor(Math.random() * AUTH_BG_IMAGES.length);
      setAuthBgImage(AUTH_BG_IMAGES[idx]);
    }
  }, [isAuthPage, location.pathname]);

  // 🔔 حالة الإشعارات (تبدأ بدمي داتا + تتحدث من باقي اللوحات عبر notify:add)
  const [notifications, setNotifications] = useState([
    { id: "pub-1", text: "تم تأكيد موعد المعاينة لعقار #101" },
    { id: "pub-2", text: "تمت إضافة عرض جديد في دمشق" },
    { id: "pub-3", text: "عقار من مفضلتك تم تخفيض سعره" },
  ]);

  const unreadCount = notifications.length;

  // ✅ استقبال إشعارات عامة من باقي اللوحات
  useEffect(() => {
    function onAdd(e) {
      const p = e.detail || {};
      const item = {
        id: `pub-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        text: p.text || p.title || "إشعار جديد من النظام العقاري",
        scope: p.scope || p.from || "system",
        createdAt: new Date().toLocaleString("ar-SY"),
      };
      setNotifications((prev) => [item, ...prev]);
    }

    window.addEventListener("notify:add", onAdd);
    return () => window.removeEventListener("notify:add", onAdd);
  }, []);

  const handleNotifClick = () => {
    setNotifOpen((v) => !v);
    if (!notifOpen) toast.info("عرض آخر الإشعارات");
  };

  const clearNotifications = () => {
    setNotifications([]);
    toast.info("تم مسح جميع الإشعارات");
  };

  const handleLogout = () => {
    toast.success("تم تسجيل الخروج");
    try {
      localStorage.removeItem("me");
    } catch { }
    setDrawerOpen(false);
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-[#0A0F14] text-white relative overflow-hidden">
      {/* 🔥 خلفية خاصة لصفحات /auth (صورة + تدرّج) */}
      {isAuthPage && (
        <div className="pointer-events-none absolute inset-0 -z-20 overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-110 will-change-transform bg-pan-slow"
            style={{
              backgroundImage: `url('${authBgImage}')`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/75 to-black/95" />
        </div>
      )}

      {/* 🔁 خلفيات PublicLayout العادية → فقط لغير صفحات auth */}
      {!isAuthPage && (
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-20 -left-20 h-60 w-60 rounded-full bg-emerald-500/20 blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl animate-pulse" />
        </div>
      )}

      {/* ===== Header (مخفي في صفحات auth) ===== */}
      {!isAuthPage && (
        <header className="relative z-20 w-full border-b border-white/10 bg-black/20 backdrop-blur-lg">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-400 shadow-lg shadow-emerald-500/40 flex items-center justify-center group-hover:scale-110 transition">
                <span className="text-black font-black text-xl">R</span>
              </div>

              <div className="leading-tight">
                <div className="text-xs uppercase text-emerald-300 tracking-wide">
                  Luxury Real Estate
                </div>
                <div className="font-bold text-lg group-hover:text-cyan-300 transition">
                  RealState Properties
                </div>
              </div>
            </Link>

            <div className="flex items-center gap-3">
              {/* ===== Notification Button ===== */}
              <div className="relative">
                <button
                  type="button"
                  onClick={handleNotifClick}
                  aria-label="إشعارات النظام"
                  className="
                    relative h-10 w-10 md:h-11 md:w-11 flex items-center justify-center
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
                  <span className="absolute -inset-[2px] rounded-[1.75rem] bg-gradient-to-br from-emerald-400/40 via-transparent to-cyan-400/40 opacity-70 blur-md pointer-events-none" />
                  <span className="absolute inset-1 rounded-[1.5rem] bg-black/30 border border-emerald-200/20" />
                  <span className="relative text-lg md:text-xl text-emerald-50 drop-shadow-[0_0_8px_rgba(16,185,129,0.9)]">
                    🔔
                  </span>

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
                          🏙️
                        </span>
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-emerald-200 tracking-wide">
                            إشعارات النظام العقاري
                          </span>
                          <span className="text-[10px] text-slate-400">
                            متابعة أحدث التحديثات على المواعيد والعقارات والعروض
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
                              flex flex-col gap-0.5
                            "
                          >
                            <span>{n.text}</span>
                            {n.createdAt && (
                              <span className="text-[10px] text-slate-400">
                                {n.createdAt}
                              </span>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* ===== Drawer Toggle ===== */}
              <button
                onClick={() => setDrawerOpen(true)}
                className="h-10 w-10 flex items-center justify-center rounded-xl border border-white/20 bg-white/10 backdrop-blur-md hover:bg:white/20 hover:scale-110 transition shadow-lg shadow-emerald-500/20"
              >
                ☰
              </button>
            </div>
          </div>
        </header>
      )}

      {/* ===== Content ===== */}
      <main className="relative z-10 flex-1">
        <Outlet context={{ drawerOpen, setDrawerOpen }} />
      </main>

      {/* ===== Drawer ===== */}
      {!isAuthPage && drawerOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setDrawerOpen(false)}
          />

          <aside className="fixed inset-y-0 right-0 w-80 bg-slate-950/95 border-l border-white/15 z-50 p-4 flex flex-col gap-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="text-xs text-emerald-300 uppercase tracking-wide">
                  لوحة الوصول السريع
                </div>
                <div className="font-semibold text-sm">ضيف النظام</div>
              </div>
              <button
                className="h-8 w-8 rounded-full bg-white/5 border border-white/20 flex items-center justify-center text-sm hover:bg-white/10"
                onClick={() => setDrawerOpen(false)}
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="text-[11px] uppercase tracking-wide text-slate-400">
                حسابي
              </div>

              <div className="flex flex-col gap-2">
                <Link
                  to="/client/appointments"
                  className="btn-ghost-gold justify-start"
                  onClick={() => {
                    toast.info("فتح صفحة مواعيدي");
                    setDrawerOpen(false);
                  }}
                >
                  مواعيدي
                </Link>

                <Link
                  to="/client/favorites"
                  className="btn-ghost-gold justify-start"
                  onClick={() => {
                    toast.info("فتح المفضلة");
                    setDrawerOpen(false);
                  }}
                >
                  مفضلتي
                </Link>
                
                  <Link
                    to="/client/tickets"
                    className="btn-ghost-gold justify-start"
                  >
                    تذاكر الصيانة الخاصة بي
                  </Link>
                
                <Link
                  to="/client/profile"
                  className="btn-ghost-gold justify-start"
                  onClick={() => {
                    toast.info("فتح الملف الشخصي");
                    setDrawerOpen(false);
                  }}
                >
                  الملف الشخصي
                </Link>

                <Link
                  to="/search"
                  className="btn-ghost-gold justify-start"
                  onClick={() => {
                    toast.info("بحث جديد");
                    setDrawerOpen(false);
                  }}
                >
                  بحث جديد
                </Link>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div className="text-[11px] uppercase tracking-wide text-slate-400">
                النظام
              </div>

              <div className="flex flex-col gap-2">
                <Link
                  to="/search"
                  className="card-glass px-3 py-2 flex items-center justify-between text-xs"
                  onClick={() => {
                    toast.info("فتح البحث المتقدم");
                    setDrawerOpen(false);
                  }}
                >
                  <span>البحث المتقدم</span>
                  <span className="text-emerald-300">⟶</span>
                </Link>

                <Link
                  to="/client/book-visit"
                  className="card-glass px-3 py-2 flex items-center justify-between text-xs"
                  onClick={() => {
                    toast.info("فتح حجز معاينة");
                    setDrawerOpen(false);
                  }}
                >
                  <span>حجز معاينة</span>
                  <span className="text-emerald-300">⟶</span>
                </Link>

                <Link
                  to="/client/appointments"
                  className="card-glass px-3 py-2 flex items-center justify-between text-xs"
                  onClick={() => {
                    toast.info("فتح سجل المواعيد");
                    setDrawerOpen(false);
                  }}
                >
                  <span>سجل المواعيد</span>
                  <span className="text-emerald-300">⟶</span>
                </Link>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="mt-2 inline-flex items-center justify-center gap-2 rounded-xl border border-red-500/70 
                        bg-red-500/10 px-3 py-2 text-sm font-medium text-red-300
                        hover:bg-red-500/20 hover:text-red-100 hover:shadow-lg hover:shadow-red-500/40
                        transition transform hover:-translate-y-0.5"
            >
              <span className="text-lg">⎋</span>
              <span>تسجيل الخروج</span>
            </button>

            <div className="mt-auto text-[11px] text-slate-500 border-t border-white/10 pt-3">
              دخول سريع لإدارة حسابك وعقاراتك من مكان واحد.
            </div>
          </aside>
        </>
      )}
    </div>
  );
}
