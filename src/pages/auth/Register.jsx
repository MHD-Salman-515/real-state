// src/pages/auth/Register.jsx
// == Register.jsx (FIXED 100%) ==
import React from "react";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { useToast } from "../../components/ToastProvider.jsx";

// ================================
// 🔥 لازم يكونوا قبل أي useState
// ================================
const HINT_LINES = [
  "بتسجيلك معنا، تحصل على تجربة عقارية مصممة خصيصًا لدورك.",
  "حساب واحد يكفي لإدارة عقاراتك، مواعيدك، ومدفوعاتك في مكان واحد.",
  "انضم إلى نظام عقاري ذكي يجعل متابعة التفاصيل اليومية أسهل وأمتع.",
];

const BG_IMAGES = [
  "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1600&q=80",
];

const HERO_LINES = [
  "منصّة متكاملة لإدارة العقارات الفاخرة",
  "Real Estate – لوحات تحكّم ذكية لأدوار متعددة",
  "ابدأ رحلتك العقارية بإنشاء حساب في ثوانٍ",
];
// ==============

export default function Register() {
  const { register } = useAuth();
  const toast = useToast();
  const nav = useNavigate();

  // BG + HERO + HINT animation states
  const [bgImage, setBgImage] = useState(BG_IMAGES[0]);
  const [heroText, setHeroText] = useState(HERO_LINES[0]);
  const [hintIndex, setHintIndex] = useState(0);
  const [showHint, setShowHint] = useState(true);

  const inputCls =
    "w-full rounded-xl bg-slate-950/70 border border-white/15 " +
    "px-3 py-2.5 text-sm text-slate-100 placeholder-slate-500 " +
    "focus:outline-none focus:ring-2 focus:ring-emerald-500/70 focus:border-transparent";

  const labelCls = "block text-xs mb-1.5 text-slate-300";
  // FORM state
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    role: "client",
  });

  const [showPwd, setShowPwd] = useState(false);
  const [busy, setBusy] = useState(false);

  // ==========================================
  // TIMERS (background + transitions)
  // ==========================================
  useEffect(() => {
    const imgTimer = setInterval(() => {
      setBgImage((prev) =>
        prev === BG_IMAGES[0] ? BG_IMAGES[1] : BG_IMAGES[0]
      );
    }, 6000);

    const heroTimer = setInterval(() => {
      setHeroText((prev) => {
        const idx = HERO_LINES.indexOf(prev);
        return HERO_LINES[(idx + 1) % HERO_LINES.length];
      });
    }, 3500);

    const hintTimer = setInterval(() => {
      setShowHint(false);
      setTimeout(() => {
        setHintIndex((i) => (i + 1) % HINT_LINES.length);
        setShowHint(true);
      }, 450);
    }, 3000);

    return () => {
      clearInterval(imgTimer);
      clearInterval(heroTimer);
      clearInterval(hintTimer);
    };
  }, []);

  // ==========================================
  // SUBMIT HANDLER
  // ==========================================
  const onSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);

    try {
      const rawUser = await register({
        fullName: form.full_name,
        email: form.email,
        password: form.password,
        role: form.role.toUpperCase(),
      });

      const u = {
        ...rawUser,
        full_name: rawUser.fullName,
        role: rawUser.role.toLowerCase(),
      };

      toast.success(`تم إنشاء الحساب، أهلاً ${u.full_name}!`);

      const dest = {
        owner: "/owner",
        admin: "/admin",
        // agent: "/agent",
        accountant: "/accountant",
        supplier: "/supplier",
        worker: "/worker",
        client: "/",
      }[u.role] || "/";

      nav(dest, { replace: true });
    } catch (err) {
      toast.error(err?.message || "تعذر إنشاء الحساب");
    } finally {
      setBusy(false);
    }
  };


  return (
    <div className="min-h-screen text-white relative overflow-hidden flex flex-col">
      {/* 🖼️ الخلفية الثابتة (نفس الـ Login بالضبط) */}
      <div className="fixed inset-0 -z-30">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url('${bgImage}')` }}
        />
        <div className="absolute inset-0 bg-black/65" />
      </div>

      {/* طبقات إضاءة ناعمة فوق الخلفية (نفس جو الـ Login) */}
      <div className="pointer-events-none fixed inset-0 -z-20">
        <div className="absolute -top-40 -left-24 h-72 w-72 rounded-full bg-emerald-500/25 blur-3xl animate-pulse-slow" />
        <div className="absolute -bottom-40 -right-16 h-80 w-80 rounded-full bg-cyan-500/30 blur-3xl animate-pulse-slow" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(148,163,184,0.15),transparent_60%)]" />
      </div>

      {/* نص الترحيب المتحرك (نفس رأس صفحة Login) */}
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

      {/* ===== الكرت الرئيسي (نفس روح كرت Login) ===== */}
      <main className="relative z-20 flex-1 flex items-center justify-center px-4 pb-8">
        <div className="w-full max-w-md">
          <div className="rounded-3xl border border-white/15 bg-slate-950/90 backdrop-blur-xl p-6 md:p-7 shadow-2xl shadow-emerald-500/25 flex flex-col justify-between login-card">
            <div className="space-y-6">
              {/* العنوان + الجملة المتغيرة + وصف ثابت */}
              <div className="space-y-2 text-center md:text-start">
                <h2 className="text-2xl md:text-3xl font-black tracking-tight">
                  <span className="bg-gradient-to-r from-emerald-300 via-cyan-300 to-sky-300 bg-clip-text text-transparent">
                    إنشاء حساب جديد
                  </span>
                </h2>

                {/* الجملة المتغيّرة اللي كانت عندك */}
                <p
                  className={
                    "text-[11px] text-emerald-200/80 italic transition-opacity duration-500 " +
                    (showHint ? "opacity-100" : "opacity-0")
                  }
                >
                  {HINT_LINES[hintIndex]}
                </p>

                <p className="text-sm text-slate-300 leading-relaxed">
                  أدخل بياناتك الأساسية لاختيار دورك في المنصّة والوصول إلى أدوات
                  إدارة العقارات، المواعيد، والمدفوعات بسهولة وأناقة من أي مكان.
                </p>
              </div>

              {/* النموذج */}
              <form onSubmit={onSubmit} className="space-y-4">
                <div>
                  <label className={labelCls}>الاسم الكامل</label>
                  <input
                    className={inputCls}
                    required
                    value={form.full_name}
                    onChange={(e) =>
                      setForm({ ...form, full_name: e.target.value })
                    }
                    placeholder="محمد الأمين السلمان"
                    autoComplete="name"
                  />
                </div>

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
                      autoComplete="new-password"
                      minLength={6}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 end-3 text-[11px] text-slate-400 hover:text-emerald-300 transition"
                      onClick={() => setShowPwd((v) => !v)}
                    >
                      {showPwd ? "إخفاء" : "إظهار"}
                    </button>
                  </div>
                </div>

                <div>
                  <label className={labelCls}>الدور في النظام</label>
                  <select
                    className={
                      inputCls +
                      " pr-8 bg-slate-950/80 cursor-pointer text-sm"
                    }
                    value={form.role}
                    onChange={(e) =>
                      setForm({ ...form, role: e.target.value })
                    }
                  >
                    <option value="client">عميل (باحث عن عقار)</option>
                    <option value="owner">مالك عقار</option>
                    <option value="admin">مشرف النظام</option>
                    {/* <option value="agent">وكيل مبيعات</option> */}
                    <option value="accountant">محاسب</option>
                    <option value="supplier">مورد / مقاول</option>
                    <option value="worker">فني / عامل صيانة</option>
                  </select>
                </div>

                {/* أزرار الإجراء */}
                <div className="pt-3 flex flex-col sm:flex-row gap-2">
                  <button
                    className="w-full sm:flex-1 px-5 py-2.5 rounded-xl bg-emerald-500 text-sm font-semibold text-black shadow-lg shadow-emerald-500/40 hover:bg-emerald-400 transition disabled:opacity-60 disabled:cursor-not-allowed"
                    disabled={busy}
                  >
                    {busy ? "جارٍ إنشاء الحساب…" : "إنشاء الحساب"}
                  </button>

                  <Link
                    to="/auth/login"
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-500/60 text-sm text-slate-200 hover:bg-white/5 text-center transition"
                  >
                    لدي حساب بالفعل
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>

      {/* ===== الفوتر (نفس ستايل Footer تبع Login) ===== */}
      <footer className="relative z-20 border-t border-white/10 bg-black/80 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 py-5 space-y-4 text-[11px] md:text-xs text-slate-300">
          <div className="flex items-center gap-2 text-emerald-300 font-semibold text-xs">
            <span className="text-base">🔒</span>
            <span>الخصوصية وحماية بيانات المستخدم</span>
          </div>

          <p className="leading-relaxed">
            عند إنشاء حساب في نظام{" "}
            <span className="font-semibold text-slate-100">
              Real Estate
            </span>
            ، فإنك تقرّ بأنك اطلعت على{" "}
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
            . يتم استخدام بيانات حسابك فقط لأغراض تشغيل النظام وتحسين تجربة
            الاستخدام، ولا يتم مشاركتها مع أي طرف ثالث غير مخوّل.
          </p>

          <div className="border-t border-white/10 pt-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="text-slate-400">
              © {new Date().getFullYear()} Real Estate System. جميع الحقوق
              محفوظة.
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-300">
              <Link
                to="/privacy"
                className="hover:text-emerald-300 transition"
              >
                سياسة الخصوصية
              </Link>
              <span className="h-1 w-1 rounded-full bg-slate-500/60" />
              <Link to="/terms" className="hover:text-emerald-300 transition">
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
