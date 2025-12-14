// src/pages/client/Home.jsx
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "../../components/ToastProvider.jsx";

const DRAFT_KEY = "bookvisit_draft_v1";
const LAST_SEARCH_KEY = "last_search_v1";

export default function Home() {
  const nav = useNavigate();
  const toast = useToast();

  // 🔎 نموذج بحث سريع
  const [quick, setQuick] = useState({
    city: "",
    type: "",
    minPrice: "",
    maxPrice: "",
  });

  // 👤 بروفايل
  const [me, setMe] = useState(null);

  // 📝 هل في مسودة حجز؟
  const [hasDraft, setHasDraft] = useState(false);

  // 🧠 آخر بحث محفوظ
  const [lastSearch, setLastSearch] = useState(null);

  // 🧾 إظهار كرت الموافقة على الشروط (يبدأ true عشان يطلع دائماً أول الدخول)
  const [showTerms, setShowTerms] = useState(true);

  useEffect(() => {
    try {
      // ✅ نقرأ من auth_user_v1 (نفس اللي يحدّثه ملف Profile)
      const raw = localStorage.getItem("auth_user_v1");
      if (raw) {
        const u = JSON.parse(raw);

        // نحسب اسم العرض: fullName أو full_name أو name
        const displayName = u.fullName || u.full_name || u.name || "";

        setMe({
          ...u,
          displayName,
        });

        if (displayName) {
          toast.success(`أهلًا ${displayName}!`);
        }
      }
    } catch {}

    try {
      const draft = localStorage.getItem(DRAFT_KEY);
      const exists = !!draft;
      setHasDraft(exists);
      if (exists)
        toast.info("لديك مسودة حجز غير مكتملة — يمكنك متابعتها الآن.");
    } catch {}

    try {
      const s = localStorage.getItem(LAST_SEARCH_KEY);
      if (s) setLastSearch(JSON.parse(s));
    } catch {}

    // ✅ ما عاد في تحقق من الشروط ولا localStorage للشروط
    // showTerms = true من البداية → الكرت يطلع مباشرة عند الدخول
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sanitizeNum = (v) => v.replace(/[^\d]/g, "");
  const onlyNum = (v) => sanitizeNum(v);

  const onQuickSearch = (e) => {
    e.preventDefault();

    // تأكيد القيم الرقمية + إصلاح حالة min>max
    let min = quick.minPrice ? Number(quick.minPrice) : "";
    let max = quick.maxPrice ? Number(quick.maxPrice) : "";
    if (min !== "" && max !== "" && min > max) {
      const tmp = min;
      min = max;
      max = tmp;
      toast.info("تم تصحيح حدود السعر (الأدنى/الأقصى)");
    }

    const query = {
      city: quick.city.trim(),
      type: quick.type,
      ...(min !== "" ? { minPrice: String(min) } : {}),
      ...(max !== "" ? { maxPrice: String(max) } : {}),
    };

    // حفظ آخر بحث
    try {
      localStorage.setItem(LAST_SEARCH_KEY, JSON.stringify(query));
    } catch {}

    const p = new URLSearchParams();
    Object.entries(query).forEach(([k, v]) => v && p.set(k, v));
    toast.success("تم تنفيذ البحث السريع");
    nav(`/search?${p.toString()}`);
  };

  // 🏡 داتا العقارات من الباك
  const [properties, setProperties] = useState([]);

  const featured = properties.map((p) => ({
    id: p.id,
    title: p.title,
    city: p.city,
    country: "—",
    area: 120,
    price: p.price ?? 0,
    type_label: p.type,
    beds: 3,
    baths: 2,
    image: p.image
      ? `http://localhost:3000${p.image}`
      : "https://via.placeholder.com/600x400",
    tag: "عرض جديد",
  }));

  const mainFeatured = featured.length > 0 ? featured[0] : null;

  useEffect(() => {
    async function loadProperties() {
      try {
        const res = await fetch("http://localhost:3000/properties");
        const data = await res.json();
        setProperties(data);
      } catch (e) {
        console.error(e);
        toast.error("فشل تحميل العقارات");
      }
    }

    loadProperties();
  }, [toast]);

  // أصناف الإدخال الموحدة (ستايل متوافق مع ثيم الموقع)
  const inputMini =
    "h-11 w-full rounded-xl bg-black/30 backdrop-blur-xl \
border border-emerald-400/20 text-emerald-100 placeholder-emerald-300/30 \
shadow-inner shadow-black/40 \
focus:outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-400/40 \
transition duration-300";

  const selectMini =
    "h-11 w-full rounded-xl bg-black/30 backdrop-blur-xl \
border border-emerald-400/20 text-emerald-100 \
shadow-lg shadow-emerald-700/20 \
hover:border-emerald-300 hover:shadow-emerald-400/30 \
focus:outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-400/50 \
transition duration-300";

  const applyLastSearch = () => {
    if (!lastSearch) return;
    const q = new URLSearchParams();
    Object.entries(lastSearch).forEach(([k, v]) => v && q.set(k, v));
    toast.info("تم تطبيق آخر مرشحات بحث");
    nav(`/search?${q.toString()}`);
  };

  const clearLastSearch = () => {
    try {
      localStorage.removeItem(LAST_SEARCH_KEY);
    } catch {}
    setLastSearch(null);
    toast.info("تم مسح آخر بحث محفوظ");
  };

  const resetForm = () => {
    setQuick({ city: "", type: "", minPrice: "", maxPrice: "" });
    toast.info("تمت إعادة ضبط نموذج البحث");
  };

  // ✅ حالة اكتمال / نقص بيانات الملف الشخصي
  const isProfileIncomplete =
    !me ||
    !me.displayName ||
    !(me.phone || me.phoneNumber);

  // ✅ التعامل مع الموافقة / الرفض
  const handleAcceptTerms = () => {
    // ما عاد نخزّن شي، بس نسكر الكرت بهي الجلسة
    setShowTerms(false);
    toast.success("تمت الموافقة على الشروط وسياسة الخصوصية لهذه الجلسة");
  };

  const handleRejectTerms = () => {
    toast.error("لا يمكن استخدام المنصّة بدون الموافقة على الشروط");
    nav("/login");
  };

  return (
    <div className="min-h-screen bg-luxury text-white overflow-hidden relative flex flex-col">
      {/* خلفيات متحركة خفيفة تعطي فخامة */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 -left-32 h-72 w-72 rounded-full bg-amber-500/20 blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-emerald-500/20 blur-3xl animate-pulse" />
      </div>

      {/* ✅ Overlay كرت الموافقة على الشروط */}
      {showTerms && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 backdrop-blur-lg px-4">
          <div className="relative max-w-xl w-full">
            {/* توهّج حوالين الكرت */}
            <div className="absolute -inset-[2px] rounded-3xl bg-gradient-to-l from-emerald-500/70 via-emerald-300/30 to-amber-400/70 opacity-70 blur-sm" />
            <div className="relative rounded-3xl bg-black/90 border border-emerald-300/60 shadow-2xl shadow-black/70 p-6 md:p-7 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-300/50 text-[11px] text-emerald-100">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                    <span>اتفاقية استخدام منصّة Real State</span>
                  </div>
                  <h2 className="mt-2 text-lg md:text-xl font-bold">
                    نحتاج موافقتك قبل متابعة استخدام المنصّة
                  </h2>
                </div>
              </div>

              <p className="text-xs md:text-sm text-slate-200">
                باستخدامك لهذا النظام، فإنك تقرّ بأنك قرأت وفهمت{" "}
                <span className="text-emerald-300">
                  شروط الاستخدام وسياسة الخصوصية
                </span>{" "}
                الخاصة بمنصّة Real State، وأنك ملتزم بالتعامل الجاد مع الحجوزات
                والبيانات المدخلة.
              </p>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-3 md:p-4 text-[11px] md:text-xs text-slate-200 space-y-1.5 max-h-48 overflow-y-auto">
                <p className="font-semibold text-emerald-200">
                  أهم النقاط التي توافق عليها:
                </p>
                <ul className="list-disc list-inside space-y-1">
                  <li>استخدام بيانات صحيحة ومحدّثة عند إنشاء أو تعديل الحجوزات.</li>
                  <li>عدم إنشاء حجوزات وهمية أو مضلّلة أو بهدف الإزعاج.</li>
                  <li>الموافقة على أن التواصل قد يتم عبر رقم الهاتف أو البريد المسجّل.</li>
                  <li>احترام أوقات المعاينة المتفق عليها مع الوسطاء وأصحاب العقارات.</li>
                  <li>
                    الموافقة على سياسة الخصوصية وحفظ بياناتك ضمن حدود المنصّة وعدم
                    مشاركتها مع أطراف غير مخوّلة.
                  </li>
                </ul>
              </div>

              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-2">
                <button
                  onClick={handleRejectTerms}
                  type="button"
                  className="w-full md:w-auto order-2 md:order-1 px-4 py-2.5 rounded-xl border border-red-400/70 text-red-200 text-sm hover:bg-red-500/10 transition"
                >
                  لا أوافق – العودة لتسجيل الدخول
                </button>
                <button
                  onClick={handleAcceptTerms}
                  type="button"
                  className="w-full md:w-auto order-1 md:order-2 btn-gold text-sm font-semibold"
                >
                  أوافق على جميع الشروط والمتابعة
                </button>
              </div>

              <div className="text-[10px] md:text-[11px] text-slate-500 pt-1">
                يمكنك الاطّلاع على التفاصيل الكاملة من صفحة{" "}
                <Link
                  to="/legal"
                  className="underline underline-offset-2 text-emerald-300 hover:text-emerald-100"
                  onClick={() =>
                    toast.info("تم فتح صفحة الشروط وسياسة الخصوصية")
                  }
                >
                  الشروط والخصوصية
                </Link>
                .
              </div>
            </div>
          </div>
        </div>
      )}

      {/* المحتوى الرئيسي */}
      <main className="relative z-10 max-w-6xl mx-auto px-4 lg:px-0 pb-10 space-y-12 w-full flex-1">
        {/* هيرو + بحث + مسودات + بروفايل */}
        <section className="grid lg:grid-cols-[1.1fr_0.9fr] gap-10 items-start pt-8 md:pt-12">
          {/* النصوص + البحث السريع + آخر بحث + مسودة */}
          <div className="space-y-6 animate-slide-up">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-white/5 px-3 py-1 text-xs text-emerald-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              عروض حصرية على العقارات الفاخرة
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black leading-tight">
              اكتشف عالم{" "}
              <span className="bg-gradient-to-r from-emerald-300 via-cyan-300 to-sky-300 bg-clip-text text-transparent">
                العقارات الفاخرة
              </span>{" "}
              بإحساس جديد.
            </h1>

            <p className="text-sm md:text-base text-slate-300 max-w-xl">
              منصة عقارية متكاملة لإدارة وحجز ومتابعة العقارات الفاخرة، مع
              تجربة مستخدم أنيقة، وواجهات تفاعلية، وانتقالات حركية تخلّي
              الموقع يعيش مع المستخدم مو بس يعرض بيانات. رشّح حسب المدينة
              والسعر والنوع واحجز المعاينة فوراً.
            </p>

            {/* أزرار الأكشن الأساسية */}
            <div className="flex flex-wrap items-center gap-4">
              <Link
                to="/search"
                className="btn-gold"
                onClick={() => toast.info("انتقلت إلى البحث المتقدم")}
              >
                استكشف العقارات الآن
              </Link>
              <Link
                to="/client/book-visit"
                className="btn-ghost-gold"
                onClick={() => toast.info("اذهب لإكمال طلب المعاينة")}
              >
                حجز معاينة فورية
              </Link>
            </div>

            {/* بانر آخر بحث محفوظ */}
            {lastSearch && (
              <div className="card-glass border border-emerald-300/40 p-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="text-sm text-slate-200">
                  لديك <strong>آخر بحث محفوظ</strong>:
                  <span className="ms-2 font-mono text-emerald-100">
                    {Object.entries(lastSearch)
                      .map(([k, v]) => `${k}:${v}`)
                      .join(" • ")}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="btn-ghost-gold px-4 py-2 text-xs md:text-sm"
                    onClick={applyLastSearch}
                  >
                    تطبيق
                  </button>
                  <button
                    className="px-3 py-2 rounded-lg border border-slate-500/60 text-xs md:text-sm hover:bg:white/5 transition"
                    onClick={clearLastSearch}
                  >
                    مسح
                  </button>
                </div>
              </div>
            )}

            {/* نموذج بحث سريع داخل الهيرو */}
            <form
              onSubmit={onQuickSearch}
              className="
  grid sm:grid-cols-2 gap-4
  bg-white/5 backdrop-blur-xl
  border border-emerald-300/20
  p-5 rounded-2xl
  shadow-lg shadow-emerald-600/10
"
            >
              <input
                className={inputMini}
                placeholder="المدينة (مثال: دمشق)"
                aria-label="المدينة"
                value={quick.city}
                onChange={(e) =>
                  setQuick({ ...quick, city: e.target.value })
                }
              />
              <select
                className={selectMini}
                value={quick.type}
                onChange={(e) => setQuick({ ...quick, type: e.target.value })}
              >
                <option value="">النوع</option>
                <option value="APARTMENT">شقة</option>
                <option value="VILLA">فيلا</option>
                <option value="HOUSE">منزل</option>
                <option value="STUDIO">ستوديو</option>
              </select>

              <input
                className={inputMini}
                inputMode="numeric"
                placeholder="السعر الأدنى"
                aria-label="السعر الأدنى"
                value={quick.minPrice}
                onChange={(e) =>
                  setQuick({ ...quick, minPrice: onlyNum(e.target.value) })
                }
              />
              <input
                className={inputMini}
                inputMode="numeric"
                placeholder="السعر الأقصى"
                aria-label="السعر الأقصى"
                value={quick.maxPrice}
                onChange={(e) =>
                  setQuick({ ...quick, maxPrice: onlyNum(e.target.value) })
                }
              />
              <div className="sm:col-span-2 flex justify-end gap-2">
                <button
                  type="button"
                  className="px-3 py-2 rounded-lg border border-slate-500/60 hover:bg-white/5 transition text-sm"
                  onClick={resetForm}
                >
                  تنظيف الحقول
                </button>
                <button className="btn-gold text-sm" type="submit">
                  بحث سريع
                </button>
              </div>
            </form>

            {/* بانر متابعة المسودة إن وجدت */}
            {hasDraft && (
              <div className="card-glass border border-emerald-300/50 p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="text-sm text-slate-100">
                  لديك <strong>مسودة حجز</strong> غير مكتملة — أكملها الآن.
                </div>
                <Link
                  to="/client/book-visit"
                  className="btn-ghost-gold"
                  onClick={() => toast.info("تم فتح صفحة متابعة الحجز")}
                >
                  متابعة الحجز
                </Link>
              </div>
            )}
          </div>

          {/* الكروت اليمين - عرض مميز + بروفايل + كروت صغيرة */}
          <div className="relative lg:pl-8 space-y-4">
            {/* ظل متحرك */}
            <div className="absolute -inset-6 bg-gradient-to-tr from-emerald-500/35 via-cyan-500/10 to-sky-400/25 blur-3xl opacity-70" />

            <div className="relative space-y-4">
              {/* كرت رئيسي عرض مميز بصورة فعلية */}
              {mainFeatured && (
                <div className="card-glass p-4 md:p-5 lg:p-6 animate-float hover:-translate-y-2 hover:scale-[1.02] transition duration-700">
                  <div className="flex justify-between items-center mb-3">
                    <div className="text-xs font-semibold text-emerald-200 uppercase tracking-wide">
                      عرض مميز اليوم
                    </div>
                    <span className="rounded-full bg-emerald-400/15 text-emerald-200 text-[11px] px-2 py-1">
                      {mainFeatured.tag}
                    </span>
                  </div>
                  <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-white/15 mb-4">
                    <img
                      src={mainFeatured.image}
                      alt={mainFeatured.title}
                      className="w-full h-full object-cover transform hover:scale-105 transition duration-700"
                    />
                  </div>
                </div>
              )}

              {/* كرت البروفايل */}
              <aside className="card-glass p-5">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-emerald-400/15 border border-emerald-300/70 shadow-sm flex items-center justify-center text-lg">
                    {me?.displayName?.[0] || "👤"}
                  </div>
                  <div>
                    <div className="font-semibold">
                      {me?.displayName || "ضيف المنصة"}
                    </div>
                    <div className="text-sm text-slate-300">
                      {me?.phone || me?.phoneNumber || "بدون رقم هاتف مسجل"}
                    </div>
                  </div>
                </div>

                {isProfileIncomplete ? (
                  // 🟡 نصيحة تظهر فقط إذا لم يكتمل الملف الشخصي
                  <div className="mt-4 p-3 rounded-xl bg-white/5 border border-emerald-300/40 text-sm text-slate-100">
                    <div className="font-semibold mb-1">نصيحة سريعة</div>
                    حدّث بياناتك في{" "}
                    <Link
                      to="/client/profile"
                      className="underline text-emerald-200 hover:text-emerald-100"
                      onClick={() =>
                        toast.info("تحديث بيانات الملف الشخصي من صفحة البروفايل")
                      }
                    >
                      الملف الشخصي
                    </Link>{" "}
                    لسهولة التواصل مع الوسطاء وتأكيد المواعيد بسرعة أكبر.
                  </div>
                ) : (
                  // ✅ رسالة بسيطة بعد ما يُكمل بياناته
                  <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-300/60 text-sm text-emerald-100">
                    <div className="font-semibold mb-1">ملفك محدث ✅</div>
                    بيانات تواصلك جاهزة، يمكنك متابعة حجز المعاينات والعروض بثقة.
                  </div>
                )}
              </aside>

              {/* كروت صغيرة لمدن عالمية */}
              <div className="grid sm:grid-cols-2 gap-3 md:gap-4">
                <div className="card-glass p-3 hover:-translate-y-2 hover:scale-105 transition duration-500">
                  <div className="text-xs text-slate-300 mb-1">
                    شقة فاخرة
                  </div>
                  <div className="font-semibold text-sm mb-2">
                    إسطنبول - البوسفور
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-300">
                    <span>3 غرف • 160 م²</span>
                    <span className="text-emerald-300 font-semibold">
                      530K $
                    </span>
                  </div>
                </div>
                <div className="card-glass p-3 hover:-translate-y-2 hover:scale-105 transition duration-500">
                  <div className="text-xs text-slate-300 mb-1">
                    بنتهاوس
                  </div>
                  <div className="font-semibold text-sm mb-2">
                    برلين - مركز المدينة
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-300">
                    <span>4 غرف • 210 م²</span>
                    <span className="text-emerald-300 font-semibold">
                      890K €
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* عروض مميّزة (دمي) – كروت مع صور فخمة + تفاصيل أكثر */}
        <section className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold">عروض مميّزة من حول العالم</h3>
            <Link
              to="/search"
              className="text-sm text-emerald-300 hover:text-emerald-100 transition"
              onClick={() => toast.info("عرض كل العروض")}
            >
              عرض الكل
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {featured.map((p) => (
              <article
                key={p.id}
                className="card-glass overflow-hidden group hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/25 transition"
              >
                <div className="relative aspect-[16/10] bg-slate-900/60 border-b border-white/10 overflow-hidden">
                  <img
                    src={p.image}
                    alt={p.title}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90" />
                  <div className="absolute top-2 left-2 flex gap-2 text-[10px]">
                    <span className="rounded-full bg-emerald-500/20 border border-emerald-300/60 px-2 py-0.5 text-emerald-200">
                      {p.tag}
                    </span>
                    <span className="rounded-full bg-black/40 border border-white/30 px-2 py-0.5 text-slate-100">
                      {p.type_label}
                    </span>
                  </div>
                  <div className="absolute bottom-2 left-3 right-3 text-xs text-slate-100">
                    <div className="font-semibold text-sm line-clamp-1">
                      {p.title}
                    </div>
                    <div className="flex items-center justify-between gap-2 text-[11px] text-slate-300">
                      <span className="line-clamp-1">
                        {p.city} • {p.country}
                      </span>
                      <span>📏 {p.area} م²</span>
                    </div>
                  </div>
                </div>
                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span>
                      🛏 {p.beds || 0} • 🛁 {p.baths} • 🏷 {p.type_label}
                    </span>
                    <span className="font-bold text-emerald-300 text-sm">
                      {p.price.toLocaleString()}{" "}
                      <span className="text-[11px] text-slate-400">USD</span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[11px] text-slate-400">
                      تمويل ميسّر وخطط دفع مرنة تتوفر حسب الدولة.
                    </span>
                    <Link
                      to={`/property/${p.id}`}
                      className="text-xs px-3 py-1.5 rounded-lg border border-emerald-400/70 text-emerald-200 hover:bg-emerald-500/10 transition whitespace-nowrap"
                      onClick={() =>
                        toast.info(`فتح تفاصيل العرض رقم ${p.id}`)
                      }
                    >
                      التفاصيل
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* 🔐 قسم الحقوق وتعليمات النظام (يبقى ثابت للمراجعة) */}
        <section className="pt-6 pb-4">
          <div className="relative">
            {/* إطار متوهّج حوالين القسم */}
            <div className="absolute -inset-[1px] rounded-3xl bg-gradient-to-l from-emerald-500/60 via-emerald-300/20 to-amber-400/50 opacity-60 blur-[2px]" />
            <div className="relative rounded-3xl bg-black/60 border border-emerald-300/40 shadow-xl shadow-black/40 p-5 md:p-7 space-y-5">
              <div className="flex flex-wrap items-center gap-3 justify-between">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-300/40 text-[11px] text-emerald-100">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                    <span>سياسة الاستخدام وحقوق المنصّة</span>
                  </div>
                  <h2 className="text-lg md:text-xl font-bold">
                    استخدام آمن وشفاف لمنصّة{" "}
                    <span className="text-emerald-300">Real State</span>
                  </h2>
                  <p className="text-xs md:text-sm text-slate-300 max-w-2xl">
                    قبل متابعة التصفّح أو حجز المعاينات، يُرجى قراءة النقاط التالية
                    لضمان تجربة عادلة وآمنة لجميع الأطراف (العملاء، الوسطاء، وأصحاب
                    العقارات).
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4 md:gap-6 text-xs md:text-sm">
                {/* عمود حقوق المستخدم */}
                <div className="space-y-2 rounded-2xl bg-gradient-to-b from-emerald-500/10 via-black/40 to-black/60 border border-emerald-300/40 p-4">
                  <h3 className="font-semibold text-emerald-200 mb-1">
                    ✅ حقوق المستخدم
                  </h3>
                  <ul className="space-y-1.5 text-slate-200 list-disc list-inside">
                    <li>الاطّلاع على تفاصيل العقار قبل طلب المعاينة.</li>
                    <li>إلغاء أو تعديل طلب المعاينة ضمن المدة المسموح بها.</li>
                    <li>حماية بيانات التواصل وعدم مشاركتها مع أطراف غير مخوّلة.</li>
                    <li>استقبال إشعارات واضحة حول حالة طلباتك وحجوزاتك.</li>
                  </ul>
                </div>

                {/* عمود تعليمات الحجز والاستخدام */}
                <div className="space-y-2 rounded-2xl bg-gradient-to-b from-amber-400/10 via-black/40 to-black/60 border border-amber-300/40 p-4">
                  <h3 className="font-semibold text-amber-200 mb-1">
                    📌 تعليمات استخدام وحجز
                  </h3>
                  <ul className="space-y-1.5 text-slate-200 list-disc list-inside">
                    <li>المعلومات المدخلة بالحجز يجب أن تكون صحيحة ومحدّثة.</li>
                    <li>أي حجز وهمي أو بيانات مضلّلة قد يعرّض الحساب للتعليق.</li>
                    <li>تأكيد المعاينة يعتمد على توفّر العقار وموافقة الوسيط.</li>
                    <li>قد تُطلب دفعة تأمينية أو تأكيد إضافي لبعض العقارات.</li>
                  </ul>
                </div>

                {/* عمود الخصوصية والدعم */}
                <div className="space-y-2 rounded-2xl bg-gradient-to-b from-cyan-400/10 via-black/40 to-black/60 border border-cyan-300/40 p-4">
                  <h3 className="font-semibold text-cyan-200 mb-1">
                    🔒 الخصوصية والدعم
                  </h3>
                  <ul className="space-y-1.5 text-slate-200 list-disc list-inside">
                    <li>يُستخدم رقم الهاتف فقط للتواصل بخصوص الحجوزات والعروض.</li>
                    <li>لا يتم مشاركة بياناتك مع معلنين خارجيين بدون موافقتك.</li>
                    <li>
                      في حال وجود مشكلة، يمكنك التواصل من خلال صفحة{" "}
                      <span className="text-emerald-200">الدعم الفني</span> أو
                      المساعدة داخل النظام.
                    </li>
                    <li>
                      استخدامك للمنصة يعني موافقتك على{" "}
                      <span className="text-emerald-200">
                        شروط الاستخدام وسياسة الخصوصية.
                      </span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="text-[11px] md:text-xs text-slate-400 border-t border-white/5 pt-3 mt-1 flex flex-wrap gap-2 justify-between">
                <span>
                  آخر تحديث للسياسات: <span className="text-emerald-200">2025</span>
                </span>
                <span>
                  للاطلاع على النسخة الكاملة، راجع صفحة{" "}
                  <Link
                    to="/legal"
                    className="underline underline-offset-2 text-emerald-200 hover:text-emerald-100"
                    onClick={() =>
                      toast.info("تم فتح صفحة الشروط وسياسة الخصوصية")
                    }
                  >
                    الشروط والخصوصية
                  </Link>
                  .
                </span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* فوتر حقوق الطبع والنشر – بنفس ثيم الموقع */}
      <footer className="relative z-10 border-t border-white/10 bg-black/40 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 lg:px-0 py-4 flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-slate-300">
          <span>© 2025 RealState Properties. جميع الحقوق محفوظة.</span>
          <span className="text-slate-400">تصميم وتطوير: ----</span>
        </div>
      </footer>
    </div>
  );
}
