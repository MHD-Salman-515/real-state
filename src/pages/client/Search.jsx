// src/pages/client/Search.jsx
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useToast } from "../../components/ToastProvider.jsx";
import { store } from "../../lib/clientStore.js";

export default function Search() {
  const toast = useToast();
  const loc = useLocation();
  const navigate = useNavigate();

  // قراءة الفلاتر من URL
  const q = useMemo(
    () => Object.fromEntries(new URLSearchParams(loc.search)),
    [loc.search]
  );

  const [items, setItems] = useState([]);

  // ---------------------------------------------
  //                 🔥 تحميل العقارات + تطبيق الفلاتر
  // ---------------------------------------------
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("http://localhost:3000/properties");
        const all = await res.json();

        // 🔹 تجهيز العقارات لتتناسب مع الصفحة (نفس شغل الهوم)
        let formatted = all.map((p) => ({
          id: p.id,
          title: p.title,
          city: p.city,
          price: p.price,
          type: p.type,
          image: `http://localhost:3000${p.image}`,
          // حقول دمية لعدم وجودها بالباك
          area: 120,
          bedrooms: 3,
          bathrooms: 2,
          furnished: "غير مفروش",
          level: "الأول",
          status: "متاح",
          isFeatured: false,
          isNew: true,
          neighborhood: p.address || "",
        }));

        // 🔥 تطبيق الفلاتر
        if (q.city) {
          formatted = formatted.filter((p) =>
            p.city.toLowerCase().includes(q.city.toLowerCase())
          );
        }

        if (q.type) {
          formatted = formatted.filter((p) => p.type === q.type);
        }

        if (q.minPrice) {
          formatted = formatted.filter((p) => p.price >= Number(q.minPrice));
        }

        if (q.maxPrice) {
          formatted = formatted.filter((p) => p.price <= Number(q.maxPrice));
        }

        setItems(formatted);
      } catch (err) {
        console.error(err);
        toast.error("فشل تحميل العقارات");
      }
    }

    load();
  }, [q]);
  // ---------------------------------------------

  // شرايح الفلاتر
  const activeFilterChips = useMemo(() => {
    const chips = [];

    if (q.city) chips.push({ label: `المدينة: ${q.city}` });

    if (q.type) {
      const map = {
        apartment: "شقق",
        villa: "فلل",
        office: "مكاتب",
      };
      chips.push({ label: `النوع: ${map[q.type] || q.type}` });
    }

    if (q.minPrice)
      chips.push({
        label: `سعر من ${Number(q.minPrice).toLocaleString()} $`,
      });

    if (q.maxPrice)
      chips.push({
        label: `حتى ${Number(q.maxPrice).toLocaleString()} $`,
      });

    return chips;
  }, [q]);

  // حجز سريع
  const quickBook = (prop) => {
    store.saveDraft({ propId: String(prop.id), when: "", note: "" });
    toast.success(`تم تجهيز مسودة حجز للعقار رقم ${prop.id}`);
    navigate("/client/book-visit");
  };

  const resultCountLabel =
    items.length === 0
      ? "لا يوجد عقارات مطابقة حالياً"
      : items.length === 1
      ? "عقار واحد مطابق لمرشحاتك"
      : `${items.length} عقارات مطابقة لمرشحاتك`;

  // ---------------------------------------------
  //               🟢 واجهة الصفحة (لم تتغيير)
  // ---------------------------------------------
  return (
    <section className="relative z-10 max-w-6xl mx-auto px-4 lg:px-0 py-10 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-black tracking-tight">
          البحث المتقدم عن العقارات
        </h1>
        <p className="text-sm text-slate-300">
          استعرض العقارات المتاحة حسب المدينة، النوع، والسعر مع تفاصيل غنية
          تساعدك على اتخاذ القرار.
        </p>
      </div>

      {/* ملخص الفلاتر */}
      <div className="card-glass rounded-2xl border border-white/10 p-4 md:p-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <div className="text-xs text-slate-400">ملخص النتائج</div>
          <div className="text-sm text-emerald-200 font-medium">
            {resultCountLabel}
          </div>
        </div>

        <div className="flex-1 flex flex-col md:items-end gap-2">
          <div className="flex flex-wrap gap-2 justify-start md:justify-end">
            {activeFilterChips.length > 0 ? (
              activeFilterChips.map((chip, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 rounded-full border border-emerald-400/50 bg-emerald-500/10 px-3 py-1 text-[11px] text-emerald-100"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  {chip.label}
                </span>
              ))
            ) : (
              <span className="text-[11px] text-slate-500">
                لم تقم بتحديد أي مرشحات — يتم عرض بعض العقارات المقترحة.
              </span>
            )}
          </div>

          <div className="flex gap-2 justify-end">
            <Link
              to="/"
              className="px-4 py-2 rounded-xl border border-slate-500/50 text-slate-100 hover:bg-white/5 text-xs md:text-sm transition"
            >
              تعديل المرشحات
            </Link>
          </div>
        </div>
      </div>

      {/* شبكة النتائج */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {items.map((p) => (
          <article
            key={p.id}
            className="card-glass rounded-2xl border border-white/10 overflow-hidden hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-500/25 transition"
          >
            <div className="relative h-44 w-full overflow-hidden">
              <img
                src={p.image}
                alt={p.title}
                className="h-full w-full object-cover scale-105 hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

              <div className="absolute bottom-2 right-2 text-[11px] px-2.5 py-1 rounded-full bg-black/60 border border-white/20 text-slate-100">
                {p.city} • {p.neighborhood}
              </div>
            </div>

            <div className="p-4 space-y-3">
              <div>
                <h2 className="text-sm md:text-base font-semibold text-emerald-200 leading-snug">
                  {p.title}
                </h2>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  {p.status}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-200">
                <div className="rounded-xl bg-white/5 border border-white/10 px-2.5 py-1.5">
                  <div className="text-[10px] text-slate-400 mb-0.5">
                    المساحة
                  </div>
                  <div className="font-semibold">{p.area} م²</div>
                </div>
                <div className="rounded-xl bg-white/5 border border-white/10 px-2.5 py-1.5">
                  <div className="text-[10px] text-slate-400 mb-0.5">
                    الغرف / الحمامات
                  </div>
                  <div className="font-semibold">
                    {p.bedrooms} غرف • {p.bathrooms} حمام
                  </div>
                </div>
                <div className="rounded-xl bg-white/5 border border-white/10 px-2.5 py-1.5">
                  <div className="text-[10px] text-slate-400 mb-0.5">
                    الفرش
                  </div>
                  <div className="font-semibold">{p.furnished}</div>
                </div>
                <div className="rounded-xl bg-white/5 border border-white/10 px-2.5 py-1.5">
                  <div className="text-[10px] text-slate-400 mb-0.5">
                    الطابق
                  </div>
                  <div className="font-semibold">{p.level}</div>
                </div>
              </div>

              <div className="flex items-center justify-between mt-1">
                <div>
                  <div className="text-[11px] text-slate-400">
                    السعر التقديري
                  </div>
                  <div className="text-lg font-extrabold text-emerald-300">
                    {p.price.toLocaleString()} ${" "}
                    <span className="text-xs text-slate-400 font-normal">
                      / شهر
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <Link
                    to={`/property/${p.id}`}
                    className="px-3 py-1.5 rounded-xl border border-emerald-400/70 text-[11px] text-emerald-100 hover:bg-emerald-500/10 transition"
                  >
                    التفاصيل
                  </Link>
                  <button
                    type="button"
                    onClick={() => quickBook(p)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-500 text-[11px] font-semibold text-black hover:bg-emerald-400 shadow shadow-emerald-500/40 transition"
                  >
                    حجز معاينة سريع
                  </button>
                </div>
              </div>
            </div>
          </article>
        ))}

        {items.length === 0 && (
          <div className="text-slate-400 text-center col-span-full py-10 text-sm">
            لا يوجد نتائج مطابقة لمرشحاتك الحالية. جرّب توسيع نطاق البحث أو
            تعديل السعر.
          </div>
        )}
      </div>
    </section>
  );
}
