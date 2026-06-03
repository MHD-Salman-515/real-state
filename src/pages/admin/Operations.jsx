import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api, { extractApiErrorMessage } from "@/api/axios";
import { useNotifications } from "@/components/notifications/useNotifications";

function isToday(ts) {
  const d = new Date(ts);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

export default function AdminOperations() {
  const { notify } = useNotifications();
  const { t } = useTranslation();
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [propertyId, setPropertyId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState("today");

  const loadQueue = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/api/ops/properties/queue");
      setQueue(Array.isArray(data) ? data : []);
    } catch (err) {
      notify({
        type: "system",
        title: t("Operations load failed"),
        message: extractApiErrorMessage(err, t("Could not load operations queue.")),
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQueue();
  }, []);

  const filteredQueue = useMemo(() => {
    if (filter === "all") return queue;
    if (filter === "today") return queue.filter((row) => isToday(row.createdAt));
    return queue.filter((row) => !isToday(row.createdAt));
  }, [queue, filter]);

  const regenOne = async () => {
    const id = Number(propertyId);
    if (!Number.isFinite(id) || id <= 0) return;
    setSubmitting(true);
    try {
      await api.post(`/api/ops/properties/${id}/regen-images`);
      notify({
        type: "system",
        title: t("Image regeneration complete"),
        message: t("Property #{{id}} images were regenerated successfully.", { id }),
      });
      await loadQueue();
    } catch (err) {
      notify({
        type: "system",
        title: t("Image regeneration failed"),
        message: extractApiErrorMessage(err, t("Could not regenerate images for this property.")),
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold text-white">{t("Operations")}</h1>
        <p className="text-sm text-white/65">{t("Manage property operations and room-image tooling.")}</p>
      </header>

      <div className="rounded-2xl border border-white/10 bg-black/40 p-4 space-y-4">
        <h2 className="text-sm font-semibold text-white">{t("Image Tools")}</h2>
        <div className="flex flex-wrap items-center gap-3">
          <input
            value={propertyId}
            onChange={(e) => setPropertyId(e.target.value)}
            placeholder={t("Property ID")}
            className="h-10 rounded-lg border border-white/10 bg-black/40 px-3 text-sm text-white"
          />
          <button
            type="button"
            onClick={regenOne}
            disabled={submitting}
            className="h-10 rounded-lg border border-white/20 px-4 text-sm text-white hover:bg-white hover:text-black transition disabled:opacity-50"
          >
            {submitting ? t("Processing...") : t("Regenerate Images")}
          </button>
          <Link
            to={propertyId ? `/property/${propertyId}` : "#"}
            className="h-10 inline-flex items-center rounded-lg border border-white/20 px-4 text-sm text-white/80 hover:text-white hover:bg-white/5 transition"
          >
            {t("Open Property")}
          </Link>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-black/40 p-4 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-white">{t("Recent Operations")}</h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setFilter("today")}
              className={`rounded-lg px-3 py-1.5 text-xs border ${filter === "today" ? "border-white/30 bg-white/10 text-white" : "border-white/10 text-white/70"}`}
            >
              {t("Today")}
            </button>
            <button
              type="button"
              onClick={() => setFilter("earlier")}
              className={`rounded-lg px-3 py-1.5 text-xs border ${filter === "earlier" ? "border-white/30 bg-white/10 text-white" : "border-white/10 text-white/70"}`}
            >
              {t("Earlier")}
            </button>
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={`rounded-lg px-3 py-1.5 text-xs border ${filter === "all" ? "border-white/30 bg-white/10 text-white" : "border-white/10 text-white/70"}`}
            >
              {t("All")}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-sm text-white/60">{t("Loading operations...")}</div>
        ) : (
          <div className="overflow-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-white/60 border-b border-white/10">
                  <th className="py-2 pr-4">{t("Action")}</th>
                  <th className="py-2 pr-4">{t("Property ID")}</th>
                  <th className="py-2 pr-4">{t("Actor")}</th>
                  <th className="py-2 pr-4">{t("Time")}</th>
                </tr>
              </thead>
              <tbody>
                {filteredQueue.map((row) => (
                  <tr key={row.id} className="border-b border-white/5 text-white/85">
                    <td className="py-2 pr-4">{row.action}</td>
                    <td className="py-2 pr-4">#{row.propertyId || "-"}</td>
                    <td className="py-2 pr-4">{row.actorName || row.actorUserId || "-"}</td>
                    <td className="py-2 pr-4">{new Date(row.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
                {!filteredQueue.length ? (
                  <tr>
                    <td colSpan={4} className="py-4 text-white/60">
                      {t("No operations found for selected filter.")}
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
