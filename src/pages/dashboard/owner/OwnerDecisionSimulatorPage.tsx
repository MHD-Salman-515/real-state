import { useEffect, useMemo, useState } from "react";
import PropertyInputCard from "@/components/owner-decision-simulator/PropertyInputCard";
import ScenarioControlsCard from "@/components/owner-decision-simulator/ScenarioControlsCard";
import SimulationResultPanel from "@/components/owner-decision-simulator/SimulationResultPanel";
import DecisionExplanationPanel from "@/components/owner-decision-simulator/DecisionExplanationPanel";
import ScenarioComparisonCards from "@/components/owner-decision-simulator/ScenarioComparisonCards";
import TrendRangeSelector from "@/components/market-trends/TrendRangeSelector";
import MarketTrendChart from "@/components/market-trends/MarketTrendChart";
import { getMarketTrends, type MarketTrendPoint } from "@/services/marketTrends.api";
import { simulateOwnerDecision } from "@/utils/ownerDecisionSimulator";
import type { PropertyBaseInput, ScenarioInput } from "@/components/owner-decision-simulator/types";

const defaultProperty: PropertyBaseInput = {
  city: "Damascus",
  district: "Mazzeh",
  propertyType: "Apartment",
  area: 140,
  bedrooms: 3,
  bathrooms: 2,
  askingPrice: 1200000000,
};

const defaultScenario: ScenarioInput = {
  priceAdjustmentPct: -5,
  waitDays: 30,
  marketMovementPct: -2,
  demand: "normal",
};

export default function OwnerDecisionSimulatorPage() {
  const [property, setProperty] = useState<PropertyBaseInput>(defaultProperty);
  const [scenario, setScenario] = useState<ScenarioInput>(defaultScenario);
  const [range, setRange] = useState<7 | 30 | 90>(30);
  const [trendPoints, setTrendPoints] = useState<MarketTrendPoint[]>([]);
  const [trendLoading, setTrendLoading] = useState(false);

  useEffect(() => {
    const loadTrend = async () => {
      setTrendLoading(true);
      try {
        const data = await getMarketTrends({ city: property.city, district: property.district, range, scope: "owner" });
        setTrendPoints(Array.isArray(data.points) ? data.points : []);
      } catch {
        setTrendPoints([]);
      } finally {
        setTrendLoading(false);
      }
    };
    loadTrend();
  }, [property.city, property.district, range]);

  const trendChangePct = useMemo(() => {
    if (trendPoints.length < 2) return 0;
    const first = Number(trendPoints[0]?.avgPricePerSqm || trendPoints[0]?.avgPrice || 0);
    const last = Number(trendPoints[trendPoints.length - 1]?.avgPricePerSqm || trendPoints[trendPoints.length - 1]?.avgPrice || 0);
    if (!first) return 0;
    return ((last - first) / first) * 100;
  }, [trendPoints]);

  const simulated = useMemo(
    () => simulateOwnerDecision(property, scenario, trendChangePct),
    [property, scenario, trendChangePct]
  );

  const currentPlan = useMemo(
    () => simulateOwnerDecision(property, { ...scenario, priceAdjustmentPct: 0, waitDays: 7, marketMovementPct: 0, demand: "normal" }, trendChangePct),
    [property, scenario, trendChangePct]
  );

  return (
    <div className="space-y-4">
      <header className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <h1 className="text-2xl font-semibold text-white">What-If Market Simulator</h1>
        <p className="mt-1 text-sm text-white/60">Explore pricing and market scenarios before making a selling decision.</p>
      </header>

      <PropertyInputCard value={property} onChange={(patch) => setProperty((p) => ({ ...p, ...patch }))} />
      <ScenarioControlsCard value={scenario} onChange={(patch) => setScenario((p) => ({ ...p, ...patch }))} />

      <SimulationResultPanel result={simulated} />
      <ScenarioComparisonCards currentPlan={currentPlan} simulatedPlan={simulated} />
      <DecisionExplanationPanel result={simulated} />

      <section className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold text-white">Trend Preview</h2>
            <p className="text-xs text-white/55">Compact district trend context for decision support.</p>
          </div>
          <TrendRangeSelector value={range} onChange={setRange} />
        </div>
        {trendLoading ? <p className="text-sm text-white/60">Loading trend...</p> : <MarketTrendChart points={trendPoints} title="District Market Preview" />}
      </section>
    </div>
  );
}
