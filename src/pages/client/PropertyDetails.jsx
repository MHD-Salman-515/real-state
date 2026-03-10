// src/pages/client/PropertyDetails.jsx

import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useToast } from "../../components/ToastProvider.jsx";
import { store } from "../../lib/clientStore.js";
import { buildApiUrl, resolveApiAssetUrl } from "../../api/axios";
import { useNotifications } from "@/components/notifications/useNotifications";
import { useAuth } from "@/context/AuthContext.jsx";
import { requireAuthOrRedirect } from "@/utils/requireAuthAction";
import { getPropertyById } from "@/data/propertiesStore";

const USE_LOCAL_DATA = import.meta.env.VITE_DATA_SOURCE === "local";

export default function PropertyDetails() {
  const { id } = useParams();
  const nav = useNavigate();
  const loc = useLocation();
  const toast = useToast();
  const { notify } = useNotifications();
  const { user, token } = useAuth();
  const isAuthenticated = Boolean(user || token);
  const [isFav, setIsFav] = useState(false);
  const [activeRoom, setActiveRoom] = useState("ALL");
  const placeholderSrc = "/img/placeholder-property.jpg";

  // العقار الحقيقي من الباك
  const [item, setItem] = useState(null);

  // تحميل العقار
  useEffect(() => {
    async function load() {
      try {
        if (USE_LOCAL_DATA) {
          const local = getPropertyById(String(id));
          if (!local) throw new Error("Not found");
          setItem({
            id: local.id,
            title: local.title,
            city: local.city,
            address: local.district,
            type: local.type,
            price: local.price_syp,
            description: local.description_ar,
            image: local.images?.[0] || placeholderSrc,
            images: (local.images || []).map((url, idx) => ({
              url,
              room: "LIVING",
              caption: idx === 0 ? "غرفة معيشة" : `صورة ${idx + 1}`,
              sortOrder: idx + 1,
            })),
          });
          return;
        }

        const res = await fetch(buildApiUrl(`/properties/${id}`));
        const data = await res.json();
        setItem(data);
      } catch {
        toast.error("فشل تحميل تفاصيل العقار");
      }
    }
    load();
  }, [id, toast]);

  // عند فتح الصفحة
  useEffect(() => {
    if (!id) return;
    store.addRecent(String(id));
    setIsFav(store.isFav(String(id)));
  }, [id]);

  const toggleFav = () => {
    if (!requireAuthOrRedirect({ isAuthenticated, nav, loc })) return;
    const key = String(id);
    const propertyTitle = item?.title || `Property #${key}`;
    if (store.isFav(key)) {
      store.removeFav(key);
      setIsFav(false);
      toast.info("تم إزالة العقار من المفضلة");
      notify({
        type: "properties",
        title: "Removed from favorites",
        message: `${propertyTitle} was removed from your favorites.`,
      });
    } else {
      store.addFav(key);
      setIsFav(true);
      toast.success("تمت إضافة العقار إلى المفضلة");
      notify({
        type: "properties",
        title: "Saved to favorites",
        message: `${propertyTitle} was added to your favorites.`,
      });
    }
  };

  const startDraft = (event) => {
    if (!requireAuthOrRedirect({ isAuthenticated, nav, loc, nextPath: "/client/book-visit" })) {
      if (event?.preventDefault) event.preventDefault();
      return;
    }
    store.saveDraft({ propId: String(id), when: "", note: "" });
    toast.info("تم إنشاء مسودة حجز للعقار");
    notify({
      type: "system",
      title: "Draft saved",
      message: "Your visit request draft was saved.",
    });
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
    ? USE_LOCAL_DATA
      ? item.image
      : resolveApiAssetUrl(item.image)
    : placeholderSrc;

  const roomLabel = {
    ALL: "الكل",
    LIVING: "المعيشة",
    KITCHEN: "المطبخ",
    BEDROOM: "غرف النوم",
    BATHROOM: "الحمامات",
    BALCONY: "الشرفة",
    EXTERIOR: "الخارج",
  };

  const normalizeImageUrl = (value) => {
    const raw = String(value || "").trim();
    if (!raw) return placeholderSrc;
    if (raw.startsWith("/demo-images/")) return raw;
    return USE_LOCAL_DATA ? raw : resolveApiAssetUrl(raw);
  };

  const roomImages = Array.isArray(item.images) ? item.images : [];
  const imagesByRoom = roomImages.reduce((acc, img) => {
    const room = String(img.room || "LIVING").toUpperCase();
    if (!acc[room]) acc[room] = [];
    acc[room].push(img);
    return acc;
  }, {});

  const roomTabs = ["ALL", ...Object.keys(imagesByRoom)];
  const selectedImages =
    activeRoom === "ALL" ? roomImages : imagesByRoom[activeRoom] || roomImages;
  const heroImage = normalizeImageUrl(selectedImages[0]?.url || mainImage);

  const detailsPairs = [
    { label: "رقم العقار", value: `#${item.id}` },
    { label: "المدينة", value: item.city },
    { label: "العنوان", value: item.address },
    { label: "النوع", value: item.type },
  ].filter((x) => x.value);

  return (
    <section className="relative z-10 max-w-6xl mx-auto px-4 lg:px-0 py-10">
      {/* Breadcrumb */}
      <div className="mb-3 text-[11px] text-slate-400 flex items-center gap-2">
        <Link to="/" className="hover:text-white/90 transition">
          الواجهة الرئيسية ⟵
        </Link>
        <span className="opacity-40">/</span>
        <Link to="/search" className="hover:text-white/90 transition">
          نتائج البحث
        </Link>
        <span className="opacity-40">/</span>
        <span>تفاصيل العقار #{item.id}</span>
      </div>

      <div className="card-glass border border-white/15 rounded-2xl p-5 md:p-6 shadow-soft space-y-6 bg-black/30 backdrop-blur-xl">
        <div className="grid gap-6 lg:grid-cols-[1.6fr_minmax(0,1.05fr)]">
          {/* معرض الصور */}
          <div className="space-y-3 lg:col-span-2">
            <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-slate-900/60">
              <img
                src={heroImage}
                alt={item.title}
                loading="lazy"
                decoding="async"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = placeholderSrc;
                }}
                className="h-72 md:h-[420px] w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/10" />

              <button
                type="button"
                onClick={toggleFav}
                className="absolute top-4 right-4 h-10 w-10 rounded-2xl border border-white/15 bg-black/35 backdrop-blur-xl shadow hover:scale-105 transition"
                aria-label="favorite"
              >
                <span className="text-lg">{isFav ? "💚" : "🤍"}</span>
              </button>

              <div className="absolute bottom-0 left-0 right-0 p-5 md:p-7 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div className="space-y-1">
                  <div className="text-[11px] text-slate-300">{item.city}</div>
                <h1 className="text-2xl md:text-3xl font-black tracking-tight">
                  {item.title}
                </h1>
                </div>

                <div className="md:text-right">
                  <div className="text-[11px] text-slate-300">
                    السعر التقريبي
                  </div>
                  <div className="text-3xl md:text-4xl font-extrabold text-white/90">
                    {item.price?.toLocaleString()} $
                  </div>
                </div>
              </div>
            </div>

            {roomImages.length > 0 ? (
              <div className="rounded-2xl border border-white/10 bg-black/35 p-3 space-y-3">
                <div className="flex flex-wrap gap-2">
                  {roomTabs.map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setActiveRoom(tab)}
                      className={
                        "rounded-lg border px-3 py-1.5 text-xs transition " +
                        (activeRoom === tab
                          ? "border-white/30 bg-white/10 text-white"
                          : "border-white/10 bg-black/40 text-white/70 hover:text-white hover:bg-white/5")
                      }
                    >
                      {roomLabel[tab] || tab}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {selectedImages.map((img, idx) => (
                    <div key={`${img.url}-${idx}`} className="space-y-1">
                      <img
                        src={normalizeImageUrl(img.url)}
                        alt={img.caption || `image-${idx + 1}`}
                        className="h-20 w-full rounded-lg border border-white/10 object-cover bg-black/40"
                        loading="lazy"
                        decoding="async"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = placeholderSrc;
                        }}
                      />
                      <p className="text-[10px] text-white/65 line-clamp-1">
                        {img.caption || "صورة"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          {/* صندوق جانبي */}
          <aside className="card-glass border border-white/15 rounded-2xl p-4 md:p-5 bg-black/40 backdrop-blur-xl space-y-4 lg:col-span-2">
            <p className="text-xs text-slate-300">
              أضف العقار إلى المفضلة أو احجز معاينة.
            </p>

            <div className="flex flex-col gap-2">
              <button
                onClick={toggleFav}
                className={
                  "w-full px-4 py-2.5 rounded-xl text-sm font-semibold transition " +
                  (isFav
                    ? "bg-slate-950 border border-white/15 text-white/90"
                    : "bg-white/10 text-black hover:bg-white/10")
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
                onClick={(event) => {
                  if (!requireAuthOrRedirect({ isAuthenticated, nav, loc, nextPath: `/property/${id}/create-ticket` })) {
                    event.preventDefault();
                  }
                }}
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
        {/* Details */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-100">Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            {detailsPairs.map((d) => (
              <div
                key={d.label}
                className="rounded-2xl bg-white/5 border border-white/10 p-3"
              >
                <div className="text-[11px] text-slate-400">{d.label}</div>
                <div className="mt-0.5 font-semibold text-slate-100 break-words">
                  {d.value}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-2">
          <Link
            to="/search"
            className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white/90 transition"
          >
            <span>⟵</span>
            <span>العودة إلى نتائج البحث</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
