// == Login.jsx (Fully Fixed) ==
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { useToast } from "../../components/ToastProvider.jsx";

const LAST_EMAIL = "last_email_v1";

const HERO_LINES = [
  "منصّة متكاملة لإدارة العقارات الفاخرة",
  "Real Estate – لوحات تحكّم ذكية لأدوار متعددة",
  "إدارة العقارات والمواعيد والمدفوعات من مكان واحد",
];

const BG_IMAGES = [
  "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1600&q=80",
];

export default function Login() {
  const { login } = useAuth();
  const toast = useToast();
  const nav = useNavigate();
  const loc = useLocation();

  const [form, setForm] = useState({ email: "", password: "", remember: true });
  const [showPwd, setShowPwd] = useState(false);
  const [busy, setBusy] = useState(false);

  const [bgImage, setBgImage] = useState(BG_IMAGES[0]);
  const [heroIndex, setHeroIndex] = useState(0);
  const [heroText, setHeroText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(LAST_EMAIL);
      if (saved) setForm((f) => ({ ...f, email: saved }));
    } catch { }
  }, []);

  useEffect(() => {
    const idx = Math.floor(Math.random() * BG_IMAGES.length);
    setBgImage(BG_IMAGES[idx]);
  }, []);

  useEffect(() => {
    const full = HERO_LINES[heroIndex];
    const speed = isDeleting ? 45 : 85;

    let timer;

    if (!isDeleting && heroText.length < full.length) {
      timer = setTimeout(() => setHeroText(full.slice(0, heroText.length + 1)), speed);
    } else if (!isDeleting && heroText.length === full.length) {
      timer = setTimeout(() => setIsDeleting(true), 1600);
    } else if (isDeleting && heroText.length > 0) {
      timer = setTimeout(() => setHeroText(full.slice(0, heroText.length - 1)), speed);
    } else if (isDeleting && heroText.length === 0) {
      timer = setTimeout(() => {
        setIsDeleting(false);
        setHeroIndex((p) => (p + 1) % HERO_LINES.length);
      }, 350);
    }

    return () => clearTimeout(timer);
  }, [heroText, isDeleting, heroIndex]);

  const destForRole = (role) => {
    switch (role) {
      case "owner": return "/owner";
      case "admin": return "/admin";
      case "agent": return "/agent";
      case "accountant": return "/accountant";
      case "supplier": return "/supplier";
      case "worker": return "/worker";
      default: return "/";
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {

      // 🔥 CALL BACKEND
      // const rawUser = await login({ email: form.email, password: form.password });
      const { user: rawUser, token } = await login({
        email: form.email,
        password: form.password,
      });

      // 🔥 Normalize based on backend fields
      const u = {
        ...rawUser,
        full_name: rawUser.fullName,   // backend → fullName
        role: rawUser.role.toLowerCase(),
      };

      if (form.remember) localStorage.setItem(LAST_EMAIL, form.email);
      else localStorage.removeItem(LAST_EMAIL);

      toast.success(`مرحبًا ${u.full_name}!`);

      const params = new URLSearchParams(loc.search);
      const redirect = params.get("redirect");
      nav(redirect || destForRole(u.role), { replace: true });

    } catch (err) {
      toast.error(err?.message || "تعذر تسجيل الدخول");
    } finally {
      setBusy(false);
    }
  };

  const inputCls =
    "w-full rounded-xl bg-slate-950/70 border border-white/15 " +
    "px-3 py-2.5 text-sm text-slate-100 placeholder-slate-500 " +
    "focus:outline-none focus:ring-2 focus:ring-emerald-500/70 focus:border-transparent";

  const labelCls = "block text-xs mb-1.5 text-slate-300";

  return (
    <div className="min-h-screen text-white relative overflow-hidden flex flex-col">
      {/* 🖼️ الخلفية الثابتة (أكيد هتطلع) */}
      <div className="fixed inset-0 -z-30">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url('${bgImage}')` }}
        />
        {/* طبقة سواد خفيفة علشان القراءة */}
        <div className="absolute inset-0 bg-black/65" />
      </div>

      {/* طبقات إضاءة ناعمة فوق الخلفية */}
      <div className="pointer-events-none fixed inset-0 -z-20">
        <div className="absolute -top-40 -left-24 h-72 w-72 rounded-full bg-emerald-500/25 blur-3xl animate-pulse-slow" />
        <div className="absolute -bottom-40 -right-16 h-80 w-80 rounded-full bg-cyan-500/30 blur-3xl animate-pulse-slow" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(148,163,184,0.15),transparent_60%)]" />
      </div>

      {/* نص الترحيب المتحرك */}
      <div className="relative z-10 mt-8 mb-4 px-4 flex justify-center">
        <div className="relative text-center">
          <div
            className="pointer-events-none absolute -inset-x-10 -top-4 h-20 bg-gradient-to-r from-emerald-500/10 via-cyan-400/10 to-sky-400/5 blur-3xl"
            aria-hidden="true"
          />
          <div className="text-[11px] tracking-[0.25em] uppercase text-emerald-200/80 mb-2 hero-badge">
            SMART REAL ESTATE DASHBOARD
          </div>
          <h1 className="relative inline-block text-2xl md:text-4xl font-black bg-gradient-to-r from-emerald-300 via-cyan-300 to-sky-300 bg-clip-text text-transparent hero-glow hero-underline">
            {heroText}
            <span className="inline-block w-2 ms-1 align-middle hero-cursor">
              ▌
            </span>
          </h1>
        </div>
      </div>

      {/* المحتوى الرئيسي */}
      <main className="relative z-20 flex-1 flex items-center justify-center px-4 pb-8">
        <div className="w-full max-w-md">
          <div className="rounded-3xl border border-white/15 bg-slate-950/90 backdrop-blur-xl p-6 md:p-7 shadow-2xl shadow-emerald-500/25 flex flex-col justify-between login-card">
            <div className="space-y-6">
              {/* عنوان الكرت + حكمة */}
              <div className="space-y-2">
                <h2 className="text-2xl md:text-3xl font-black tracking-tight">
                  <span className="bg-gradient-to-r from-emerald-300 via-cyan-300 to-sky-300 bg-clip-text text-transparent">
                    تسجيل الدخول
                  </span>
                </h2>
                <p className="text-[11px] text-emerald-200/80 italic">
                  "كل عملية تسجيل دخول هي خطوة جديدة نحو إدارة أكثر وضوحًا لعقاراتك."
                </p>
                <p className="text-sm text-slate-300 leading-relaxed">
                  سجّل دخولك للوصول إلى لوحتك المخصّصة، ومتابعة العقارات
                  والمواعيد والمدفوعات من خلال تجربة استخدام أنيقة وسلسة.
                </p>
              </div>

              {/* النموذج */}
              <form onSubmit={onSubmit} className="space-y-4">
                <div>
                  <label className={labelCls}>البريد الإلكتروني</label>
                  <input
                    className={inputCls}
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    placeholder="name@example.com"
                    autoComplete="email"
                  />
                </div>

                <div>
                  <label className={labelCls}>كلمة المرور</label>
                  <div className="relative">
                    <input
                      className={inputCls + " pe-16"}
                      type={showPwd ? "text" : "password"}
                      required
                      value={form.password}
                      onChange={(e) =>
                        setForm({ ...form, password: e.target.value })
                      }
                      placeholder="••••••••"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 end-3 text-[11px] text-slate-400 hover:text-emerald-300 transition"
                      onClick={() => setShowPwd((v) => !v)}
                      aria-label="إظهار/إخفاء كلمة المرور"
                    >
                      {showPwd ? "إخفاء" : "إظهار"}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 text-xs">
                  <label className="flex items-center gap-2 text-slate-300">
                    <input
                      type="checkbox"
                      checked={form.remember}
                      onChange={(e) =>
                        setForm({ ...form, remember: e.target.checked })
                      }
                      className="h-4 w-4 rounded border border-slate-500 bg-slate-900 text-emerald-500"
                    />
                    تذكرني على هذا الجهاز
                  </label>

                  <Link
                    to="/auth/register"
                    className="text-emerald-300 hover:text-emerald-100 underline-offset-4 hover:underline"
                  >
                    إنشاء حساب جديد
                  </Link>
                </div>

                <div className="pt-3">
                  <button
                    className="w-full px-5 py-2.5 rounded-xl bg-emerald-500 text-sm font-semibold text-black shadow-lg shadow-emerald-500/40 hover:bg-emerald-400 transition disabled:opacity-60 disabled:cursor-not-allowed"
                    disabled={busy}
                  >
                    {busy ? "جارٍ تسجيل الدخول…" : "دخول إلى النظام"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>

      {/* الفوتر */}
      <footer className="relative z-20 border-t border-white/10 bg-black/80 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 py-5 space-y-4 text-[11px] md:text-xs text-slate-300">
          <div className="flex items-center gap-2 text-emerald-300 font-semibold text-xs">
            <span className="text-base">🔒</span>
            <span>الخصوصية وحماية بيانات المستخدم</span>
          </div>

          <p className="leading-relaxed">
            عند تسجيل الدخول إلى نظام{" "}
            <span className="font-semibold text-slate-100">Real Estate</span>، فإنك
            تقرّ بأنك اطلعت على{" "}
            <Link
              to="/privacy"
              className="text-emerald-300 hover:text-emerald-100 underline-offset-4 hover:underline"
            >
              سياسة الخصوصية
            </Link>{" "}
            و{" "}
            <Link
              to="/terms"
              className="text-emerald-300 hover:text-emerald-100 underline-offset-4 hover:underline"
            >
              شروط الاستخدام
            </Link>{" "}
            و{" "}
            <Link
              to="/cookies"
              className="text-emerald-300 hover:text-emerald-100 underline-offset-4 hover:underline"
            >
              سياسة ملفات تعريف الارتباط (Cookies)
            </Link>
            . يتم استخدام بيانات الدخول والجلسة فقط لأغراض التحقق من الهوية وتحسين
            تجربة استخدامك، ولا يتم مشاركتها مع أي طرف ثالث غير مخوّل.
          </p>

          <div className="border-t border-white/10 pt-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="text-slate-400">
              © {new Date().getFullYear()} Real Estate System. جميع الحقوق محفوظة.
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-300">
              <Link
                to="/privacy"
                className="hover:text-emerald-300 transition"
              >
                سياسة الخصوصية
              </Link>
              <span className="h-1 w-1 rounded-full bg-slate-500/60" />
              <Link
                to="/terms"
                className="hover:text-emerald-300 transition"
              >
                شروط الاستخدام
              </Link>
              <span className="h-1 w-1 rounded-full bg-slate-500/60" />
              <Link
                to="/cookies"
                className="hover:text-emerald-300 transition"
              >
                سياسة الكوكيز
              </Link>
            </div>

            <div className="text-slate-400">
              للتواصل مع فريق التطوير:{" "}
              <a
                href="mailto:support@realestate.local"
                className="text-emerald-300 hover:text-emerald-100 underline-offset-4 hover:underline"
              >
                support@realestate.local
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
