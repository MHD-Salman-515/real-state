import type { IntelligenceInsights } from "@/utils/intelligenceAnalytics";

type Props = {
  insights: IntelligenceInsights;
  loading?: boolean;
};

export default function ModelInsightsPanel({ insights, loading = false }: Props) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="mb-3">
        <h2 className="text-sm font-semibold text-white">Model Insights</h2>
        <p className="text-xs text-white/55">System-generated observations for confidence and recommendation quality.</p>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="h-10 animate-pulse rounded-xl border border-white/10 bg-black/30" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="grid gap-2 sm:grid-cols-3">
            <article className="rounded-xl border border-white/10 bg-black/30 p-3">
              <p className="text-xs text-white/55">Top District</p>
              <p className="mt-1 text-sm font-semibold text-white">{insights.strongestDistrict}</p>
            </article>
            <article className="rounded-xl border border-white/10 bg-black/30 p-3">
              <p className="text-xs text-white/55">Sparse Data Zone</p>
              <p className="mt-1 text-sm font-semibold text-white">{insights.sparseDistrict}</p>
            </article>
            <article className="rounded-xl border border-white/10 bg-black/30 p-3">
              <p className="text-xs text-white/55">Volatility Hotspot</p>
              <p className="mt-1 text-sm font-semibold text-white">{insights.volatilityHotspot}</p>
            </article>
          </div>

          <div className="rounded-xl border border-white/10 bg-black/30 p-3">
            <p className="text-xs text-white/55">Recommendation Delta</p>
            <p className="mt-1 text-sm font-semibold text-white">
              {insights.recommendationDeltaPct >= 0 ? "+" : ""}{insights.recommendationDeltaPct.toFixed(1)}%
            </p>
          </div>

          <div className="space-y-2">
            {insights.messages.map((m, idx) => (
              <article key={idx} className="rounded-xl border border-white/10 bg-black/30 p-3 text-sm text-white/80">
                {m}
              </article>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
