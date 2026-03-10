import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useToast } from "../../components/ToastProvider.jsx";
import { buildApiUrl, resolveApiAssetUrl } from "../../api/axios";
import { getAllProperties } from "@/data/propertiesStore";

const USE_LOCAL_DATA = import.meta.env.VITE_DATA_SOURCE === "local";
const PAGE_SIZE = 24;

export default function Properties() {
  const toast = useToast();
  const placeholderSrc = "/img/placeholder-property.jpg";

  const [properties, setProperties] = useState([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadInitial() {
      setIsLoading(true);
      try {
        if (USE_LOCAL_DATA) {
          const result = getAllProperties({ page: 1, pageSize: PAGE_SIZE });
          if (cancelled) return;
          setProperties(result.items);
          setPage(1);
          setHasMore(result.page < result.totalPages);
          return;
        }

        const res = await fetch(buildApiUrl("/properties"));
        const data = await res.json();
        if (cancelled) return;
        setProperties(Array.isArray(data) ? data : []);
        setHasMore(false);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load properties.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadInitial();
    return () => {
      cancelled = true;
    };
  }, [toast]);

  const loadMore = () => {
    if (!USE_LOCAL_DATA || isLoadingMore || !hasMore) return;
    const nextPage = page + 1;
    setIsLoadingMore(true);
    try {
      const result = getAllProperties({ page: nextPage, pageSize: PAGE_SIZE });
      setProperties((prev) => [...prev, ...result.items]);
      setPage(nextPage);
      setHasMore(result.page < result.totalPages);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load more properties.");
    } finally {
      setIsLoadingMore(false);
    }
  };

  const cards = useMemo(() => {
    return properties.map((property) => ({
      id: property.id,
      title: property.title,
      city: property.city || "—",
      district: property.district || property.address || "—",
      area: Number(property.area_m2 ?? 0),
      bedrooms: Number(property.bedrooms ?? 0),
      priceLabel:
        property.price_label ||
        `${Number(property.price_syp ?? property.price ?? 0).toLocaleString()} SYP`,
      image: USE_LOCAL_DATA
        ? property.images?.[0] || placeholderSrc
        : property.image
          ? resolveApiAssetUrl(property.image)
          : placeholderSrc,
    }));
  }, [properties]);

  const skeletons = Array.from({ length: 8 });

  return (
    <div className="min-h-screen bg-black text-white">
      <main className="mx-auto w-full px-4 pb-12 pt-12">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold md:text-3xl">Properties</h1>
          <Link to="/search" className="text-sm text-white/70 hover:text-white">
            Open Advanced Search
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {skeletons.map((_, idx) => (
              <div key={idx} className="overflow-hidden rounded-xl border border-white/10 bg-black">
                <div className="h-56 w-full animate-pulse bg-white/10" />
                <div className="space-y-3 p-4">
                  <div className="h-5 w-3/4 animate-pulse rounded bg-white/10" />
                  <div className="h-4 w-2/3 animate-pulse rounded bg-white/10" />
                  <div className="h-4 w-1/2 animate-pulse rounded bg-white/10" />
                  <div className="h-6 w-1/3 animate-pulse rounded bg-white/10" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {cards.map((property) => (
                <Link
                  key={property.id}
                  to={`/property/${property.id}`}
                  className="group overflow-hidden rounded-xl border border-white/10 bg-black transition hover:border-white/30"
                >
                  <img
                    src={property.image}
                    alt={property.title}
                    loading="lazy"
                    decoding="async"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = placeholderSrc;
                    }}
                    className="h-56 w-full object-cover transition group-hover:scale-105"
                  />

                  <div className="space-y-2 p-4">
                    <h3 className="line-clamp-1 text-lg font-semibold text-white">{property.title}</h3>
                    <p className="line-clamp-1 text-sm text-white/60">
                      {property.city} • {property.district}
                    </p>
                    <p className="text-sm text-white/70">
                      {property.area} m² • {property.bedrooms} bedrooms
                    </p>
                    <p className="text-lg font-bold text-white">{property.priceLabel}</p>
                  </div>
                </Link>
              ))}
            </div>

            {USE_LOCAL_DATA && hasMore ? (
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={loadMore}
                  disabled={isLoadingMore}
                  className="mt-10 rounded-lg border border-white/20 px-6 py-3 text-white transition hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoadingMore ? "Loading..." : "Load More"}
                </button>
              </div>
            ) : null}
          </>
        )}
      </main>
    </div>
  );
}
