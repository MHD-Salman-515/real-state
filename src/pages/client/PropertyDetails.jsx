// src/pages/client/PropertyDetails.jsx

import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
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
          if (!local) throw new Error(t("Not found"));
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
        toast.error(t("Failed to load property details"));
      }
    }
    load();
  }, [id, t, toast]);

  // عند فتح الصفحة
  useEffect(() => {
    if (!id) return;
    store.addRecent(String(id));
    setIsFav(store.isFav(String(id)));
  }, [id]);

  const toggleFav = () => {
    if (!requireAuthOrRedirect({ isAuthenticated, nav, loc })) return;
    const key = String(id);
    const propertyTitle = item?.title || t("Property #{{id}}", { id: key });
    if (store.isFav(key)) {
      store.removeFav(key);
      setIsFav(false);
      toast.info(t("Removed from favorites"));
      notify({
        type: "properties",
        title: t("Removed from favorites"),
        message: t("{{property}} was removed from your favorites.", { property: propertyTitle }),
      });
    } else {
      store.addFav(key);
      setIsFav(true);
      toast.success(t("Saved to favorites"));
      notify({
        type: "properties",
        title: t("Saved to favorites"),
        message: t("{{property}} was added to your favorites.", { property: propertyTitle }),
      });
    }
  };

  const startDraft = (event) => {
    if (!requireAuthOrRedirect({ isAuthenticated, nav, loc, nextPath: "/client/book-visit" })) {
      if (event?.preventDefault) event.preventDefault();
      return;
    }
    store.saveDraft({ propId: String(id), when: "", note: "" });
    toast.info(t("Draft saved"));
    notify({
      type: "system",
      title: t("Draft saved"),
      message: t("Your visit request draft was saved."),
    });
  };

  // === شاشة التحميل ===
  if (!item) {
    return (
      <div className="creos-theme bg-luxury py-20 text-center text-[color:rgb(var(--creos-text-rgb)/0.72)]">
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
    <section className="creos-theme bg-luxury relative z-10 min-h-screen">
      <div className="section-shell max-w-6xl py-10">
      {/* Breadcrumb */}
      <div className="mb-3 flex items-center gap-2 text-[11px] text-[color:var(--creos-muted)]">
        <Link to="/" className="transition hover:text-[color:var(--creos-text)]">
          الواجهة الرئيسية ⟵
        </Link>
        <span className="opacity-40">/</span>
        <Link to="/search" className="transition hover:text-[color:var(--creos-text)]">
          نتائج البحث
        </Link>
        <span className="opacity-40">/</span>
        <span>تفاصيل العقار #{item.id}</span>
      </div>

      <div className="card-glass space-y-6 rounded-3xl p-5 md:p-6">
        <div className="grid gap-6 lg:grid-cols-[1.6fr_minmax(0,1.05fr)]">
          {/* معرض الصور */}
          <div className="space-y-3 lg:col-span-2">
            <div className="relative overflow-hidden rounded-3xl border border-[var(--creos-border-soft)] bg-[rgb(var(--creos-navy-rgb)/0.6)]">
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
                className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-2xl border border-[var(--creos-border-soft)] bg-[rgb(var(--creos-surface-rgb)/0.58)] backdrop-blur-glass shadow-glass transition hover:scale-105"
                aria-label={t("Favorite")}
              >
                <span className="text-lg">{isFav ? "💚" : "🤍"}</span>
              </button>

              <div className="absolute bottom-0 left-0 right-0 p-5 md:p-7 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div className="space-y-1">
                  <div className="text-[11px] text-[color:var(--creos-muted)]">{item.city}</div>
                <h1 className="text-2xl md:text-3xl font-black tracking-tight">
                  {item.title}
                </h1>
                </div>

                <div className="md:text-right">
                  <div className="text-[11px] text-[color:var(--creos-muted)]">
                    السعر التقريبي
                  </div>
                  <div className="text-3xl font-extrabold text-[color:var(--creos-accent-bright)] md:text-4xl">
                    {item.price?.toLocaleString()} $
                  </div>
                </div>
              </div>
            </div>

            {roomImages.length > 0 ? (
              <div className="card-glass rounded-3xl p-3 space-y-3">
                <div className="flex flex-wrap gap-2">
                  {roomTabs.map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setActiveRoom(tab)}
                      className={
                        "rounded-xl border px-3 py-1.5 text-xs transition " +
                        (activeRoom === tab
                          ? "border-[rgb(var(--creos-accent-rgb)/0.32)] bg-[rgb(var(--creos-accent-rgb)/0.14)] text-[color:var(--creos-text)]"
                          : "border-[var(--creos-border-soft)] bg-[rgb(var(--creos-surface-rgb)/0.55)] text-[color:rgb(var(--creos-text-rgb)/0.7)] hover:bg-[rgb(var(--creos-surface-hi-rgb)/0.65)] hover:text-[color:var(--creos-text)]")
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
                        className="h-20 w-full rounded-xl border border-[var(--creos-border-soft)] object-cover bg-[rgb(var(--creos-surface-rgb)/0.55)]"
                        loading="lazy"
                        decoding="async"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = placeholderSrc;
                        }}
                      />
                      <p className="line-clamp-1 text-[10px] text-[color:rgb(var(--creos-text-rgb)/0.65)]">
                        {img.caption || "صورة"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          {/* صندوق جانبي */}
          <aside className="card-glass space-y-4 rounded-3xl p-4 md:p-5 lg:col-span-2">
            <p className="text-xs text-[color:rgb(var(--creos-text-rgb)/0.74)]">
              أضف العقار إلى المفضلة أو احجز معاينة.
            </p>

            <div className="flex flex-col gap-2">
              <button
                onClick={toggleFav}
                className={
                  "w-full rounded-xl px-4 py-2.5 text-sm font-semibold transition " +
                  (isFav
                    ? "border border-[rgb(var(--creos-accent-rgb)/0.3)] bg-[rgb(var(--creos-accent-rgb)/0.12)] text-[color:var(--creos-text)]"
                    : "btn-gold")
                }
              >
                {isFav ? "إزالة من المفضلة" : "إضافة إلى المفضلة"}
              </button>

              <Link
                to="/client/book-visit"
                onClick={startDraft}
                className="btn-glass text-center px-4 py-2.5 text-sm"
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
            <div className="grid grid-cols-2 gap-2 pt-2 text-xs text-[color:rgb(var(--creos-text-rgb)/0.88)]">
              <div className="rounded-2xl border border-[var(--creos-border-soft)] bg-[rgb(var(--creos-surface-rgb)/0.55)] p-2">
                <div className="text-[11px] text-[color:var(--creos-muted)]">رقم العقار</div>
                <div className="font-mono text-sm">#{item.id}</div>
              </div>

              <div className="rounded-2xl border border-[var(--creos-border-soft)] bg-[rgb(var(--creos-surface-rgb)/0.55)] p-2">
                <div className="text-[11px] text-[color:var(--creos-muted)]">المدينة</div>
                <div className="font-semibold">{item.city}</div>
              </div>
            </div>
          </aside>
        </div>

        {/* الوصف */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-[color:var(--creos-text)]">
            وصف العقار
          </h2>
          <p className="text-sm leading-relaxed text-[color:rgb(var(--creos-text-rgb)/0.82)] md:text-base">
            {item.description}
          </p>
        </div>

        {/* رجوع */}
        {/* Details */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-[color:var(--creos-text)]">{t("Details")}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            {detailsPairs.map((d) => (
              <div
                key={d.label}
                className="rounded-2xl border border-[var(--creos-border-soft)] bg-[rgb(var(--creos-surface-rgb)/0.58)] p-3"
              >
                <div className="text-[11px] text-[color:var(--creos-muted)]">{d.label}</div>
                <div className="mt-0.5 break-words font-semibold text-[color:var(--creos-text)]">
                  {d.value}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-2">
          <Link
            to="/search"
            className="inline-flex items-center gap-2 text-xs text-[color:var(--creos-muted)] transition hover:text-[color:var(--creos-text)]"
          >
            <span>⟵</span>
            <span>العودة إلى نتائج البحث</span>
          </Link>
        </div>
      </div>
      </div>
    </section>
  );
}
