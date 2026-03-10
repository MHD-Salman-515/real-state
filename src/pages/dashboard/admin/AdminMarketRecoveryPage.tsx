import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, RefreshCw, Upload } from "lucide-react";
import { useToast } from "@/components/ToastProvider.jsx";
import TrendRangeSelector from "@/components/market-trends/TrendRangeSelector";
import TrendSummaryCards from "@/components/market-trends/TrendSummaryCards";
import MarketTrendChart from "@/components/market-trends/MarketTrendChart";
import OutlierStatusCards from "@/components/admin-market/OutlierStatusCards";
import OutlierScatterView from "@/components/admin-market/OutlierScatterView";
import OutlierInsightsPanel from "@/components/admin-market/OutlierInsightsPanel";
import MarketSnapshotsViewer from "@/components/admin-market/MarketSnapshotsViewer";
import { getMarketTrends, type MarketTrendPoint } from "@/services/marketTrends.api";
import {
  getAdminMarketAreas,
  getAdminMarketOutliers,
  getAdminMarketQA,
  importAdminMarketCsv,
  markAdminMarketOutliers,
  rebuildAdminMarketAreas,
  type MarketAreaRow,
  type MarketOutlierRow,
  type MarketQAResponse,
} from "@/services/adminMarketRecovery.api";

