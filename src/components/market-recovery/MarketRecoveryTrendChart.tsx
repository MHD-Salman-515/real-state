import type { MarketRecoveryRecord } from "./types";

type Props = {
  records: MarketRecoveryRecord[];
};

function average(values: number[]): number {
  if (!values.length) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export default function MarketRecoveryTrendChart({ records }: Props) {
  const sorted = [...records].sort((a, b) => +new Date(a.dateAdded) - +new Date(b.dateAdded));
  const prices = sorted.map((r) => r.pricePerSqm);
  const last7 = average(prices.slice(-7));
  const last30 = average(prices.slice(-30));
  const direction = last7 >= last30 ? "Upward recovery" : "Downward pressure";

  const points = prices.slice(-12);
  const max = Math.max(...points, 1);

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-white">Recovery Trend</h3>
          <p className="text-xs text-white/55">Last 7 days vs Last 30 days (price per m²)</p>
        </div>
        <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-white/75">{direction}</span>
      </div>

      <div className="flex h-40 items-end gap-2 rounded-xl border border-white/10 bg-black/25 p-3">
        {points.length ? (
          points.map((value, i) => (
            <div key={i} className="flex-1">
              <div
                className="w-full rounded-t bg-white/70 transition-all hover:bg-white"
                style={{ height: `${Math.max(8, (value / max) * 100)}%` }}
              />
            </div>
          ))
        ) : (
          <p className="text-sm text-white/50">Not enough data for trend chart.</p>
        )}
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-black/25 p-2.5 text-xs text-white/70">
          <p className="text-white/50">Last 7 days avg</p>
          <p className="mt-1 text-sm font-semibold text-white">{Math.round(last7).toLocaleString()} SYP / m²</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-black/25 p-2.5 text-xs text-white/70">
          <p className="text-white/50">Last 30 days avg</p>
          <p className="mt-1 text-sm font-semibold text-white">{Math.round(last30).toLocaleString()} SYP / m²</p>
        </div>
      </div>
    </section>
  );
}
