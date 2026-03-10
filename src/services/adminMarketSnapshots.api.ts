import api from "@/api/axios";

export interface MarketSnapshot {
  id: string | number;
  date: string;
  city?: string;
  district?: string;
  propertyType?: string;
  listingType?: string;
  avgPrice?: number;
  avgPricePerSqm?: number;
  listingCount?: number;
  volatility?: string;
  [key: string]: unknown;
}

function pickArray<T = any>(payload: any): T[] {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.rows)) return payload.rows;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}

export async function getAdminMarketSnapshots(): Promise<MarketSnapshot[]> {
  const res = await api.get("/admin/market/snapshots");
  return pickArray<MarketSnapshot>(res.data).map((row, idx) => ({
    ...row,
    id: row.id ?? idx,
    date: String(row.date || row.updatedAt || row.createdAt || ""),
  }));
}

export async function rebuildAdminMarketSnapshots(): Promise<any> {
  const res = await api.post("/admin/market/rebuild-snapshots", {});
  return res.data;
}
