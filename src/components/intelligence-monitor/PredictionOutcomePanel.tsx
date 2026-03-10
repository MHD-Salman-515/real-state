import type { PredictionOutcomeRow } from "@/utils/intelligenceAnalytics";

type Props = {
  rows: PredictionOutcomeRow[];
  loading?: boolean;
};

function toMoney(v: number): string {
  return `${Math.round(v).toLocaleString()} SYP`;
}

function errorClass(value: number): string {
  if (Math.abs(value) <= 5) return "text-white";
  if (value > 0) return "text-red-200";
  return "text-amber-200";
}

export default function PredictionOutcomePanel({ rows, loading = false }: Props) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="mb-3">
        <h2 className="text-sm font-semibold text-white">Prediction vs Outcome</h2>
        <p className="text-xs text-white/55">Latest 10 logged predictions compared to observed outcomes.</p>
      </div>

      <div className="space-y-2">
        {loading ? (
          Array.from({ length: 5 }).map((_, idx) => <div key={idx} className="h-14 animate-pulse rounded-xl border border-white/10 bg-black/30" />)
        ) : rows.length ? (
          rows.map((row) => (
            <article key={row.id} className="rounded-xl border border-white/10 bg-black/30 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-medium text-white">{row.district}</p>
                <p className={`text-sm font-semibold ${errorClass(row.errorPct)}`}>
                  {row.errorPct > 0 ? "+" : ""}{row.errorPct.toFixed(1)}%
                </p>
              </div>
              <div className="mt-1 grid gap-1 text-xs text-white/65 sm:grid-cols-3">
                <span>Prediction: <strong className="text-white/90">{toMoney(row.predictedPrice)}</strong></span>
                <span>Outcome: <strong className="text-white/90">{toMoney(row.outcomePrice)}</strong></span>
                <span>Confidence: <strong className="text-white/90">{row.confidence}</strong></span>
              </div>
            </article>
          ))
        ) : (
          <div className="rounded-xl border border-white/10 bg-black/30 p-6 text-center text-sm text-white/55">
            No prediction outcome logs available.
          </div>
        )}
      </div>
    </section>
  );
}
