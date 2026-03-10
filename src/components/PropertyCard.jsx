// src/components/PropertyCard.jsx
export default function PropertyCard({ data }) {
  return (
    <article
      className="card-glass overflow-hidden group hover:-translate-y-1 
                 hover:shadow-xl hover:shadow-white/10 transition duration-300 rounded-2xl"
    >
      {/* صورة / خلفية */}
      <div className="aspect-[16/10] bg-gradient-to-br from-slate-800 to-slate-900 
                      border-b border-white/10 relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_0%,rgba(52,211,153,0.35),transparent_55%),radial-gradient(circle_at_90%_100%,rgba(56,189,248,0.25),transparent_55%)] opacity-80 transition group-hover:opacity-100" />
      </div>

      {/* النص */}
      <div className="p-4">
        <h3 className="font-semibold text-white group-hover:text-white/90 transition">
          {data.title}
        </h3>

        <p className="text-sm text-slate-300 mt-1">
          {data.city} • {data.area} م²
        </p>

        <div className="flex items-center justify-between mt-3">
          <span className="font-bold text-white/90">
            {Number(data.price).toLocaleString()} $
          </span>

          <a
            href={`/property/${data.id}`}
            className="px-3 py-1 rounded-lg border border-white/15 
                       text-white/90 hover:bg-white/10 transition text-xs"
          >
            التفاصيل
          </a>
        </div>
      </div>
    </article>
  );
}
