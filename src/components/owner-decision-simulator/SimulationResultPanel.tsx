import type { SimulationResult } from "@/components/owner-decision-simulator/types";
import { useTranslation } from "react-i18next";

type Props = {
  result: SimulationResult;
};

export default function SimulationResultPanel({ result }: Props) {
  const { t } = useTranslation();
  const riskClass =
    result.risk === "Low"
      ? "border-emerald-400/30 bg-emerald-500/15 text-emerald-200"
      : result.risk === "Medium"
      ? "border-amber-400/30 bg-amber-500/15 text-amber-200"
      : "border-red-400/30 bg-red-500/15 text-red-200";

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <h3 className="text-sm font-semibold text-white">{t("Simulation Result")}</h3>
      <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        <article className="rounded-xl border border-white/10 bg-black/25 p-3"><p className="text-xs text-white/55">{t("Adjusted price")}</p><p className="mt-1 text-sm font-semibold text-white">{Math.round(result.adjustedPrice).toLocaleString()} SYP</p></article>
        <article className="rounded-xl border border-white/10 bg-black/25 p-3"><p className="text-xs text-white/55">{t("Suggested range")}</p><p className="mt-1 text-sm font-semibold text-white">{Math.round(result.suggestedMin).toLocaleString()} - {Math.round(result.suggestedMax).toLocaleString()} SYP</p></article>
        <article className="rounded-xl border border-white/10 bg-black/25 p-3"><p className="text-xs text-white/55">{t("Confidence")}</p><p className="mt-1 text-sm font-semibold text-white">{Math.round(result.confidence)}%</p></article>
        <article className="rounded-xl border border-white/10 bg-black/25 p-3"><p className="text-xs text-white/55">{t("Sale outlook")}</p><p className="mt-1 text-sm font-semibold text-white">{t(result.saleOutlook)}</p></article>
        <article className="rounded-xl border border-white/10 bg-black/25 p-3"><p className="text-xs text-white/55">{t("Recommendation")}</p><p className="mt-1 text-sm font-semibold text-white">{t(result.recommendation)}</p></article>
        <article className="rounded-xl border border-white/10 bg-black/25 p-3"><p className="text-xs text-white/55">{t("Risk")}</p><p className={`mt-1 inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${riskClass}`}>{t("{{risk}} Risk", { risk: result.risk })}</p></article>
      </div>
    </section>
  );
}
