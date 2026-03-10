import { AlertTriangle, ShieldAlert, TrendingUp } from "lucide-react";

type Props = {
  droppingCount: number;
  unstableCount: number;
  recoveringCount: number;
};

function Badge({ label, tone }: { label: string; tone: "red" | "yellow" | "green" }) {
  const styles = {
    red: "border-red-400/30 bg-red-500/15 text-red-200",
    yellow: "border-amber-400/30 bg-amber-500/15 text-amber-200",
    green: "border-emerald-400/30 bg-emerald-500/15 text-emerald-200",
  }[tone];

  return <span className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${styles}`}>{label}</span>;
}

export default function MarketRecoveryAlerts({ droppingCount, unstableCount, recoveringCount }: Props) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-white">Volatility Alerts</h3>
          <p className="mt-1 text-xs text-white/55">
            High volatility detected. Add fresh entries to recover pricing intelligence quality.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge label={`${droppingCount} Dropping`} tone="red" />
          <Badge label={`${unstableCount} Unstable`} tone="yellow" />
          <Badge label={`${recoveringCount} Recovering`} tone="green" />
        </div>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-3">
        <article className="rounded-xl border border-red-400/20 bg-red-500/10 p-3 text-sm text-red-100">
          <div className="mb-1 flex items-center gap-2"><ShieldAlert className="h-4 w-4" /> Strong price drop in Mazzeh</div>
          <p className="text-xs text-red-100/80">Collect more recent sales comps within 24h.</p>
        </article>
        <article className="rounded-xl border border-amber-400/20 bg-amber-500/10 p-3 text-sm text-amber-100">
          <div className="mb-1 flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> Kafr Sousa instability</div>
          <p className="text-xs text-amber-100/80">Spread widening between listing and close prices.</p>
        </article>
        <article className="rounded-xl border border-emerald-400/20 bg-emerald-500/10 p-3 text-sm text-emerald-100">
          <div className="mb-1 flex items-center gap-2"><TrendingUp className="h-4 w-4" /> Recovery opportunity</div>
          <p className="text-xs text-emerald-100/80">Abu Rummaneh confidence improves with fresh inputs.</p>
        </article>
      </div>
    </section>
  );
}
