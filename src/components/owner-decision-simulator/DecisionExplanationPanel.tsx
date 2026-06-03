import type { SimulationResult } from "@/components/owner-decision-simulator/types";
import { useTranslation } from "react-i18next";

type Props = {
  result: SimulationResult;
};

export default function DecisionExplanationPanel({ result }: Props) {
  const { t } = useTranslation();
  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <h3 className="text-sm font-semibold text-white">{t("Explanation")}</h3>
      <ul className="mt-3 space-y-2">
        {result.explanation.map((line, idx) => (
          <li key={idx} className="rounded-xl border border-white/10 bg-black/25 p-2.5 text-sm text-white/85">
            {line}
          </li>
        ))}
      </ul>
    </section>
  );
}
