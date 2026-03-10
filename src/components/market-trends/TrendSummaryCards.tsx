import type { MarketTrendPoint } from "@/services/marketTrends.api";

type Props = {
  points: MarketTrendPoint[];
};

function num(v: unknown): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export default function TrendSummaryCards({ points }: Props) {
  const avg = points.length
    ? points.reduce((acc, p) => acc + num(p.avgPricePerSqm || p.avgPrice), 0) / points.length
    : 0;
  const volume = points.reduce((acc, p) => acc + num(p.listingVolume), 0);
  const first = num(points[0]?.avgPricePerSqm || points[0]?.avgPrice);
  const last = num(points[points.length - 1]?.avgPricePerSqm || points[points.length - 1]?.avgPrice);
  const change = first ? ((last - first) / first) * 100 : 0;

  return (
    <section className="grid gap-3 md:grid-cols-3">
      <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <p className="text-xs uppercase tracking-[0.14em] text-white/55">Avg Price / m²</p>
        <p className="mt-2 text-xl font-semibold text-white">{Math.round(avg).toLocaleString()} SYP</p>
      </article>
      <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <p className="text-xs uppercase tracking-[0.14em] text-white/55">Listing Volume</p>
        <p className="mt-2 text-xl font-semibold text-white">{Math.round(volume).toLocaleString()}</p>
      </article>
      <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <p className="text-xs uppercase tracking-[0.14em] text-white/55">Trend Change</p>
        <p className={`mt-2 text-xl font-semibold ${change >= 0 ? "text-emerald-200" : "text-red-200"}`}>
          {change >= 0 ? "+" : ""}{change.toFixed(1)}%
        </p>
      </article>
    </section>
  );
}
