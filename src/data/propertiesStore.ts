import propertiesSeed from '@/data/properties.seed.json';

export type PropertyRecord = {
  id: string;
  title: string;
  description_ar: string;
  city: string;
  district: string;
  type: 'apartment' | 'villa' | 'studio' | 'office' | 'shop' | 'land';
  area_m2: number;
  bedrooms: number;
  bathrooms: number;
  floor: number;
  furnished: boolean;
  parking: boolean;
  elevator: boolean;
  price_syp: number;
  price_label: string;
  images: string[];
  createdAt: string;
};

export type SearchFilters = {
  city?: string;
  district?: string;
  type?: string;
  minPrice?: number;
  maxPrice?: number;
  bedroomsMin?: number;
  furnished?: boolean;
  parking?: boolean;
  elevator?: boolean;
  sort?: 'newest' | 'price_asc' | 'price_desc' | 'area_desc';
  q?: string;
  page?: number;
  pageSize?: number;
};

const DATASET: PropertyRecord[] = (propertiesSeed as PropertyRecord[])
  .slice()
  .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));

function paginate<T>(items: T[], page = 1, pageSize = 30) {
  const safePage = Math.max(1, page);
  const safePageSize = Math.max(1, pageSize);
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / safePageSize));
  const start = (safePage - 1) * safePageSize;
  return {
    total,
    page: safePage,
    pageSize: safePageSize,
    totalPages,
    items: items.slice(start, start + safePageSize),
  };
}

function toLowerSafe(value: unknown): string {
  return String(value || '').toLowerCase().trim();
}

export function getAllProperties({ page = 1, pageSize = 30 } = {}) {
  return paginate(DATASET, page, pageSize);
}

export function getPropertyById(id: string) {
  const key = String(id || '');
  return DATASET.find((row) => String(row.id) === key) || null;
}

export function searchProperties(filters: SearchFilters = {}) {
  const {
    city,
    district,
    type,
    minPrice,
    maxPrice,
    bedroomsMin,
    furnished,
    parking,
    elevator,
    sort = 'newest',
    q,
    page = 1,
    pageSize = 30,
  } = filters;

  const cityKey = toLowerSafe(city);
  const districtKey = toLowerSafe(district);
  const typeKey = toLowerSafe(type);
  const queryKey = toLowerSafe(q);

  const filtered = DATASET.filter((row) => {
    if (cityKey && toLowerSafe(row.city) !== cityKey) return false;
    if (districtKey && !toLowerSafe(row.district).includes(districtKey)) return false;
    if (typeKey && toLowerSafe(row.type) !== typeKey) return false;

    const price = Number(row.price_syp || 0);
    if (Number.isFinite(minPrice) && price < Number(minPrice)) return false;
    if (Number.isFinite(maxPrice) && price > Number(maxPrice)) return false;
    if (Number.isFinite(bedroomsMin) && Number(row.bedrooms || 0) < Number(bedroomsMin)) return false;
    if (typeof furnished === 'boolean' && row.furnished !== furnished) return false;
    if (typeof parking === 'boolean' && row.parking !== parking) return false;
    if (typeof elevator === 'boolean' && row.elevator !== elevator) return false;

    if (queryKey) {
      const haystack = `${row.title} ${row.description_ar} ${row.city} ${row.district} ${row.type}`.toLowerCase();
      if (!haystack.includes(queryKey)) return false;
    }

    return true;
  });

  const sorted = filtered.slice().sort((a, b) => {
    if (sort === 'price_asc') return Number(a.price_syp || 0) - Number(b.price_syp || 0);
    if (sort === 'price_desc') return Number(b.price_syp || 0) - Number(a.price_syp || 0);
    if (sort === 'area_desc') return Number(b.area_m2 || 0) - Number(a.area_m2 || 0);
    return +new Date(b.createdAt) - +new Date(a.createdAt);
  });

  return paginate(sorted, page, pageSize);
}

export function getLocalCities() {
  return Array.from(new Set(DATASET.map((item) => item.city))).sort((a, b) => a.localeCompare(b));
}

export function getLocalDistricts(city?: string) {
  const cityKey = toLowerSafe(city);
  return Array.from(
    new Set(
      DATASET
        .filter((item) => (cityKey ? toLowerSafe(item.city) === cityKey : true))
        .map((item) => item.district),
    ),
  ).sort((a, b) => a.localeCompare(b));
}
