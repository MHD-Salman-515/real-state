export type DemandLevel = "low" | "normal" | "high";

export interface PropertyBaseInput {
  city: string;
  district: string;
  propertyType: string;
  area: number;
  bedrooms?: number;
  bathrooms?: number;
  askingPrice: number;
}

export interface ScenarioInput {
  priceAdjustmentPct: number;
  waitDays: 7 | 30 | 60 | 90;
  marketMovementPct: number;
  demand: DemandLevel;
}

export interface SimulationResult {
  adjustedPrice: number;
  suggestedMin: number;
  suggestedMax: number;
  confidence: number;
  saleOutlook: "Weak" | "Balanced" | "Improved" | "Strong";
  risk: "Low" | "Medium" | "High";
  recommendation: "Sell now" | "Reduce price" | "Wait" | "Monitor market";
  explanation: string[];
}
