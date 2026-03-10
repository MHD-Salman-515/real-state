import type { MarketRecoveryFiltersState } from "./types";

type Props = {
  filters: MarketRecoveryFiltersState;
  cities: string[];
  districts: string[];
  onChange: (next: Partial<MarketRecoveryFiltersState>) => void;
  onReset: () => void;
};

const fieldClass =
  "h-10 rounded-xl border border-white/10 bg-black/30 px-3 text-sm text-white outline-none placeholder:text-white/40 focus:border-white/20";

export default function MarketRecoveryFilters({ filters, cities, districts, onChange, onReset }: Props) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <input
          className={fieldClass}
          placeholder="Search district/source..."
          value={filters.query}
          onChange={(e) => onChange({ query: e.target.value })}
        />

        <select className={fieldClass} value={filters.city} onChange={(e) => onChange({ city: e.target.value, district: "" })}>
          <option value="">All Cities</option>
          {cities.map((city) => (
            <option key={city} value={city}>{city}</option>
          ))}
        </select>

        <select className={fieldClass} value={filters.district} onChange={(e) => onChange({ district: e.target.value })}>
          <option value="">All Districts</option>
          {districts.map((district) => (
            <option key={district} value={district}>{district}</option>
          ))}
        </select>

        <select className={fieldClass} value={filters.propertyType} onChange={(e) => onChange({ propertyType: e.target.value as any })}>
          <option value="">All Property Types</option>
          <option value="Apartment">Apartment</option>
          <option value="Villa">Villa</option>
          <option value="Office">Office</option>
          <option value="Shop">Shop</option>
        </select>

        <select className={fieldClass} value={filters.listingType} onChange={(e) => onChange({ listingType: e.target.value as any })}>
          <option value="">All Listing Types</option>
          <option value="Sale">Sale</option>
          <option value="Rent">Rent</option>
        </select>

        <select className={fieldClass} value={filters.status} onChange={(e) => onChange({ status: e.target.value as any })}>
          <option value="">All Volatility Status</option>
          <option value="Stable">Stable</option>
          <option value="Unstable">Unstable</option>
          <option value="Dropping">Dropping</option>
          <option value="Recovering">Recovering</option>
        </select>

        <input className={fieldClass} type="date" value={filters.startDate} onChange={(e) => onChange({ startDate: e.target.value })} />
        <input className={fieldClass} type="date" value={filters.endDate} onChange={(e) => onChange({ endDate: e.target.value })} />
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10" type="button" onClick={onReset}>
          Reset Filters
        </button>
        <button className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10" type="button">
          Export (Placeholder)
        </button>
        <button className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10" type="button">
          Refresh Market (Placeholder)
        </button>
      </div>
    </section>
  );
}
