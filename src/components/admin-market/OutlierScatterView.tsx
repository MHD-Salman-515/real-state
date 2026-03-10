import type { MarketOutlierRow } from "@/services/adminMarketRecovery.api";

type Props = {
  outliers: MarketOutlierRow[];
};

function n(v: unknown): number {
  const x = Number(v);
  return Number.isFinite(x) ? x : 0;
}

export default function OutlierScatterView({ outliers }: Props) {
  const max = Math.max(...outliers.map((o) => n(o.pricePerSqm)), 1);

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <h3 className="text-sm font-semibold text-white">Outlier Deviation View</h3>
      <p className="mt-1 text-xs text-white/55">Visual spread by price per m² severity</p>

      <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
        {outliers.length ? (
          outliers.slice(0, 12).map((o) => {
            const ratio = (n(o.pricePerSqm) / max) * 100;
            return (
              <article key={String(o.id)} className="rounded-xl border border-white/10 bg-black/25 p-2.5">
                <p className="truncate text-xs text-white/70">{o.city} / {o.district}</p>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                  <div className={`h-full ${o.flagged ? "bg-red-400" : "bg-amber-300"}`} style={{ width: `${Math.max(8, ratio)}%` }} />
                </div>
                <p className="mt-2 text-[11px] text-white/60">{Math.round(n(o.pricePerSqm)).toLocaleString()} SYP / m²</p>
              </article>
            );
          })
        ) : (
          <p className="text-sm text-white/55">No outlier points to visualize.</p>
        )}
      </div>
    </section>
  );
}
