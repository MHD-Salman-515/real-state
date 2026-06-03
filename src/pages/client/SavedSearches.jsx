import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

export default function SavedSearches() {
  const [searches, setSearches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/buyer/saved-searches")
      .then(r => setSearches(Array.isArray(r.data) ? r.data : r.data?.items || []))
      .catch(() => setSearches([]))
      .finally(() => setLoading(false));
  }, []);

  const deleteSearch = async (id) => {
    setDeletingId(id);
    try {
      await api.delete(`/buyer/saved-searches/${id}`);
      setSearches(prev => prev.filter(s => s.id !== id));
    } catch {
      alert("فشل الحذف، حاول مرة أخرى");
    }
    setDeletingId(null);
  };

  const applySearch = (filters) => {
    if (!filters) return navigate("/search");
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== null && v !== undefined && v !== "") params.set(k, String(v));
    });
    const qs = params.toString();
    navigate(qs ? `/search?${qs}` : "/search");
  };

  return (
    <div dir="rtl" className="min-h-screen bg-[#0d0d0d] p-6">
      <h1
        className="text-2xl font-bold text-[#D4AF37] mb-6"
        style={{ fontFamily: "'Playfair Display', serif" }}
      >
        البحث المحفوظ
      </h1>

      {loading && (
        <p className="text-white/40 text-center mt-20">جاري التحميل...</p>
      )}

      {!loading && searches.length === 0 && (
        <div className="text-center mt-20 text-white/30">
          <div className="text-4xl mb-4">🔍</div>
          <p>لا يوجد بحث محفوظ</p>
          <button
            onClick={() => navigate("/search")}
            className="mt-4 px-5 py-2 text-sm"
            style={{ border: "0.5px solid rgba(212,175,55,0.4)", color: "#D4AF37" }}
          >
            ابدأ البحث
          </button>
        </div>
      )}

      <div className="space-y-3 max-w-2xl mx-auto">
        {searches.map((s, i) => (
          <div
            key={s.id || i}
            className="p-4"
            style={{ border: "0.5px solid rgba(212,175,55,0.2)", background: "rgba(255,255,255,0.03)" }}
          >
            <div className="flex justify-between items-start gap-3">
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => deleteSearch(s.id)}
                  disabled={deletingId === s.id}
                  className="px-3 py-1.5 text-xs transition disabled:opacity-40"
                  style={{ color: "#f87171", border: "0.5px solid rgba(248,113,113,0.3)" }}
                >
                  {deletingId === s.id ? "..." : "حذف"}
                </button>
                <button
                  onClick={() => applySearch(s.filters)}
                  className="px-3 py-1.5 text-xs font-bold transition"
                  style={{ background: "#D4AF37", color: "#1b1c1c" }}
                >
                  تطبيق
                </button>
              </div>
              <div className="text-right min-w-0">
                <p className="text-white text-sm truncate">{s.name || s.title || "بحث محفوظ"}</p>
                {s.createdAt && (
                  <p className="text-white/40 text-xs mt-0.5">
                    {new Date(s.createdAt).toLocaleDateString("ar-SY")}
                  </p>
                )}
              </div>
            </div>

            {s.filters && Object.keys(s.filters).length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2 justify-end">
                {Object.entries(s.filters)
                  .filter(([, v]) => v !== null && v !== undefined && v !== "")
                  .map(([k, v]) => (
                    <span
                      key={k}
                      className="text-xs px-2 py-0.5"
                      style={{
                        background: "rgba(212,175,55,0.1)",
                        border: "0.5px solid rgba(212,175,55,0.3)",
                        color: "rgba(255,255,255,0.7)",
                      }}
                    >
                      {k}: {String(v)}
                    </span>
                  ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
