// src/pages/client/Search.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useToast } from "../../components/ToastProvider.jsx";
import { store } from "../../lib/clientStore.js";
import { buildApiUrl, resolveApiAssetUrl } from "../../api/axios";
import { useNotifications } from "@/components/notifications/useNotifications";
import { useAuth } from "@/context/AuthContext.jsx";
import { requireAuthOrRedirect } from "@/utils/requireAuthAction";
import { searchProperties } from "@/data/propertiesStore";

const USE_LOCAL_DATA = import.meta.env.VITE_DATA_SOURCE === "local";

export default function Search() {
  const toast = useToast();
  const { notify } = useNotifications();
  const { user, token } = useAuth();
  const loc = useLocation();
  const navigate = useNavigate();
  const isAuthenticated = Boolean(user || token);
  const placeholderSrc = "/img/placeholder-property.jpg";
  const firstQueryRun = useRef(true);

  // قراءة الفلاتر من URL
  const q = useMemo(
    () => Object.fromEntries(new URLSearchParams(loc.search)),
    [loc.search]
  );

  const [items, setItems] = useState([]);
  const params = useMemo(() => new URLSearchParams(loc.search), [loc.search]);
  const bedroomsMin = q.bedroomsMin ? Number(q.bedroomsMin) : undefined;
  const furnished = q.furnished === "1" ? true : undefined;
  const parking = q.parking === "1" ? true : undefined;
  const elevator = q.elevator === "1" ? true : undefined;
  const sort = q.sort || "newest";

  const setParam = (key, value) => {
    const next = new URLSearchParams(params);
    if (value === undefined || value === null || value === "") {
      next.delete(key);
    } else {
      next.set(key, String(value));
    }
    navigate({ pathname: loc.pathname, search: next.toString() }, { replace: true });
  };

  useEffect(() => {
    if (firstQueryRun.current) {
      firstQueryRun.current = false;
      return;
    }

    const hasFilters = Boolean(
      q.city || q.type || q.minPrice || q.maxPrice || q.bedroomsMin || q.furnished || q.parking || q.elevator || q.sort
    );
    notify({
      type: "search",
      title: hasFilters ? "Search applied" : "Search reset",
      message: hasFilters
        ? "Your filters were applied successfully."
        : "Filters were cleared.",
    });
  }, [notify, q.city, q.type, q.minPrice, q.maxPrice, q.bedroomsMin, q.furnished, q.parking, q.elevator, q.sort]);

  // ---------------------------------------------
  //                 🔥 تحميل العقارات + تطبيق الفلاتر
  // ---------------------------------------------
  useEffect(() => {
    async function load() {
      try {
        if (USE_LOCAL_DATA) {
          const local = searchProperties({
            city: q.city,
            district: q.district,
            type: q.type,
            minPrice: q.minPrice ? Number(q.minPrice) : undefined,
            maxPrice: q.maxPrice ? Number(q.maxPrice) : undefined,
            bedroomsMin,
            furnished,
            parking,
            elevator,
            sort,
            q: q.q,
            page: 1,
            pageSize: 8000,
          });

          const formattedLocal = local.items.map((p) => ({
            id: p.id,
            title: p.title,
            city: p.city,
            price: p.price_syp,
            priceLabel: p.price_label,
            type: p.type,
            image: p.images?.[0] || placeholderSrc,
            area: p.area_m2 || 120,
            bedrooms: p.bedrooms ?? 0,
            bathrooms: p.bathrooms ?? 0,
            furnished: p.furnished ? "مفروش" : "غير مفروش",
            level: p.floor ? `الطابق ${p.floor}` : "الأرضي",
            status: "متاح",
            isFeatured: false,
            isNew: true,
            neighborhood: p.district || "",
          }));

          setItems(formattedLocal);
          return;
        }

        const res = await fetch(buildApiUrl("/properties"));
        const all = await res.json();

        // 🔹 تجهيز العقارات لتتناسب مع الصفحة (نفس شغل الهوم)
        let formatted = all.map((p) => ({
          id: p.id,
          title: p.title,
          city: p.city,
          price: p.price,
          type: p.type,
          image: p.image ? resolveApiAssetUrl(p.image) : placeholderSrc,
          // حقول دمية لعدم وجودها بالباك
          area: 120,
          bedrooms: 3,
          bathrooms: 2,
          furnished: "غير مفروش",
          level: "الأول",
          parking: false,
          elevator: false,
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

        if (Number.isFinite(bedroomsMin)) {
          formatted = formatted.filter((p) => Number(p.bedrooms || 0) >= bedroomsMin);
        }

        if (furnished === true) {
          formatted = formatted.filter((p) => String(p.furnished).includes("مفروش"));
        }

        if (parking === true) {
          formatted = formatted.filter((p) => Boolean(p.parking));
        }

        if (elevator === true) {
          formatted = formatted.filter((p) => Boolean(p.elevator));
        }

        if (sort === "price_asc") {
          formatted = formatted.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
        } else if (sort === "price_desc") {
          formatted = formatted.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
        } else if (sort === "area_desc") {
          formatted = formatted.sort((a, b) => Number(b.area || 0) - Number(a.area || 0));
        }

        setItems(formatted);
      } catch (err) {
        console.error(err);
        toast.error("فشل تحميل العقارات");
      }
    }

    load();
  }, [q, toast, bedroomsMin, furnished, parking, elevator, sort]);
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
    if (Number.isFinite(bedroomsMin)) chips.push({ label: `غرف ${bedroomsMin}+` });
    if (furnished) chips.push({ label: "مفروش" });
    if (parking) chips.push({ label: "موقف سيارة" });
    if (elevator) chips.push({ label: "مصعد" });
    if (sort && sort !== "newest") chips.push({ label: `ترتيب: ${sort}` });

    return chips;
  }, [q, bedroomsMin, furnished, parking, elevator, sort]);

  // حجز سريع
  const quickBook = (prop) => {
    if (!requireAuthOrRedirect({ isAuthenticated, nav: navigate, loc, nextPath: "/client/book-visit" })) return;
    store.saveDraft({ propId: String(prop.id), when: "", note: "" });
    toast.success(`تم تجهيز مسودة حجز للعقار رقم ${prop.id}`);
    notify({
      type: "system",
      title: "Draft saved",
      message: "Your visit request draft was saved.",
    });
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
    <section className="relative z-10 mx-auto w-full max-w-6xl space-y-6 px-4 pb-12 pt-12 lg:px-0">
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
      <div className="card-glass rounded-2xl border border-white/10 p-4 md:p-5 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <select
          value={q.bedroomsMin || ""}
          onChange={(e) => setParam("bedroomsMin", e.target.value)}
          className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
        >
          <option value="">Bedrooms: Any</option>
          <option value="1">1+</option>
          <option value="2">2+</option>
          <option value="3">3+</option>
          <option value="4">4+</option>
        </select>
        <select
          value={sort}
          onChange={(e) => setParam("sort", e.target.value)}
          className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
        >
          <option value="newest">Sort: Newest</option>
          <option value="price_asc">Price ↑</option>
          <option value="price_desc">Price ↓</option>
          <option value="area_desc">Area ↓</option>
        </select>
        <label className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white/90">
          <input
            type="checkbox"
            checked={q.furnished === "1"}
            onChange={(e) => setParam("furnished", e.target.checked ? "1" : "")}
            className="accent-white"
          />
          Furnished
        </label>
        <label className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white/90">
          <input
            type="checkbox"
            checked={q.parking === "1"}
            onChange={(e) => setParam("parking", e.target.checked ? "1" : "")}
            className="accent-white"
          />
          Parking
        </label>
        <label className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white/90">
          <input
            type="checkbox"
            checked={q.elevator === "1"}
            onChange={(e) => setParam("elevator", e.target.checked ? "1" : "")}
            className="accent-white"
          />
          Elevator
        </label>
        <button
          type="button"
          onClick={() => {
            const next = new URLSearchParams(params);
            next.delete("bedroomsMin");
            next.delete("furnished");
            next.delete("parking");
            next.delete("elevator");
            next.delete("sort");
            navigate({ pathname: loc.pathname, search: next.toString() }, { replace: true });
          }}
          className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/90"
        >
          Reset Extra Filters
        </button>
      </div>

      {/* ملخص الفلاتر */}
      <div className="card-glass rounded-2xl border border-white/10 p-4 md:p-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <div className="text-xs text-slate-400">ملخص النتائج</div>
          <div className="text-sm text-white/90 font-medium">
            {resultCountLabel}
          </div>
        </div>

        <div className="flex-1 flex flex-col md:items-end gap-2">
          <div className="flex flex-wrap gap-2 justify-start md:justify-end">
            {activeFilterChips.length > 0 ? (
              activeFilterChips.map((chip, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] text-white/90"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-white/10" />
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
            className="group card-glass rounded-xl border border-white/10 overflow-hidden shadow-sm shadow-black/20 transition duration-500 hover:-translate-y-1 hover:shadow-lg hover:shadow-white/10"
          >
            <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-900/60">
              <img
                src={p.image}
                alt={p.title}
                loading="lazy"
                decoding="async"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = placeholderSrc;
                }}
                className="h-full w-full object-cover transition-transform duration-700 will-change-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

              <div className="absolute bottom-2 right-2 text-[11px] px-2.5 py-1 rounded-full bg-black/60 border border-white/20 text-slate-100">
                {p.city} • {p.neighborhood}
              </div>
            </div>

            <div className="p-4 space-y-3">
              <div>
                <h2 className="text-sm md:text-base font-semibold text-white/90 leading-snug">
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
                  <div className="text-lg font-extrabold text-white/90">
                    {p.priceLabel || `${Number(p.price || 0).toLocaleString()} SYP`}
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <Link
                    to={`/property/${p.id}`}
                    className="px-3 py-1.5 rounded-xl border border-white/15 text-[11px] text-white/90 hover:bg-white/10 transition"
                  >
                    التفاصيل
                  </Link>
                  <button
                    type="button"
                    onClick={() => quickBook(p)}
                    className="px-3 py-1.5 rounded-xl bg-white/10 text-[11px] font-semibold text-black hover:bg-white/10 shadow shadow-white/10 transition"
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
