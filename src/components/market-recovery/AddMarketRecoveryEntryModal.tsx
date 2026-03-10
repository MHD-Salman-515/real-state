import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import type { MarketRecoveryFormValues, MarketRecoveryRecord, VolatilityStatus } from "./types";

type Props = {
  open: boolean;
  mode: "create" | "edit";
  initial?: MarketRecoveryRecord | null;
  onClose: () => void;
  onSubmit: (record: MarketRecoveryRecord, mode: "create" | "edit") => void;
};

const statuses: VolatilityStatus[] = ["Stable", "Unstable", "Dropping", "Recovering"];

function toForm(record?: MarketRecoveryRecord | null): MarketRecoveryFormValues {
  if (!record) {
    return {
      city: "Damascus",
      district: "",
      propertyType: "Apartment",
      listingType: "Sale",
      area: "",
      price: "",
      rooms: "",
      bathrooms: "",
      floor: "",
      furnished: false,
      source: "",
      status: "Unstable",
      entryDate: new Date().toISOString().slice(0, 10),
      notes: "",
    };
  }

  return {
    city: record.city,
    district: record.district,
    propertyType: record.propertyType,
    listingType: record.listingType,
    area: String(record.area),
    price: String(record.price),
    rooms: String(record.rooms),
    bathrooms: String(record.bathrooms),
    floor: String(record.floor),
    furnished: record.furnished,
    source: record.source,
    status: record.status,
    entryDate: record.dateAdded,
    notes: record.notes,
  };
}

const fieldClass =
  "h-10 rounded-xl border border-white/10 bg-black/35 px-3 text-sm text-white outline-none placeholder:text-white/40 focus:border-white/25";

export default function AddMarketRecoveryEntryModal({ open, mode, initial, onClose, onSubmit }: Props) {
  const [form, setForm] = useState<MarketRecoveryFormValues>(() => toForm(initial));
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    setForm(toForm(initial));
    setErrors({});
  }, [open, initial]);

  const pricePerSqm = useMemo(() => {
    const area = Number(form.area);
    const price = Number(form.price);
    if (!area || !price) return 0;
    return Math.round(price / area);
  }, [form.area, form.price]);

  if (!open) return null;

  const validate = (): boolean => {
    const next: Record<string, string> = {};

    if (!form.city.trim()) next.city = "City is required";
    if (!form.district.trim()) next.district = "District is required";
    if (!Number(form.area) || Number(form.area) <= 0) next.area = "Area must be greater than 0";
    if (!Number(form.price) || Number(form.price) <= 0) next.price = "Price must be greater than 0";
    if (!form.source.trim()) next.source = "Source is required";
    if (!form.entryDate) next.entryDate = "Entry date is required";

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = () => {
    if (!validate()) return;

    const payload: MarketRecoveryRecord = {
      id: initial?.id || `mr-${Math.random().toString(36).slice(2, 10)}`,
      city: form.city.trim(),
      district: form.district.trim(),
      propertyType: form.propertyType,
      listingType: form.listingType,
      area: Number(form.area),
      price: Number(form.price),
      pricePerSqm,
      rooms: Number(form.rooms || 0),
      bathrooms: Number(form.bathrooms || 0),
      floor: Number(form.floor || 0),
      furnished: form.furnished,
      source: form.source.trim(),
      status: form.status,
      notes: form.notes.trim(),
      dateAdded: form.entryDate,
    };

    onSubmit(payload, mode);
    onClose();
  };

  const set = (key: keyof MarketRecoveryFormValues, value: any) => setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 p-4">
      <div className="max-h-[92vh] w-full max-w-4xl overflow-auto rounded-2xl border border-white/10 bg-[#0a0f1a] p-5 shadow-2xl">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-white">{mode === "create" ? "Add New Market Data" : "Edit Market Data"}</h3>
            <p className="mt-1 text-xs text-white/55">
              Use this section to inject fresh market data and recover system intelligence after major market movement.
            </p>
          </div>
          <button onClick={onClose} className="rounded-lg border border-white/10 p-2 text-white/70 hover:bg-white/10" type="button">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <input className={fieldClass} placeholder="City" value={form.city} onChange={(e) => set("city", e.target.value)} />
            {errors.city ? <p className="mt-1 text-xs text-red-300">{errors.city}</p> : null}
          </div>
          <div>
            <input className={fieldClass} placeholder="District" value={form.district} onChange={(e) => set("district", e.target.value)} />
            {errors.district ? <p className="mt-1 text-xs text-red-300">{errors.district}</p> : null}
          </div>

          <select className={fieldClass} value={form.propertyType} onChange={(e) => set("propertyType", e.target.value)}>
            <option value="Apartment">Apartment</option>
            <option value="Villa">Villa</option>
            <option value="Office">Office</option>
            <option value="Shop">Shop</option>
          </select>
          <select className={fieldClass} value={form.listingType} onChange={(e) => set("listingType", e.target.value)}>
            <option value="Sale">Sale</option>
            <option value="Rent">Rent</option>
          </select>

          <div>
            <input className={fieldClass} type="number" placeholder="Area m²" value={form.area} onChange={(e) => set("area", e.target.value)} />
            {errors.area ? <p className="mt-1 text-xs text-red-300">{errors.area}</p> : null}
          </div>
          <div>
            <input className={fieldClass} type="number" placeholder="Price" value={form.price} onChange={(e) => set("price", e.target.value)} />
            {errors.price ? <p className="mt-1 text-xs text-red-300">{errors.price}</p> : null}
          </div>

          <input className={fieldClass} type="number" placeholder="Rooms" value={form.rooms} onChange={(e) => set("rooms", e.target.value)} />
          <input className={fieldClass} type="number" placeholder="Bathrooms" value={form.bathrooms} onChange={(e) => set("bathrooms", e.target.value)} />

          <input className={fieldClass} type="number" placeholder="Floor" value={form.floor} onChange={(e) => set("floor", e.target.value)} />
          <input className={fieldClass} placeholder="Source" value={form.source} onChange={(e) => set("source", e.target.value)} />

          <select className={fieldClass} value={form.status} onChange={(e) => set("status", e.target.value)}>
            {statuses.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <input className={fieldClass} type="date" value={form.entryDate} onChange={(e) => set("entryDate", e.target.value)} />

          <label className="col-span-full flex items-center gap-2 text-sm text-white/80">
            <input type="checkbox" checked={form.furnished} onChange={(e) => set("furnished", e.target.checked)} />
            Furnished
          </label>

          <textarea
            className="col-span-full min-h-[90px] rounded-xl border border-white/10 bg-black/35 px-3 py-2 text-sm text-white outline-none placeholder:text-white/40 focus:border-white/25"
            placeholder="Notes"
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
          />

          <div className="col-span-full rounded-xl border border-white/10 bg-black/25 px-3 py-2 text-sm text-white/70">
            Auto Price per m²: <span className="font-semibold text-white">{pricePerSqm ? `${pricePerSqm.toLocaleString()} SYP` : "-"}</span>
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-xl border border-white/10 px-4 py-2 text-sm text-white/80 hover:bg-white/10" type="button">
            Cancel
          </button>
          <button onClick={submit} className="rounded-xl border border-white/20 bg-white px-4 py-2 text-sm font-semibold text-black" type="button">
            {mode === "create" ? "Save Entry" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
