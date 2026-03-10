import type { SimulationResult } from "@/components/owner-decision-simulator/types";

type Props = {
  result: SimulationResult;
};

export default function SimulationResultPanel({ result }: Props) {
  const riskClass =
    result.risk === "Low"
      ? "border-emerald-400/30 bg-emerald-500/15 text-emerald-200"
      : result.risk === "Medium"
      ? "border-amber-400/30 bg-amber-500/15 text-amber-200"
      : "border-red-400/30 bg-red-500/15 text-red-200";

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <h3 className="text-sm font-semibold text-white">Simulation Result</h3>
      <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        <article className="rounded-xl border border-white/10 bg-black/25 p-3"><p className="text-xs text-white/55">Adjusted price</p><p className="mt-1 text-sm font-semibold text-white">{Math.round(result.adjustedPrice).toLocaleString()} SYP</p></article>
        <article className="rounded-xl border border-white/10 bg-black/25 p-3"><p className="text-xs text-white/55">Suggested range</p><p className="mt-1 text-sm font-semibold text-white">{Math.round(result.suggestedMin).toLocaleString()} - {Math.round(result.suggestedMax).toLocaleString()} SYP</p></article>
        <article className="rounded-xl border border-white/10 bg-black/25 p-3"><p className="text-xs text-white/55">Confidence</p><p className="mt-1 text-sm font-semibold text-white">{Math.round(result.confidence)}%</p></article>
        <article className="rounded-xl border border-white/10 bg-black/25 p-3"><p className="text-xs text-white/55">Sale outlook</p><p className="mt-1 text-sm font-semibold text-white">{result.saleOutlook}</p></article>
        <article className="rounded-xl border border-white/10 bg-black/25 p-3"><p className="text-xs text-white/55">Recommendation</p><p className="mt-1 text-sm font-semibold text-white">{result.recommendation}</p></article>
        <article className="rounded-xl border border-white/10 bg-black/25 p-3"><p className="text-xs text-white/55">Risk</p><p className={`mt-1 inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${riskClass}`}>{result.risk} Risk</p></article>
      </div>
    </section>
  );
}
