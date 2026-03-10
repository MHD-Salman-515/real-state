import type { MarketTrendPoint } from "@/services/marketTrends.api";

type Props = {
  title?: string;
  points: MarketTrendPoint[];
};

function safeNumber(v: unknown): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export default function MarketTrendChart({ title = "Market Trend", points }: Props) {
  const normalized = points.map((p) => ({
    date: p.date,
    avg: safeNumber(p.avgPricePerSqm || p.avgPrice),
    volume: safeNumber(p.listingVolume),
  }));

  const maxAvg = Math.max(...normalized.map((p) => p.avg), 1);

  const latest = normalized[normalized.length - 1]?.avg || 0;
  const prev = normalized[normalized.length - 2]?.avg || latest;
  const trend = latest > prev ? "rising" : latest < prev ? "falling" : "stable";

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-white">{title}</h3>
          <p className="text-xs text-white/55">Average price per m² and volume trend</p>
        </div>
        <span
          className={`rounded-full border px-2.5 py-1 text-xs ${
            trend === "rising"
              ? "border-emerald-400/30 bg-emerald-500/15 text-emerald-200"
              : trend === "falling"
              ? "border-red-400/30 bg-red-500/15 text-red-200"
              : "border-white/15 bg-white/5 text-white/75"
          }`}
        >
          {trend}
        </span>
      </div>

      <div className="grid h-44 grid-cols-12 items-end gap-1 rounded-xl border border-white/10 bg-black/30 p-3">
        {normalized.length ? (
          normalized.slice(-12).map((p, idx) => (
            <div key={`${p.date}-${idx}`} className="group relative flex h-full items-end">
              <div
                className="w-full rounded-t bg-white/70 transition group-hover:bg-white"
                style={{ height: `${Math.max(8, (p.avg / maxAvg) * 100)}%` }}
              />
              <div className="pointer-events-none absolute -top-8 left-1/2 hidden -translate-x-1/2 rounded-md border border-white/10 bg-black/80 px-2 py-1 text-[10px] text-white/80 group-hover:block">
                {Math.round(p.avg).toLocaleString()} SYP
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-12 flex items-center justify-center text-sm text-white/55">No trend data available</div>
        )}
      </div>

      <div className="mt-3 grid gap-2 md:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-black/25 p-2.5">
          <p className="text-xs text-white/50">Latest price / m²</p>
          <p className="mt-1 text-sm font-semibold text-white">{Math.round(latest).toLocaleString()} SYP</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-black/25 p-2.5">
          <p className="text-xs text-white/50">Latest volume</p>
          <p className="mt-1 text-sm font-semibold text-white">{Math.round(normalized[normalized.length - 1]?.volume || 0)}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-black/25 p-2.5">
          <p className="text-xs text-white/50">Data points</p>
          <p className="mt-1 text-sm font-semibold text-white">{normalized.length}</p>
        </div>
      </div>
    </section>
  );
}
