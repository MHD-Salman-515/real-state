import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useToast } from "@/components/ToastProvider.jsx";
import TrendRangeSelector from "@/components/market-trends/TrendRangeSelector";
import TrendSummaryCards from "@/components/market-trends/TrendSummaryCards";
import MarketTrendChart from "@/components/market-trends/MarketTrendChart";
import OwnerPriceRecommendationPanel from "@/components/owner-market-watch/OwnerPriceRecommendationPanel";
import { getMarketTrends, type MarketTrendPoint } from "@/services/marketTrends.api";
import {
  createOwnerMarketWatch,
  deleteOwnerMarketWatch,
  getOwnerMarketWatchInsights,
  getOwnerMarketWatchList,
  type OwnerMarketInsight,
  type OwnerMarketWatchItem,
} from "@/services/ownerMarketWatch.api";

type WatchForm = {
  city: string;
  district: string;
  propertyType: string;
  daysWindow: string;
};

const initialForm: WatchForm = {
  city: "Damascus",
  district: "Mazzeh",
  propertyType: "Apartment",
  daysWindow: "30",
};

export default function OwnerMarketWatchPage() {
  const toast = useToast();
  const { t } = useTranslation();
  const [items, setItems] = useState<OwnerMarketWatchItem[]>([]);
  const [insights, setInsights] = useState<OwnerMarketInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<WatchForm>(initialForm);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof WatchForm, string>>>({});
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | number | null>(null);
  const [trendRange, setTrendRange] = useState<7 | 30 | 90>(30);
  const [trendPoints, setTrendPoints] = useState<MarketTrendPoint[]>([]);
  const [trendLoading, setTrendLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const list = await getOwnerMarketWatchList();
      const cityForInsights = String(form.city || list[0]?.city || "").trim();
      const insightData = cityForInsights ? await getOwnerMarketWatchInsights(cityForInsights) : [];
      setItems(list);
      setInsights(insightData);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || t("Failed to load market watch data.");
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const loadTrends = async () => {
      const cityForTrends = String(form.city || items[0]?.city || "").trim();
      if (!cityForTrends) {
        setTrendPoints([]);
        return;
      }
      setTrendLoading(true);
      try {
        const data = await getMarketTrends({ range: trendRange, scope: "owner", city: cityForTrends });
        if (Array.isArray(data.points) && data.points.length) {
          setTrendPoints(data.points);
        } else {
          setTrendPoints(
            items.slice(0, 20).map((item, i) => ({
              date: String(item.createdAt || new Date(Date.now() - i * 86400000).toISOString().slice(0, 10)),
              avgPricePerSqm: Number(item.targetPricePerSqm || 0),
              listingVolume: 1,
            }))
          );
        }
      } catch {
        setTrendPoints(
          items.slice(0, 20).map((item, i) => ({
            date: String(item.createdAt || new Date(Date.now() - i * 86400000).toISOString().slice(0, 10)),
            avgPricePerSqm: Number(item.targetPricePerSqm || 0),
            listingVolume: 1,
          }))
        );
      } finally {
        setTrendLoading(false);
      }
    };
    loadTrends();
  }, [trendRange, items, form.city]);

  const summary = useMemo(() => {
    const uniqueZones = new Set(items.map((x) => `${x.city}-${x.district}`)).size;
    const avgTarget = items.length
      ? items.reduce((acc, item) => acc + Number(item.targetPricePerSqm || 0), 0) / items.length
      : 0;
    return {
      total: items.length,
      zones: uniqueZones,
      avgTarget,
    };
  }, [items]);

  const handleCreate = async () => {
    const current = { ...form };
    const nextErrors: Partial<Record<keyof WatchForm, string>> = {};

    if (!current.city.trim()) nextErrors.city = t("Please enter the city.");
    if (!current.district.trim()) nextErrors.district = t("Please enter the district you want to monitor.");
    if (!Number(current.daysWindow) || Number(current.daysWindow) <= 0) nextErrors.daysWindow = t("Days window must be greater than 0.");

    setFormErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      toast.error(t("Please fix validation errors."));
      return;
    }

    setCreating(true);
    try {
      const payload = {
        city: current.city.trim(),
        district: current.district.trim(),
        property_type: current.propertyType,
        days_window: Number(current.daysWindow),
      };
      await createOwnerMarketWatch(payload);
      toast.success(t("Watch item created."));
      setForm(initialForm);
      setFormErrors({});
      setShowForm(false);
      await load();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || t("Failed to create watch item.");
      toast.error(msg);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string | number) => {
    const ok = window.confirm(t("Delete this watch item?"));
    if (!ok) return;

    setDeletingId(id);
    try {
      await deleteOwnerMarketWatch(id);
      toast.success(t("Watch item deleted."));
      await load();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || t("Failed to delete watch item.");
      toast.error(msg);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <header className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-white">{t("Market Watch")}</h1>
            <p className="mt-1 text-sm text-white/60">
              {t("Track critical zones, monitor pricing shifts, and keep owner-side intelligence aligned with market movement.")}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowForm((v) => !v)}
            className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white px-4 py-2 text-sm font-semibold text-black"
          >
            <Plus className="h-4 w-4" /> {t("Add Watch Item")}
          </button>
        </div>
      </header>

      {error ? <div className="rounded-2xl border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-200">{error}</div> : null}

      <section className="grid gap-3 md:grid-cols-3">
        <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs uppercase tracking-[0.14em] text-white/55">{t("Watch Items")}</p>
          <p className="mt-2 text-xl font-semibold text-white">{summary.total.toLocaleString()}</p>
        </article>
        <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs uppercase tracking-[0.14em] text-white/55">{t("Tracked Zones")}</p>
          <p className="mt-2 text-xl font-semibold text-white">{summary.zones.toLocaleString()}</p>
        </article>
        <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs uppercase tracking-[0.14em] text-white/55">{t("Average Target / m²")}</p>
          <p className="mt-2 text-xl font-semibold text-white">{Math.round(summary.avgTarget).toLocaleString()} SYP</p>
        </article>
      </section>

      <section className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold text-white">{t("Market Trend")}</h2>
            <p className="text-xs text-white/55">{t("Owner-facing pricing movement overview.")}</p>
          </div>
          <TrendRangeSelector value={trendRange} onChange={setTrendRange} />
        </div>
        <TrendSummaryCards points={trendPoints} />
        {trendLoading ? <p className="text-sm text-white/60">{t("Loading trend data...")}</p> : <MarketTrendChart points={trendPoints} />}
      </section>

      {showForm ? (
        <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <h2 className="text-sm font-semibold text-white">{t("Add Watch Item")}</h2>
          <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            <div>
              <select
                value={form.city}
                onChange={(e) => {
                  const value = e.target.value;
                  setForm((p) => ({ ...p, city: value }));
                  setFormErrors((p) => ({ ...p, city: undefined }));
                }}
                className="h-10 w-full rounded-xl border border-white/10 bg-black/30 px-3 text-sm text-white"
              >
                <option value="Damascus">{t("Damascus")}</option>
                <option value="Rural Damascus">{t("Rural Damascus")}</option>
                <option value="Aleppo">{t("Aleppo")}</option>
                <option value="Homs">{t("Homs")}</option>
                <option value="Latakia">{t("Latakia")}</option>
              </select>
              {formErrors.city ? <p className="mt-1 text-xs text-red-300">{formErrors.city}</p> : null}
            </div>
            <div>
              <select
                value={form.district}
                onChange={(e) => {
                  const value = e.target.value;
                  setForm((p) => ({ ...p, district: value }));
                  setFormErrors((p) => ({ ...p, district: undefined }));
                }}
                className="h-10 w-full rounded-xl border border-white/10 bg-black/30 px-3 text-sm text-white"
              >
                <option value="Mazzeh">{t("Mazzeh")}</option>
                <option value="Kafr Sousa">{t("Kafr Sousa")}</option>
                <option value="Abu Rummaneh">{t("Abu Rummaneh")}</option>
                <option value="Maliki">{t("Maliki")}</option>
                <option value="Project Dummar">{t("Project Dummar")}</option>
              </select>
              {formErrors.district ? <p className="mt-1 text-xs text-red-300">{formErrors.district}</p> : null}
            </div>
            <div>
              <select
                value={form.propertyType}
                onChange={(e) => setForm((p) => ({ ...p, propertyType: e.target.value }))}
                className="h-10 w-full rounded-xl border border-white/10 bg-black/30 px-3 text-sm text-white"
              >
                <option value="Apartment">{t("Apartment")}</option>
                <option value="Villa">{t("Villa")}</option>
                <option value="Office">{t("Office")}</option>
                <option value="Shop">{t("Shop")}</option>
              </select>
            </div>
            <div>
              <input
                value={form.daysWindow}
                onChange={(e) => {
                  const value = e.target.value;
                  setForm((p) => ({ ...p, daysWindow: value }));
                  setFormErrors((p) => ({ ...p, daysWindow: undefined }));
                }}
                className="h-10 w-full rounded-xl border border-white/10 bg-black/30 px-3 text-sm text-white"
                placeholder={t("Days Window")}
                type="number"
                min={1}
              />
              {formErrors.daysWindow ? <p className="mt-1 text-xs text-red-300">{formErrors.daysWindow}</p> : null}
            </div>
          </div>

          <div className="mt-3 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-xl border border-white/10 px-3 py-2 text-sm text-white/75 hover:bg-white/10"
            >
              {t("Cancel")}
            </button>
            <button
              type="button"
              onClick={handleCreate}
              disabled={creating}
              className="rounded-xl border border-white/20 bg-white px-3 py-2 text-sm font-semibold text-black disabled:opacity-50"
            >
              {creating ? t("Saving...") : t("Save Watch Item")}
            </button>
          </div>
        </section>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <h2 className="mb-3 text-sm font-semibold text-white">{t("Watch List")}</h2>
          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="min-w-[900px] w-full text-sm text-white/90">
              <thead className="bg-black/40 text-xs uppercase tracking-[0.12em] text-white/55">
                <tr>
                  <th className="px-3 py-2 text-left">{t("City")}</th>
                  <th className="px-3 py-2 text-left">{t("District")}</th>
                  <th className="px-3 py-2 text-left">{t("Property Type")}</th>
                  <th className="px-3 py-2 text-left">{t("Listing Type")}</th>
                  <th className="px-3 py-2 text-left">{t("Target / m²")}</th>
                  <th className="px-3 py-2 text-left">{t("Notes")}</th>
                  <th className="px-3 py-2 text-left">{t("Action")}</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} className="px-3 py-6 text-center text-white/60">{t("Loading...")}</td></tr>
                ) : items.length ? (
                  items.map((item) => (
                    <tr key={String(item.id)} className="border-t border-white/10 hover:bg-white/5">
                      <td className="px-3 py-2">{item.city}</td>
                      <td className="px-3 py-2">{item.district}</td>
                      <td className="px-3 py-2">{String(item.propertyType || "-")}</td>
                      <td className="px-3 py-2">{String(item.listingType || "-")}</td>
                      <td className="px-3 py-2">{Number(item.targetPricePerSqm || 0).toLocaleString()} SYP</td>
                      <td className="px-3 py-2">{String(item.notes || "-")}</td>
                      <td className="px-3 py-2">
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id)}
                          disabled={deletingId === item.id}
                          className="inline-flex items-center gap-1 rounded-lg border border-red-400/30 px-2 py-1 text-xs text-red-200 hover:bg-red-500/15 disabled:opacity-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> {t("Delete")}
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={7} className="px-3 py-8 text-center text-white/60">{t("No watch items yet.")}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <h2 className="text-sm font-semibold text-white">{t("Insights")}</h2>
          <div className="mt-3 space-y-2">
            {loading ? (
              <p className="text-sm text-white/60">{t("Loading insights...")}</p>
            ) : insights.length ? (
              insights.map((item, idx) => (
                <article key={`${String(item.label || "insight")}-${idx}`} className="rounded-xl border border-white/10 bg-black/25 p-3">
                  <p className="text-xs text-white/55">{String(item.label || t("Insight {{id}}", { id: idx + 1 }))}</p>
                  <p className="mt-1 text-sm text-white/90">{String(item.value || "-")}</p>
                </article>
              ))
            ) : (
              <p className="text-sm text-white/60">{t("No insights returned.")}</p>
            )}
          </div>
        </section>
      </div>

      <OwnerPriceRecommendationPanel />
    </div>
  );
}
