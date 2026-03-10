import { useState } from "react";

type SubmitPayload = {
  city: string;
  district: string;
  propertyType: string;
  area: number;
  bedrooms?: number;
  bathrooms?: number;
};

type Props = {
  loading: boolean;
  onSubmit: (payload: SubmitPayload) => void;
};

export default function PriceRecommendationForm({ loading, onSubmit }: Props) {
  const [city, setCity] = useState("Damascus");
  const [district, setDistrict] = useState("");
  const [propertyType, setPropertyType] = useState("Apartment");
  const [area, setArea] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");

  const submit = () => {
    if (!city.trim() || !district.trim() || !Number(area)) return;
    onSubmit({
      city: city.trim(),
      district: district.trim(),
      propertyType,
      area: Number(area),
      bedrooms: bedrooms ? Number(bedrooms) : undefined,
      bathrooms: bathrooms ? Number(bathrooms) : undefined,
    });
  };

  const inputClass = "h-10 rounded-xl border border-white/10 bg-black/30 px-3 text-sm text-white";

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <h3 className="text-sm font-semibold text-white">Price Recommendation Request</h3>
      <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        <input className={inputClass} value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" />
        <input className={inputClass} value={district} onChange={(e) => setDistrict(e.target.value)} placeholder="District" />
        <select className={inputClass} value={propertyType} onChange={(e) => setPropertyType(e.target.value)}>
          <option value="Apartment">Apartment</option>
          <option value="Villa">Villa</option>
          <option value="Office">Office</option>
          <option value="Shop">Shop</option>
        </select>
        <input className={inputClass} value={area} onChange={(e) => setArea(e.target.value)} placeholder="Area m²" type="number" />
        <input className={inputClass} value={bedrooms} onChange={(e) => setBedrooms(e.target.value)} placeholder="Bedrooms (optional)" type="number" />
        <input className={inputClass} value={bathrooms} onChange={(e) => setBathrooms(e.target.value)} placeholder="Bathrooms (optional)" type="number" />
      </div>
      <div className="mt-3 flex justify-end">
        <button
          type="button"
          onClick={submit}
          disabled={loading}
          className="rounded-xl border border-white/20 bg-white px-4 py-2 text-sm font-semibold text-black disabled:opacity-50"
        >
          {loading ? "Calculating..." : "Get Recommendation"}
        </button>
      </div>
    </section>
  );
}
