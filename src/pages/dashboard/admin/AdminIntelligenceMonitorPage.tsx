import { useEffect, useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";
import { useToast } from "@/components/ToastProvider.jsx";
import MetricCards from "@/components/intelligence-monitor/MetricCards";
import AccuracyTrendChart from "@/components/intelligence-monitor/AccuracyTrendChart";
import DistrictPerformanceTable from "@/components/intelligence-monitor/DistrictPerformanceTable";
import PredictionOutcomePanel from "@/components/intelligence-monitor/PredictionOutcomePanel";
import ModelInsightsPanel from "@/components/intelligence-monitor/ModelInsightsPanel";
import {
  buildDistrictPerformance,
  buildIntelligenceSummary,
  buildModelInsights,
  buildPredictionOutcomes,
} from "@/utils/intelligenceAnalytics";
import { getMarketTrends, type MarketTrendPoint } from "@/services/marketTrends.api";
import {
  getAdminMarketAreas,
  getAdminMarketOutliers,
  getAdminMarketQA,
  type MarketAreaRow,
  type MarketOutlierRow,
  type MarketQAResponse,
} from "@/services/adminMarketRecovery.api";

export default function AdminIntelligenceMonitorPage() {
  const toast = useToast();

  const [qa, setQa] = useState<MarketQAResponse | null>(null);
  const [areas, setAreas] = useState<MarketAreaRow[]>([]);
  const [outliers, setOutliers] = useState<MarketOutlierRow[]>([]);
  const [trendPoints, setTrendPoints] = useState<MarketTrendPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [qaData, areaData, outlierData, trendData] = await Promise.all([
        getAdminMarketQA(),
        getAdminMarketAreas(),
        getAdminMarketOutliers(),
        getMarketTrends({ range: 30, scope: "admin" }),
      ]);

      setQa(qaData);
      setAreas(areaData);
      setOutliers(outlierData);
      setTrendPoints(Array.isArray(trendData?.points) ? trendData.points : []);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Failed to load intelligence monitor analytics.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const summary = useMemo(() => buildIntelligenceSummary(qa, areas, outliers, trendPoints), [qa, areas, outliers, trendPoints]);
  const districtRows = useMemo(() => buildDistrictPerformance(areas), [areas]);
  const outcomeRows = useMemo(() => buildPredictionOutcomes(areas, trendPoints), [areas, trendPoints]);
  const insights = useMemo(() => buildModelInsights(districtRows, summary, trendPoints), [districtRows, summary, trendPoints]);

  return (
    <div className="space-y-4">
      <header className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-white">AI Intelligence Monitor</h1>
            <p className="mt-1 text-sm text-white/60">
              Track prediction accuracy, recommendation reliability, and market model performance over time.
            </p>
          </div>

          <button
            type="button"
            onClick={load}
            className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-sm text-white"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>
        </div>
      </header>

      {error ? <div className="rounded-2xl border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-200">{error}</div> : null}

      <MetricCards metrics={summary} loading={loading} />

      <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <AccuracyTrendChart points={trendPoints} loading={loading} />
        <ModelInsightsPanel insights={insights} loading={loading} />
      </div>

      <DistrictPerformanceTable rows={districtRows} loading={loading} />
      <PredictionOutcomePanel rows={outcomeRows} loading={loading} />
    </div>
  );
}
