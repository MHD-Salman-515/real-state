import { useState, useEffect } from "react";
import api from "../../api/axios";

export default function BuyerHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    api.get("/buyer/history")
      .then(r => setHistory(Array.isArray(r.data) ? r.data : r.data?.items || []))
      .catch(() => setHistory([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div dir="rtl" className="min-h-screen bg-[#0d0d0d] p-6">
      <h1
        className="text-2xl font-bold text-[#D4AF37] mb-6"
        style={{ fontFamily: "'Playfair Display', serif" }}
      >
        سجل البحث
      </h1>

      {loading && (
        <p className="text-white/40 text-center mt-20">جاري التحميل...</p>
      )}

      {!loading && history.length === 0 && (
        <div className="text-center mt-20 text-white/30">
          <div className="text-4xl mb-4">📋</div>
          <p>لا يوجد سجل بحث حتى الآن</p>
        </div>
      )}

      <div className="space-y-3 max-w-2xl mx-auto">
        {history.map((item, i) => (
          <div
            key={item.id || i}
            className="p-4"
            style={{ border: "0.5px solid rgba(212,175,55,0.2)", background: "rgba(255,255,255,0.03)" }}
          >
            <button
              onClick={() => setExpanded(expanded === i ? null : i)}
              className="w-full text-right flex justify-between items-start"
            >
              <span className="text-white/50 text-xs mt-0.5">
                {item.createdAt ? new Date(item.createdAt).toLocaleDateString("ar-SY") : ""}
              </span>
              <div>
                <p className="text-white text-sm">{item.query || item.title || "بحث"}</p>
                {item.resultsCount !== undefined && (
                  <p className="text-[#D4AF37] text-xs mt-0.5">{item.resultsCount} نتيجة</p>
                )}
              </div>
            </button>

            {expanded === i && item.filters && Object.keys(item.filters).length > 0 && (
              <div className="mt-3 pt-3 border-t border-white/10 space-y-1">
                {Object.entries(item.filters)
                  .filter(([, v]) => v !== null && v !== undefined && v !== "")
                  .map(([k, v]) => (
                    <div key={k} className="flex justify-between text-xs">
                      <span className="text-white/40">{String(v)}</span>
                      <span className="text-white/60">{k}</span>
                    </div>
                  ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