function asNumber(value: unknown, fallback = 0): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function toTitleCase(value: string): string {
  return value
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

export default function AdminMarketRecoveryPage() {
  const toast = useToast();

  const [qa, setQa] = useState<MarketQAResponse | null>(null);
  const [areas, setAreas] = useState<MarketAreaRow[]>([]);
  const [outliers, setOutliers] = useState<MarketOutlierRow[]>([]);
  const [selectedOutlierIds, setSelectedOutlierIds] = useState<Array<string | number>>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvSource, setCsvSource] = useState("Admin Upload");
  const [csvDays, setCsvDays] = useState("30");
  const [csvResult, setCsvResult] = useState<any>(null);

  const [importing, setImporting] = useState(false);
  const [rebuilding, setRebuilding] = useState(false);
  const [marking, setMarking] = useState(false);
  const [trendRange, setTrendRange] = useState<7 | 30 | 90>(30);
  const [trendPoints, setTrendPoints] = useState<MarketTrendPoint[]>([]);
  const [trendLoading, setTrendLoading] = useState(false);
  const loadAll = async () => {
    setLoading(true);
    setError("");
    try {
      const [qaData, areaData, outlierData] = await Promise.all([
        getAdminMarketQA(),
        getAdminMarketAreas(),
        getAdminMarketOutliers(),
      ]);
      setQa(qaData);
      setAreas(areaData);
      setOutliers(outlierData);
      setSelectedOutlierIds([]);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Failed to load market recovery data.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  useEffect(() => {
    const loadTrends = async () => {
      const cityForTrends = String(areas[0]?.city || "").trim();
      if (!cityForTrends) {
        setTrendPoints([]);
        return;
      }
      setTrendLoading(true);
      try {
        const data = await getMarketTrends({ range: trendRange, scope: "admin", city: cityForTrends });
        if (Array.isArray(data.points) && data.points.length) {
          setTrendPoints(data.points);
        } else {
          setTrendPoints(
            areas.slice(0, 30).map((a, i) => ({
              date: String(a.updatedAt || new Date(Date.now() - i * 86400000).toISOString().slice(0, 10)),
              avgPrice: asNumber(a.avgPrice),
              avgPricePerSqm: asNumber(a.avgPricePerSqm),
              listingVolume: asNumber(a.recordsCount),
            }))
          );
        }
      } catch {
        setTrendPoints(
          areas.slice(0, 30).map((a, i) => ({
            date: String(a.updatedAt || new Date(Date.now() - i * 86400000).toISOString().slice(0, 10)),
            avgPrice: asNumber(a.avgPrice),
            avgPricePerSqm: asNumber(a.avgPricePerSqm),
            listingVolume: asNumber(a.recordsCount),
          }))
        );
      } finally {
        setTrendLoading(false);
      }
    };
    loadTrends();
  }, [trendRange, areas]);

  const stats = useMemo(() => {
    const totalRecords =
      asNumber((qa as any)?.totalRecords) ||
      asNumber((qa as any)?.recordsCount) ||
      areas.reduce((acc, row) => acc + asNumber(row.recordsCount), 0);

    const avgPriceSqm =
      asNumber((qa as any)?.averagePricePerSqm) ||
      asNumber((qa as any)?.avgPricePerSqm) ||
      (areas.length ? areas.reduce((acc, row) => acc + asNumber(row.avgPricePerSqm), 0) / areas.length : 0);

    const affectedZones =
      asNumber((qa as any)?.affectedZones) ||
      new Set(
        areas
          .filter((row) => {
            const st = String(row.status || row.volatility || "").toLowerCase();
            return st.includes("unstable") || st.includes("drop") || st.includes("recover");
          })
          .map((row) => `${row.city || ""}-${row.district || ""}`)
      ).size;

    const recoveryScore = asNumber((qa as any)?.recoveryScore) || asNumber((qa as any)?.recoveryStatus);

    return {
      totalRecords,
      avgPriceSqm,
      affectedZones,
      outliers: outliers.length,
      recoveryScore,
    };
  }, [qa, areas, outliers]);

  const allSelected = outliers.length > 0 && selectedOutlierIds.length === outliers.length;

  const areaRows = useMemo(
    () =>
      areas
        .filter((row) => {
          const city = String((row as any).city || "").trim();
          const district = String((row as any).district || "").trim();
          const propertyType = String((row as any).property_type || "").trim();
          const avgPpmUsd = (row as any).avg_price_per_m2_usd;
          const sampleCount = (row as any).sample_count;
          return city && district && propertyType && avgPpmUsd != null && sampleCount != null;
        })
        .map((row, idx) => ({
          key: String((row as any).id ?? `${(row as any).city}-${(row as any).district}-${idx}`),
          city: toTitleCase(String((row as any).city).trim()),
          district: toTitleCase(String((row as any).district).trim()),
          propertyType: String((row as any).property_type).trim(),
          avgPricePerM2Usd: Number((row as any).avg_price_per_m2_usd),
          fxUsed: (row as any).fx_used,
          sampleCount: Number((row as any).sample_count),
          updatedAt: (row as any).updated_at,
          confidenceMeta: (row as any).confidence_meta,
        })),
    [areas]
  );

  const toggleSelection = (id: string | number) => {
    setSelectedOutlierIds((prev) => (prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]));
  };

  const toggleAll = () => {
    setSelectedOutlierIds((prev) => (prev.length === outliers.length ? [] : outliers.map((o) => o.id)));
  };

  const handleImport = async () => {
    if (!csvFile) {
      toast.error("Please choose a CSV file first.");
      return;
    }

    setImporting(true);
    try {
      const result = await importAdminMarketCsv(csvFile, csvSource, Number(csvDays));
      setCsvResult(result);
      toast.success("CSV imported successfully.");
      await loadAll();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "CSV import failed.";
      toast.error(msg);
    } finally {
      setImporting(false);
    }
  };

  const handleRebuild = async () => {
    setRebuilding(true);
    try {
      await rebuildAdminMarketAreas();
      toast.success("Areas rebuilt successfully.");
      await loadAll();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Rebuild failed.";
      toast.error(msg);
    } finally {
      setRebuilding(false);
    }
  };

  const handleMark = async (flagged: boolean) => {
    if (!selectedOutlierIds.length) {
      toast.warning("Select at least one outlier row.");
      return;
    }

    setMarking(true);
    try {
      await markAdminMarketOutliers(selectedOutlierIds, flagged);
      toast.success(flagged ? "Outliers marked." : "Outliers unmarked.");
      await loadAll();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Outlier update failed.";
      toast.error(msg);
    } finally {
      setMarking(false);
    }
  };

  return (
    <div className="space-y-4">
      <header className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-white">Market Recovery</h1>
            <p className="mt-1 text-sm text-white/60">
              Admin control panel for market QA, area rebuilds, CSV imports, and outlier governance.
            </p>
          </div>

          <button
            type="button"
            onClick={loadAll}
            className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-sm text-white"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>
        </div>
      </header>

      {error ? (
        <div className="rounded-2xl border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-200">{error}</div>
      ) : null}

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {[
          { label: "Total Records", value: stats.totalRecords.toLocaleString() },
          { label: "Affected Zones", value: stats.affectedZones.toLocaleString() },
          { label: "Average Price / m²", value: `${Math.round(stats.avgPriceSqm).toLocaleString()} SYP` },
          { label: "Outliers", value: stats.outliers.toLocaleString() },
          { label: "Recovery Score", value: `${Math.round(stats.recoveryScore)}%` },
        ].map((card) => (
          <article key={card.label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-white/55">{card.label}</p>
            <p className="mt-2 text-xl font-semibold text-white">{card.value}</p>
          </article>
        ))}
      </section>

      <section className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold text-white">Market Trend Analytics</h2>
            <p className="text-xs text-white/55">Average price, price per m², and listing volume direction.</p>
          </div>
          <TrendRangeSelector value={trendRange} onChange={setTrendRange} />
        </div>
        <TrendSummaryCards points={trendPoints} />
        {trendLoading ? <p className="text-sm text-white/60">Loading trend data...</p> : <MarketTrendChart points={trendPoints} />}
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <h2 className="text-sm font-semibold text-white">CSV Import</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-[1fr_180px_120px_auto]">
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
            className="h-10 rounded-xl border border-white/10 bg-black/30 px-3 text-sm text-white file:mr-3 file:rounded-md file:border-0 file:bg-white file:px-2 file:py-1 file:text-xs file:font-semibold file:text-black"
          />
          <input
            value={csvSource}
            onChange={(e) => setCsvSource(e.target.value)}
            className="h-10 rounded-xl border border-white/10 bg-black/30 px-3 text-sm text-white"
            placeholder="Source"
          />
          <input
            value={csvDays}
            onChange={(e) => setCsvDays(e.target.value)}
            className="h-10 rounded-xl border border-white/10 bg-black/30 px-3 text-sm text-white"
            placeholder="days"
            type="number"
            min={1}
          />
          <button
            type="button"
            onClick={handleImport}
            disabled={importing}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white px-4 text-sm font-semibold text-black disabled:opacity-50"
          >
            <Upload className="h-4 w-4" /> {importing ? "Importing..." : "Import CSV"}
          </button>
        </div>

        {csvResult ? (
          <pre className="mt-3 overflow-x-auto rounded-xl border border-white/10 bg-black/30 p-3 text-xs text-white/80">
            {JSON.stringify(csvResult, null, 2)}
          </pre>
        ) : null}
      </section>

      <MarketSnapshotsViewer onError={(m) => toast.warning(m)} onSuccess={(m) => toast.success(m)} />

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-4">
          <OutlierStatusCards outliers={outliers} />
          <OutlierScatterView outliers={outliers} />
        </div>
        <OutlierInsightsPanel outliers={outliers} />
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-white">Areas</h2>
          <button
            type="button"
            onClick={handleRebuild}
            disabled={rebuilding}
            className="rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-sm text-white disabled:opacity-50"
          >
            {rebuilding ? "Rebuilding..." : "Rebuild Areas"}
          </button>
        </div>

        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="min-w-[900px] w-full text-sm text-white/90">
            <thead className="bg-black/40 text-xs uppercase tracking-[0.12em] text-white/55">
              <tr>
                <th className="px-3 py-2 text-left">City</th>
                <th className="px-3 py-2 text-left">District</th>
                <th className="px-3 py-2 text-left">Property Type</th>
                <th className="px-3 py-2 text-left">Avg Price/m² (USD)</th>
                <th className="px-3 py-2 text-left">FX Used</th>
                <th className="px-3 py-2 text-left">Sample Count</th>
                <th className="px-3 py-2 text-left">Updated At</th>
                <th className="px-3 py-2 text-left">Confidence</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="px-3 py-6 text-center text-white/60">Loading...</td></tr>
              ) : areaRows.length ? (
                areaRows.map((row) => (
                  <tr key={row.key} className="border-t border-white/10 hover:bg-white/5">
                    <td className="px-3 py-2">{row.city}</td>
                    <td className="px-3 py-2">{row.district}</td>
                    <td className="px-3 py-2">{row.propertyType}</td>
                    <td className="px-3 py-2">
                      {Number.isFinite(row.avgPricePerM2Usd) ? row.avgPricePerM2Usd.toLocaleString() : "-"}
                    </td>
                    <td className="px-3 py-2">{row.fxUsed != null ? String(row.fxUsed) : "-"}</td>
                    <td className="px-3 py-2">
                      {Number.isFinite(row.sampleCount) ? row.sampleCount.toLocaleString() : "-"}
                    </td>
                    <td className="px-3 py-2">{row.updatedAt ? String(row.updatedAt) : "-"}</td>
                    <td className="px-3 py-2">
                      {row.confidenceMeta != null
                        ? (typeof row.confidenceMeta === "string"
                            ? row.confidenceMeta
                            : JSON.stringify(row.confidenceMeta))
                        : "-"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={8} className="px-3 py-6 text-center text-white/60">No valid area rows returned from backend.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-white">Outliers</h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleMark(true)}
              disabled={marking || !selectedOutlierIds.length}
              className="rounded-xl border border-amber-400/40 bg-amber-500/15 px-3 py-2 text-sm text-amber-100 disabled:opacity-50"
            >
              Mark Outlier
            </button>
            <button
              type="button"
              onClick={() => handleMark(false)}
              disabled={marking || !selectedOutlierIds.length}
              className="rounded-xl border border-emerald-400/40 bg-emerald-500/15 px-3 py-2 text-sm text-emerald-100 disabled:opacity-50"
            >
              Unmark Outlier
            </button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="min-w-[1100px] w-full text-sm text-white/90">
            <thead className="bg-black/40 text-xs uppercase tracking-[0.12em] text-white/55">
              <tr>
                <th className="px-3 py-2 text-left">
                  <input type="checkbox" checked={allSelected} onChange={toggleAll} />
                </th>
                <th className="px-3 py-2 text-left">City</th>
                <th className="px-3 py-2 text-left">District</th>
                <th className="px-3 py-2 text-left">Type</th>
                <th className="px-3 py-2 text-left">Listing</th>
                <th className="px-3 py-2 text-left">Price</th>
                <th className="px-3 py-2 text-left">Price/m²</th>
                <th className="px-3 py-2 text-left">Reason</th>
                <th className="px-3 py-2 text-left">Flagged</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} className="px-3 py-6 text-center text-white/60">Loading...</td></tr>
              ) : outliers.length ? (
                outliers.map((row) => {
                  const selected = selectedOutlierIds.includes(row.id);
                  return (
                    <tr key={String(row.id)} className="border-t border-white/10 hover:bg-white/5">
                      <td className="px-3 py-2">
                        <input type="checkbox" checked={selected} onChange={() => toggleSelection(row.id)} />
                      </td>
                      <td className="px-3 py-2">{row.city || "-"}</td>
                      <td className="px-3 py-2">{row.district || "-"}</td>
                      <td className="px-3 py-2">{row.propertyType || "-"}</td>
                      <td className="px-3 py-2">{row.listingType || "-"}</td>
                      <td className="px-3 py-2">{asNumber(row.price).toLocaleString()} SYP</td>
                      <td className="px-3 py-2">{Math.round(asNumber(row.pricePerSqm)).toLocaleString()} SYP</td>
                      <td className="px-3 py-2">{row.reason || "-"}</td>
                      <td className="px-3 py-2">
                        {row.flagged ? (
                          <span className="inline-flex rounded-full border border-red-400/30 bg-red-500/15 px-2 py-0.5 text-xs text-red-200">Flagged</span>
                        ) : (
                          <span className="inline-flex rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-xs text-white/70">Normal</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="px-3 py-8 text-center text-white/60">
                    <div className="inline-flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" /> No outliers returned.
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
