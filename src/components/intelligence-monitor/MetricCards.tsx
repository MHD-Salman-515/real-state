import type { IntelligenceSummaryMetrics } from "@/utils/intelligenceAnalytics";

type Props = {
  metrics: IntelligenceSummaryMetrics;
  loading?: boolean;
};

const METRICS = [
  { key: "predictionAccuracy", label: "Prediction Accuracy", format: (v: number) => `${v}%` },
  { key: "averagePriceError", label: "Average Price Error", format: (v: number) => `±${v}%` },
  { key: "recommendationSuccessRate", label: "Recommendation Success Rate", format: (v: number) => `${v}%` },
  { key: "totalPredictionsLogged", label: "Total Predictions Logged", format: (v: number) => Math.round(v).toLocaleString() },
  { key: "totalOutcomesRecorded", label: "Total Outcomes Recorded", format: (v: number) => Math.round(v).toLocaleString() },
] as const;

export default function MetricCards({ metrics, loading = false }: Props) {
  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
      {METRICS.map((metric) => {
        const raw = Number(metrics[metric.key] || 0);
        return (
          <article key={metric.key} className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-white/55">{metric.label}</p>
            <p className="mt-2 text-2xl font-semibold text-white">
              {loading ? <span className="inline-block h-7 w-20 animate-pulse rounded bg-white/10" /> : metric.format(raw)}
            </p>
          </article>
        );
      })}
    </section>
  );
}
