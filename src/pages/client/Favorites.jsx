// src/pages/client/Favorites.jsx
import { useEffect, useState } from "react";
import { useToast } from "../../components/ToastProvider.jsx";
import { store } from "../../lib/clientStore.js";
import { Link } from "react-router-dom";
import { buildApiUrl, resolveApiAssetUrl } from "../../api/axios";
import { useNotifications } from "@/components/notifications/useNotifications";

export default function Favorites() {
  const toast = useToast();
  const { notify } = useNotifications();
  const [ids, setIds] = useState([]);
  const [items, setItems] = useState([]); // derived from API
  const placeholderSrc = "/placeholder-property.svg";

  useEffect(() => {
    const favIds = store.listFavs();
    setIds(favIds);

    if (favIds.length > 0) loadFavProperties(favIds);
  }, []);

  const loadFavProperties = async (favIds) => {
    try {
      const results = [];

      for (const id of favIds) {
        const res = await fetch(buildApiUrl(`/properties/${id}`));
        if (res.ok) {
          const data = await res.json();
          results.push(data);
        }
      }

      setItems(results);
    } catch (err) {
      toast.error("فشل تحميل العقارات المفضلة");
    }
  };

  const remove = (id) => {
    const property = items.find((p) => p.id === id);
    store.removeFav(id);

    const newIds = store.listFavs();
    setIds(newIds);
    setItems(items.filter((p) => p.id !== id));

    toast.info("تمت إزالة العقار من المفضلة");
    notify({
      type: "properties",
      title: "Removed from favorites",
      message: property?.title
        ? `${property.title} was removed from your favorites.`
        : "The property was removed from your favorites.",
    });
  };

  return (
    <section className="relative z-10 max-w-6xl mx-auto px-4 lg:px-0 py-10">
      <div className="card-glass border border-white/15 rounded-2xl p-5 md:p-6 shadow-soft">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">المفضلة</h1>
            <p className="text-sm text-slate-300 mt-1">
              هنا تلاقي كل العقارات اللي حفظتها للمراجعة لاحقا.
            </p>
          </div>

          {items.length > 0 && (
            <div className="px-3 py-1 rounded-full border border-white/15 bg-white/10 text-xs text-white/90">
              عدد العناصر المفضلة: <span className="font-semibold">{items.length}</span>
            </div>
          )}
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center text-slate-300">
            <div className="h-16 w-16 rounded-2xl border border-dashed border-white/15 flex items-center justify-center mb-4 bg-white/5">
              <span className="text-2xl">☆</span>
            </div>
            <p className="text-sm md:text-base">لا توجد عناصر مفضلة حاليا.</p>
            <p className="text-xs md:text-sm text-slate-400 mt-1">
              يمكنك الضغط على زر <span className="text-white/90">المفضلة</span> من صفحة أي عقار لحفظه هنا.
            </p>
            <Link
              to="/search"
              className="mt-5 text-xs md:text-sm px-4 py-2 rounded-xl border border-white/15 text-white/90 hover:bg-white/10 transition"
            >
              استكشاف العقارات
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((p) => (
              <article
                key={p.id}
                className="group rounded-2xl border border-white/15 bg-slate-950/60 backdrop-blur-sm p-4 flex flex-col justify-between hover:-translate-y-1 hover:border-white/15 hover:shadow-xl hover:shadow-white/10 transition"
              >
                <div>
                  <div className="text-xs text-slate-400 mb-1">العقار</div>
                  <div className="font-semibold text-lg mb-2 text-white/90">{p.title}</div>

                  <img
                    src={p.image ? resolveApiAssetUrl(p.image) : placeholderSrc}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = placeholderSrc;
                    }}
                    className="rounded-xl mb-3 w-full h-32 object-cover border border-white/10"
                    alt={p.title || "Property"}
                  />

                  <p className="text-xs text-slate-400">
                    {p.city} — {p.address}
                  </p>

                  <p className="text-xs text-slate-300 mt-1">
                    السعر:{" "}
                    <span className="text-white/90 font-semibold">
                      {Number(p.price || 0).toLocaleString()} $
                    </span>
                  </p>
                </div>

                <div className="flex gap-2 mt-4">
                  <Link
                    to={`/property/${p.id}`}
                    className="flex-1 text-xs px-3 py-2 rounded-xl border border-white/15 text-white/90 hover:bg-white/10 transition text-center"
                  >
                    تفاصيل
                  </Link>
                  <button
                    type="button"
                    className="text-xs px-3 py-2 rounded-xl border border-red-500/70 text-red-300 hover:bg-red-500/10 transition"
                    onClick={() => remove(p.id)}
                  >
                    حذف
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
