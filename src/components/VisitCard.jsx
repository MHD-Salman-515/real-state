// src/components/VisitCard.jsx
export default function VisitCard({ v }) {
  const badge = {
    pending:
      "bg-white/10 text-white/80 border-white/15",
    confirmed:
      "bg-white/10 text-white/90 border-white/15",
    done:
      "bg-slate-500/20 text-slate-200 border-slate-400/40",
    canceled:
      "bg-red-500/10 text-red-200 border-red-400/60",
  }[v.status || "pending"];

  return (
    <article
      className={
        "card-glass rounded-2xl border border-white/12 p-4 shadow-soft " +
        "transition hover:-translate-y-1 hover:shadow-white/10"
      }
    >
      {/* ===== رأس البطاقة ===== */}
      <div className="flex items-center justify-between gap-2">
        <h4 className="font-semibold text-white line-clamp-1">
          {v.property_title || `عقار #${v.property_id}`}
        </h4>

        {/* ===== الشارة ===== */}
        <span
          className={
            "px-2 py-1 rounded-lg text-[11px] border font-medium select-none " +
            "whitespace-nowrap " +
            badge
          }
        >
          {v.status_label || v.status || "قيد المراجعة"}
        </span>
      </div>

      {/* ===== محتوى البطاقة ===== */}
      <div className="text-sm text-slate-200 mt-3 space-y-1">
        <div>
          <span className="text-slate-400">التاريخ:</span>{" "}
          <span className="font-medium">{v.date}</span>{" "}
          <span className="text-slate-500 mx-1">—</span>
          <span className="text-slate-400">الساعة:</span>{" "}
          <span className="font-medium">{v.time}</span>
        </div>

        <div>
          <span className="text-slate-400">رقم التتبّع:</span>{" "}
          <strong className="text-white/90 font-semibold">
            {v.tracking_code}
          </strong>
        </div>
      </div>
    </article>
  );
}
