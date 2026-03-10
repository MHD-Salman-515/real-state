import api from "@/api/axios";

export interface MarketTrendPoint {
  date: string;
  avgPrice?: number;
  avgPricePerSqm?: number;
  listingVolume?: number;
}

export interface MarketTrendResponse {
  points: MarketTrendPoint[];
  [key: string]: unknown;
}

export async function getMarketTrends(params: Record<string, string | number | undefined> = {}): Promise<MarketTrendResponse> {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    query.set(k, String(v));
  });

  const suffix = query.toString() ? `?${query.toString()}` : "";
  const res = await api.get(`/market/trends${suffix}`);
  const data = res.data;

  if (Array.isArray(data)) return { points: data };
  if (Array.isArray(data?.points)) return data as MarketTrendResponse;
  if (Array.isArray(data?.items)) return { ...(data || {}), points: data.items };

  return { points: [] };
}
