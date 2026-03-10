import api from "@/api/axios";

export interface MarketQAResponse {
  totalRecords?: number;
  affectedZones?: number;
  averagePricePerSqm?: number;
  recoveryScore?: number;
  [key: string]: unknown;
}

export interface MarketAreaRow {
  id?: string | number;
  city?: string;
  district?: string;
  propertyType?: string;
  listingType?: string;
  avgPrice?: number;
  avgPricePerSqm?: number;
  volatility?: string;
  status?: string;
  recordsCount?: number;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface MarketOutlierRow {
  id: string | number;
  city?: string;
  district?: string;
  propertyType?: string;
  listingType?: string;
  area?: number;
  price?: number;
  pricePerSqm?: number;
  source?: string;
  flagged?: boolean;
  reason?: string;
  createdAt?: string;
  [key: string]: unknown;
}

function pickArray<T = any>(payload: any): T[] {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.rows)) return payload.rows;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}

export async function getAdminMarketQA(): Promise<MarketQAResponse> {
  const res = await api.get("/admin/market/qa");
  return (res.data ?? {}) as MarketQAResponse;
}

export async function getAdminMarketAreas(): Promise<MarketAreaRow[]> {
  const res = await api.get("/admin/market/areas");
  return pickArray<MarketAreaRow>(res.data);
}

export async function rebuildAdminMarketAreas(payload: Record<string, unknown> = {}): Promise<any> {
  const normalizedPayload = {
    ...payload,
    city: payload.city !== undefined ? String(payload.city ?? "").trim() : payload.city,
    district: payload.district !== undefined ? String(payload.district ?? "").trim() : payload.district,
  };
  const res = await api.post("/admin/market/rebuild-areas", normalizedPayload);
  return res.data;
}

export async function importAdminMarketCsv(file: File, source?: string, days?: number): Promise<any> {
  const form = new FormData();
  form.append("file", file);
  if (source) form.append("source", source);

  const query = typeof days === "number" && Number.isFinite(days) ? `?days=${days}` : "";
  const res = await api.post(`/admin/market/import-csv${query}`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

export async function getAdminMarketOutliers(): Promise<MarketOutlierRow[]> {
  const res = await api.get("/admin/market/outliers");
  return pickArray<MarketOutlierRow>(res.data).map((row) => ({
    ...row,
    id: row.id ?? `${row.city || "unknown"}-${row.district || "unknown"}-${Math.random().toString(36).slice(2, 8)}`,
  }));
}

export async function markAdminMarketOutliers(ids: Array<string | number>, flagged: boolean): Promise<any> {
  const res = await api.post("/admin/market/outliers/mark", {
    ids,
    flagged,
    mark: flagged,
    action: flagged ? "mark" : "unmark",
  });
  return res.data;
}
