import type { SimulationResult } from "@/components/owner-decision-simulator/types";
import { useTranslation } from "react-i18next";

type Props = {
  currentPlan: SimulationResult;
  simulatedPlan: SimulationResult;
};

function Card({ title, item }: { title: string; item: SimulationResult }) {
  const { t } = useTranslation();
  return (
    <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className="text-xs uppercase tracking-[0.14em] text-white/55">{t(title)}</p>
      <p className="mt-2 text-sm text-white/80">{t("Recommended:")} <span className="font-semibold text-white">{t(item.recommendation)}</span></p>
      <p className="mt-1 text-sm text-white/80">{t("Range:")} <span className="font-semibold text-white">{Math.round(item.suggestedMin).toLocaleString()} - {Math.round(item.suggestedMax).toLocaleString()} SYP</span></p>
      <p className="mt-1 text-sm text-white/80">{t("Risk:")} <span className="font-semibold text-white">{t(item.risk)}</span></p>
      <p className="mt-1 text-sm text-white/80">{t("Outlook:")} <span className="font-semibold text-white">{t(item.saleOutlook)}</span></p>
    </article>
  );
}

export default function ScenarioComparisonCards({ currentPlan, simulatedPlan }: Props) {
  const { t } = useTranslation();
  return (
    <section className="grid gap-3 md:grid-cols-2">
      <Card title={t("Current Plan")} item={currentPlan} />
      <Card title={t("Simulated Plan")} item={simulatedPlan} />
    </section>
  );
}
