import type { PropertyBaseInput } from "@/components/owner-decision-simulator/types";

type Props = {
  value: PropertyBaseInput;
  onChange: (patch: Partial<PropertyBaseInput>) => void;
};

const inputClass = "h-10 rounded-xl border border-white/10 bg-black/30 px-3 text-sm text-white";

export default function PropertyInputCard({ value, onChange }: Props) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <h3 className="text-sm font-semibold text-white">Base Property Input</h3>
      <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <input className={inputClass} value={value.city} onChange={(e) => onChange({ city: e.target.value })} placeholder="City" />
        <input className={inputClass} value={value.district} onChange={(e) => onChange({ district: e.target.value })} placeholder="District" />
        <select className={inputClass} value={value.propertyType} onChange={(e) => onChange({ propertyType: e.target.value })}>
          <option value="Apartment">Apartment</option>
          <option value="Villa">Villa</option>
          <option value="Office">Office</option>
          <option value="Shop">Shop</option>
        </select>
        <input className={inputClass} type="number" value={value.area} onChange={(e) => onChange({ area: Number(e.target.value) })} placeholder="Area (m²)" />
        <input className={inputClass} type="number" value={value.bedrooms ?? ""} onChange={(e) => onChange({ bedrooms: Number(e.target.value || 0) || undefined })} placeholder="Bedrooms (optional)" />
        <input className={inputClass} type="number" value={value.bathrooms ?? ""} onChange={(e) => onChange({ bathrooms: Number(e.target.value || 0) || undefined })} placeholder="Bathrooms (optional)" />
        <input className={inputClass} type="number" value={value.askingPrice} onChange={(e) => onChange({ askingPrice: Number(e.target.value) })} placeholder="Current asking price" />
      </div>
    </section>
  );
}
