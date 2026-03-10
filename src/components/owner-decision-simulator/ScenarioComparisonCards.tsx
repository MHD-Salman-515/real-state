import type { SimulationResult } from "@/components/owner-decision-simulator/types";

type Props = {
  currentPlan: SimulationResult;
  simulatedPlan: SimulationResult;
};

function Card({ title, item }: { title: string; item: SimulationResult }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className="text-xs uppercase tracking-[0.14em] text-white/55">{title}</p>
      <p className="mt-2 text-sm text-white/80">Recommended: <span className="font-semibold text-white">{item.recommendation}</span></p>
      <p className="mt-1 text-sm text-white/80">Range: <span className="font-semibold text-white">{Math.round(item.suggestedMin).toLocaleString()} - {Math.round(item.suggestedMax).toLocaleString()} SYP</span></p>
      <p className="mt-1 text-sm text-white/80">Risk: <span className="font-semibold text-white">{item.risk}</span></p>
      <p className="mt-1 text-sm text-white/80">Outlook: <span className="font-semibold text-white">{item.saleOutlook}</span></p>
    </article>
  );
}

export default function ScenarioComparisonCards({ currentPlan, simulatedPlan }: Props) {
  return (
    <section className="grid gap-3 md:grid-cols-2">
      <Card title="Current Plan" item={currentPlan} />
      <Card title="Simulated Plan" item={simulatedPlan} />
    </section>
  );
}
