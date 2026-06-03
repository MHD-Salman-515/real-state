import type { ScenarioInput } from "@/components/owner-decision-simulator/types";
import { useTranslation } from "react-i18next";

type Props = {
  value: ScenarioInput;
  onChange: (patch: Partial<ScenarioInput>) => void;
};

const inputClass = "h-10 rounded-xl border border-white/10 bg-black/30 px-3 text-sm text-white";

export default function ScenarioControlsCard({ value, onChange }: Props) {
  const { t } = useTranslation();
  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <h3 className="text-sm font-semibold text-white">{t("Scenario Controls")}</h3>
      <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <div>
          <label className="mb-1 block text-xs text-white/55">{t("Price adjustment (%)")}</label>
          <input className={inputClass} type="number" value={value.priceAdjustmentPct} onChange={(e) => onChange({ priceAdjustmentPct: Number(e.target.value) })} />
        </div>
        <div>
          <label className="mb-1 block text-xs text-white/55">{t("Wait days")}</label>
          <select className={inputClass} value={value.waitDays} onChange={(e) => onChange({ waitDays: Number(e.target.value) as 7 | 30 | 60 | 90 })}>
            <option value={7}>7</option>
            <option value={30}>30</option>
            <option value={60}>60</option>
            <option value={90}>90</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs text-white/55">{t("Market movement (%)")}</label>
          <input className={inputClass} type="number" value={value.marketMovementPct} onChange={(e) => onChange({ marketMovementPct: Number(e.target.value) })} />
        </div>
        <div>
          <label className="mb-1 block text-xs text-white/55">{t("Demand level")}</label>
          <select className={inputClass} value={value.demand} onChange={(e) => onChange({ demand: e.target.value as any })}>
            <option value="low">{t("Low")}</option>
            <option value="normal">{t("Normal")}</option>
            <option value="high">{t("High")}</option>
          </select>
        </div>
      </div>
    </section>
  );
}
