import api from "@/api/axios";

export type AdminPropertyOwner = {
  id?: number | string;
  fullName?: string;
  name?: string;
  email?: string;
};

export type AdminPropertyRecord = {
  id: number | string;
  ownerId?: number | string | null;
  owner?: AdminPropertyOwner | null;
  title?: string | null;
  description?: string | null;
  address?: string | null;
  city?: string | null;
  type?: string | null;
  price?: number | string | null;
  area?: number | string | null;
  image?: string | null;
  createdAt?: string | null;
};

export type AdminPropertyFormInput = {
  ownerId?: string;
  title: string;
  description: string;
  address: string;
  city: string;
  type: string;
  price: string;
  area: string;
  imageFile?: File | null;
};

export type AdminPropertyListResult = {
  items: AdminPropertyRecord[];
  page: number;
  limit: number;
  total: number | null;
  totalPages: number | null;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : null;
}

function asArray(value: unknown): AdminPropertyRecord[] {
  if (Array.isArray(value)) return value as AdminPropertyRecord[];
  const record = asRecord(value);
  if (!record) return [];

  const directCandidates = ["items", "data", "results", "rows", "properties"];
  for (const key of directCandidates) {
    const candidate = record[key];
    if (Array.isArray(candidate)) return candidate as AdminPropertyRecord[];
  }

  const nestedData = asRecord(record.data);
  if (nestedData) {
    for (const key of directCandidates) {
      const candidate = nestedData[key];
      if (Array.isArray(candidate)) return candidate as AdminPropertyRecord[];
    }
  }

  return [];
}

function getNumber(record: Record<string, unknown> | null, keys: string[]): number | null {
  if (!record) return null;
  for (const key of keys) {
    const value = record[key];
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function parseListResult(payload: unknown, page: number, limit: number): AdminPropertyListResult {
  const root = asRecord(payload);
  const meta = asRecord(root?.meta) || asRecord(root?.pagination) || asRecord(asRecord(root?.data)?.meta);
  const items = asArray(payload);
  const total = getNumber(root, ["total", "count"]) ?? getNumber(meta, ["total", "count"]);
  const currentPage = getNumber(root, ["page", "currentPage"]) ?? getNumber(meta, ["page", "currentPage"]) ?? page;
  const totalPages = getNumber(root, ["totalPages", "pageCount"]) ?? getNumber(meta, ["totalPages", "pageCount"]);
  const resolvedLimit = getNumber(root, ["limit", "pageSize"]) ?? getNumber(meta, ["limit", "pageSize"]) ?? limit;

  return {
    items,
    page: currentPage,
    limit: resolvedLimit,
    total,
    totalPages,
  };
}

function buildPropertyFormData(input: AdminPropertyFormInput): FormData {
  const form = new FormData();

  if (String(input.ownerId || "").trim()) form.append("ownerId", String(input.ownerId).trim());
  form.append("title", String(input.title || "").trim());
  form.append("description", String(input.description || "").trim());
  form.append("address", String(input.address || "").trim());
  form.append("city", String(input.city || "").trim());
  form.append("type", String(input.type || "").trim());
  if (String(input.price || "").trim()) form.append("price", String(input.price).trim());
  if (String(input.area || "").trim()) form.append("area", String(input.area).trim());
  if (input.imageFile instanceof File) form.append("image", input.imageFile);

  return form;
}

export async function listAdminProperties(page = 1, limit = 50): Promise<AdminPropertyListResult> {
  const res = await api.get("/admin/properties", {
    params: { page, limit },
  });

  return parseListResult(res.data, page, limit);
}

export async function createAdminProperty(input: AdminPropertyFormInput): Promise<AdminPropertyRecord> {
  const res = await api.post("/admin/properties", buildPropertyFormData(input));
  const payload = asRecord(res.data);
  return (payload?.data as AdminPropertyRecord) || (res.data as AdminPropertyRecord);
}

export async function updateAdminProperty(
  id: number | string,
  input: AdminPropertyFormInput,
): Promise<AdminPropertyRecord> {
  const res = await api.put(`/admin/properties/${id}`, buildPropertyFormData(input));
  const payload = asRecord(res.data);
  return (payload?.data as AdminPropertyRecord) || (res.data as AdminPropertyRecord);
}

export async function deleteAdminProperty(id: number | string): Promise<void> {
  await api.delete(`/admin/properties/${id}`);
}
