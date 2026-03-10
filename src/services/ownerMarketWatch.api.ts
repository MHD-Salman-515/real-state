import api from "@/api/axios";

export interface OwnerMarketWatchItem {
  id: string | number;
  city: string;
  district: string;
  propertyType?: string;
  listingType?: string;
  targetPricePerSqm?: number;
  notes?: string;
  createdAt?: string;
  [key: string]: unknown;
}

export interface OwnerMarketInsight {
  label?: string;
  value?: string | number;
  tone?: "neutral" | "good" | "warning" | "danger";
  [key: string]: unknown;
}

function pickArray<T = any>(payload: any): T[] {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.rows)) return payload.rows;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}

export async function getOwnerMarketWatchList(): Promise<OwnerMarketWatchItem[]> {
  const res = await api.get("/owner/market-watch/list");
  return pickArray<OwnerMarketWatchItem>(res.data).map((item) => ({
    ...item,
    id: item.id ?? `${item.city}-${item.district}-${Math.random().toString(36).slice(2, 8)}`,
  }));
}

export async function getOwnerMarketWatchInsights(city?: string): Promise<OwnerMarketInsight[]> {
  const normalizedCity = String(city || "").trim();
  if (!normalizedCity) return [];
  const res = await api.get("/owner/market-watch/insights", {
    params: { city: normalizedCity },
  });
  const raw = res.data;
  if (Array.isArray(raw)) return raw as OwnerMarketInsight[];
  if (Array.isArray(raw?.insights)) return raw.insights as OwnerMarketInsight[];
  if (raw && typeof raw === "object") {
    return Object.entries(raw).map(([label, value]) => ({ label, value: String(value) }));
  }
  return [];
}

export async function createOwnerMarketWatch(payload: Record<string, unknown>): Promise<any> {
  const normalizedPayload = {
    city: String(payload.city ?? "").trim(),
    district: String(payload.district ?? "").trim(),
    property_type: String(payload.property_type ?? payload.propertyType ?? "").trim(),
    days_window: Number(payload.days_window ?? payload.daysWindow ?? 30),
  };
  const res = await api.post("/owner/market-watch", normalizedPayload);
  return res.data;
}

export async function deleteOwnerMarketWatch(id: string | number): Promise<any> {
  const res = await api.delete(`/owner/market-watch/${id}`);
  return res.data;
}
