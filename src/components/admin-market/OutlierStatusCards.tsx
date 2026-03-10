import type { MarketOutlierRow } from "@/services/adminMarketRecovery.api";

type Props = {
  outliers: MarketOutlierRow[];
};

export default function OutlierStatusCards({ outliers }: Props) {
  const total = outliers.length;
  const flagged = outliers.filter((o) => Boolean(o.flagged)).length;
  const flaggedPct = total ? Math.round((flagged / total) * 100) : 0;

  const districtMap = new Map<string, number>();
  outliers.forEach((o) => {
    const key = `${o.city || "-"} / ${o.district || "-"}`;
    districtMap.set(key, (districtMap.get(key) || 0) + 1);
  });
  const hotspot = [...districtMap.entries()].sort((a, b) => b[1] - a[1])[0];

  return (
    <section className="grid gap-3 md:grid-cols-3">
      <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <p className="text-xs uppercase tracking-[0.14em] text-white/55">Total Outliers</p>
        <p className="mt-2 text-xl font-semibold text-white">{total.toLocaleString()}</p>
      </article>
      <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <p className="text-xs uppercase tracking-[0.14em] text-white/55">Flagged Ratio</p>
        <p className="mt-2 text-xl font-semibold text-amber-200">{flaggedPct}%</p>
      </article>
      <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <p className="text-xs uppercase tracking-[0.14em] text-white/55">Anomaly Hotspot</p>
        <p className="mt-2 text-sm font-semibold text-white">{hotspot ? `${hotspot[0]} (${hotspot[1]})` : "-"}</p>
      </article>
    </section>
  );
}
