// src/pages/client/PropertyDetails.jsx

import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useToast } from "../../components/ToastProvider.jsx";
import { store } from "../../lib/clientStore.js";

export default function PropertyDetails() {
  const { id } = useParams();
  const toast = useToast();
  const [isFav, setIsFav] = useState(false);

  // العقار الحقيقي من الباك
  const [item, setItem] = useState(null);

  // تحميل العقار
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`http://localhost:3000/properties/${id}`);
        const data = await res.json();
        setItem(data);
      } catch {
        toast.error("فشل تحميل تفاصيل العقار");
      }
    }
    load();
  }, [id]);

  // عند فتح الصفحة
  useEffect(() => {
    if (!id) return;
    store.addRecent(String(id));
    setIsFav(store.isFav(String(id)));
  }, [id]);

  const toggleFav = () => {
    const key = String(id);
    if (store.isFav(key)) {
      store.removeFav(key);
      setIsFav(false);
      toast.info("تم إزالة العقار من المفضلة");
    } else {
      store.addFav(key);
      setIsFav(true);
      toast.success("تمت إضافة العقار إلى المفضلة");
    }
  };

  const startDraft = () => {
    store.saveDraft({ propId: String(id), when: "", note: "" });
    toast.info("تم إنشاء مسودة حجز للعقار");
  };

  // === شاشة التحميل ===
  if (!item) {
    return (
      <div className="text-center text-slate-300 py-20">
        جارِ تحميل تفاصيل العقار...
      </div>
    );
  }

  // صورة العقار من الباك
  const mainImage = item.image
    ? `http://localhost:3000${item.image}`
    : "https://images.unsplash.com/photo-1502672023488-70e25813eb80?auto=format&fit=crop&w=1400&q=80";

  return (
    <section className="relative z-10 max-w-6xl mx-auto px-4 lg:px-0 py-10">
      {/* Breadcrumb */}
      <div className="mb-3 text-[11px] text-slate-400 flex items-center gap-2">
        <Link to="/" className="hover:text-emerald-300 transition">
          الواجهة الرئيسية ⟵
        </Link>
        <span className="opacity-40">/</span>
        <Link to="/search" className="hover:text-emerald-300 transition">
          نتائج البحث
        </Link>
        <span className="opacity-40">/</span>
        <span>تفاصيل العقار #{item.id}</span>
      </div>

      <div className="card-glass border border-white/15 rounded-2xl p-5 md:p-6 shadow-soft space-y-6 bg-black/30 backdrop-blur-xl">
        <div className="grid gap-6 lg:grid-cols-[1.6fr_minmax(0,1.05fr)]">
          {/* معرض الصور */}
          <div className="space-y-3">
            <div className="relative rounded-2xl overflow-hidden border border-white/15 bg-slate-900/60">
              <img
                src={mainImage}
                alt={item.title}
                className="h-64 md:h-80 w-full object-cover"
              />

              <button
                type="button"
                onClick={toggleFav}
                className="absolute top-3 right-3 h-10 w-10 rounded-2xl border border-emerald-300/40 bg-black/40 backdrop-blur-xl shadow hover:scale-105 transition"
                aria-label="favorite"
              >
                <span className="text-lg">{isFav ? "💚" : "🤍"}</span>
              </button>

              <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5 flex justify-between">
                <h1 className="text-xl md:text-2xl font-black">
                  {item.title}
                </h1>

                <div className="text-right">
                  <div className="text-[11px] text-slate-300">
                    السعر التقريبي
                  </div>
                  <div className="text-2xl md:text-3xl font-extrabold text-emerald-300">
                    {item.price?.toLocaleString()} $
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* صندوق جانبي */}
          <aside className="rounded-2xl border border-emerald-400/40 bg-gradient-to-br from-slate-950 to-slate-900 p-4 md:p-5 space-y-4">
            <p className="text-xs text-slate-300">
              أضف العقار إلى المفضلة أو احجز معاينة.
            </p>

            <div className="flex flex-col gap-2">
              <button
                onClick={toggleFav}
                className={
                  "w-full px-4 py-2.5 rounded-xl text-sm font-semibold transition " +
                  (isFav
                    ? "bg-slate-950 border border-emerald-400/70 text-emerald-200"
                    : "bg-emerald-500 text-black hover:bg-emerald-400")
                }
              >
                {isFav ? "إزالة من المفضلة" : "إضافة إلى المفضلة"}
              </button>

              <Link
                to="/client/book-visit"
                onClick={startDraft}
                className="text-center px-4 py-2.5 rounded-xl border border-slate-500/60 text-sm text-slate-100 hover:bg-white/5 transition"
              >
                إنشاء حجز معاينة
              </Link>

              <Link
                to={`/property/${id}/create-ticket`}
                className="btn-primary w-full text-center"
              >
                إرسال طلب صيانة
              </Link>

            </div>

            {/* معلومات سريعة */}
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-200 pt-2">
              <div className="rounded-xl bg-black/40 border border-white/10 p-2">
                <div className="text-[11px] text-slate-400">رقم العقار</div>
                <div className="font-mono text-sm">#{item.id}</div>
              </div>

              <div className="rounded-xl bg-black/40 border border-white/10 p-2">
                <div className="text-[11px] text-slate-400">المدينة</div>
                <div className="font-semibold">{item.city}</div>
              </div>
            </div>
          </aside>
        </div>

        {/* الوصف */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-100">
            وصف العقار
          </h2>
          <p className="text-sm md:text-base text-slate-200 leading-relaxed">
            {item.description}
          </p>
        </div>

        {/* رجوع */}
        <div className="pt-2">
          <Link
            to="/search"
            className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-emerald-300 transition"
          >
            <span>⟵</span>
            <span>العودة إلى نتائج البحث</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
