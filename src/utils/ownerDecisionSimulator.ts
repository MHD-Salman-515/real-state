import type { DemandLevel, PropertyBaseInput, ScenarioInput, SimulationResult } from "@/components/owner-decision-simulator/types";

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

function demandFactor(level: DemandLevel): number {
  if (level === "high") return 0.05;
  if (level === "low") return -0.04;
  return 0;
}

export function simulateOwnerDecision(
  property: PropertyBaseInput,
  scenario: ScenarioInput,
  trendChangePct: number
): SimulationResult {
  const base = Number(property.askingPrice || 0);
  const priceAdj = scenario.priceAdjustmentPct / 100;
  const marketMove = scenario.marketMovementPct / 100;
  const trendMove = trendChangePct / 100;
  const demandMove = demandFactor(scenario.demand);
  const waitMultiplier = scenario.waitDays / 30;

  const adjustedPrice = base * (1 + priceAdj);
  const marketImpact = marketMove + demandMove + trendMove * 0.8;
  const waitImpact = trendMove * waitMultiplier * 0.6 + marketMove * waitMultiplier * 0.4;

  const targetCenter = base * (1 + marketImpact + waitImpact * 0.4);
  const spreadPct = clamp(0.05 + Math.abs(marketMove) * 0.6 + (scenario.demand === "low" ? 0.02 : 0), 0.05, 0.15);
  const suggestedMin = targetCenter * (1 - spreadPct);
  const suggestedMax = targetCenter * (1 + spreadPct);

  const ratioVsCenter = targetCenter ? adjustedPrice / targetCenter : 1;
  const confidence = clamp(
    84 - Math.abs(scenario.marketMovementPct) * 1.4 - (scenario.demand === "low" ? 10 : scenario.demand === "normal" ? 4 : 0),
    45,
    94
  );

  const riskScore =
    Math.abs(scenario.marketMovementPct) * 1.2 +
    (scenario.waitDays >= 60 ? 8 : 3) +
    (scenario.demand === "low" ? 10 : scenario.demand === "normal" ? 4 : 0) +
    (trendChangePct < 0 ? Math.abs(trendChangePct) * 0.8 : 0);

  const risk: SimulationResult["risk"] = riskScore > 22 ? "High" : riskScore > 12 ? "Medium" : "Low";

  let saleOutlook: SimulationResult["saleOutlook"] = "Balanced";
  if (ratioVsCenter <= 0.95 && scenario.demand !== "low") saleOutlook = "Strong";
  else if (ratioVsCenter <= 1.02) saleOutlook = "Improved";
  else if (ratioVsCenter > 1.1) saleOutlook = "Weak";

  let recommendation: SimulationResult["recommendation"] = "Monitor market";
  if (risk === "High" && trendChangePct < 0) recommendation = "Reduce price";
  else if (saleOutlook === "Strong" || saleOutlook === "Improved") recommendation = "Sell now";
  else if (scenario.waitDays >= 60 && trendChangePct > 1 && scenario.demand !== "low") recommendation = "Wait";

  const explanation: string[] = [];
  if (trendChangePct < 0) explanation.push(`District trend is falling by ${Math.abs(trendChangePct).toFixed(1)}% over selected period.`);
  else explanation.push(`District trend is improving by ${trendChangePct.toFixed(1)}% over selected period.`);

  if (ratioVsCenter > 1.05) explanation.push("Current simulated price is above the estimated local acceptance range.");
  else explanation.push("Simulated price is close to the local acceptance range.");

  if (scenario.demand === "low") explanation.push("Low demand increases time-to-sell and pricing risk.");
  if (scenario.waitDays >= 60) explanation.push("Long waiting periods increase exposure to market volatility.");

  return {
    adjustedPrice,
    suggestedMin,
    suggestedMax,
    confidence,
    saleOutlook,
    risk,
    recommendation,
    explanation,
  };
}
