import type { MarketOutlierRow } from "@/services/adminMarketRecovery.api";

type Props = {
  outliers: MarketOutlierRow[];
};

function n(v: unknown): number {
  const x = Number(v);
  return Number.isFinite(x) ? x : 0;
}

export default function OutlierInsightsPanel({ outliers }: Props) {
  const deviations = outliers.map((o) => n(o.pricePerSqm));
  const avg = deviations.length ? deviations.reduce((a, b) => a + b, 0) / deviations.length : 0;
  const max = Math.max(...deviations, 0);
  const min = Math.min(...deviations, 0);

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <h3 className="text-sm font-semibold text-white">Outlier Insights</h3>
      <div className="mt-3 space-y-2">
        <article className="rounded-xl border border-white/10 bg-black/25 p-3">
          <p className="text-xs text-white/55">Average deviation baseline</p>
          <p className="mt-1 text-sm font-semibold text-white">{Math.round(avg).toLocaleString()} SYP / m²</p>
        </article>
        <article className="rounded-xl border border-white/10 bg-black/25 p-3">
          <p className="text-xs text-white/55">Max anomaly</p>
          <p className="mt-1 text-sm font-semibold text-red-200">{Math.round(max).toLocaleString()} SYP / m²</p>
        </article>
        <article className="rounded-xl border border-white/10 bg-black/25 p-3">
          <p className="text-xs text-white/55">Min anomaly</p>
          <p className="mt-1 text-sm font-semibold text-emerald-200">{Math.round(min).toLocaleString()} SYP / m²</p>
        </article>
      </div>
    </section>
  );
}
