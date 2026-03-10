import { useMemo, useState } from "react";
import { Plus } from "lucide-react";

import MarketRecoveryStats from "@/components/market-recovery/MarketRecoveryStats";
import MarketRecoveryAlerts from "@/components/market-recovery/MarketRecoveryAlerts";
import MarketRecoveryFilters from "@/components/market-recovery/MarketRecoveryFilters";
import MarketRecoveryTable from "@/components/market-recovery/MarketRecoveryTable";
import AddMarketRecoveryEntryModal from "@/components/market-recovery/AddMarketRecoveryEntryModal";
import MarketRecoveryInsights from "@/components/market-recovery/MarketRecoveryInsights";
import MarketRecoveryTrendChart from "@/components/market-recovery/MarketRecoveryTrendChart";
import type { MarketRecoveryFiltersState, MarketRecoveryRecord } from "@/components/market-recovery/types";
import { marketRecoverySeed } from "@/data/market-recovery/mockMarketRecoveryData";

const initialFilters: MarketRecoveryFiltersState = {
  query: "",
  city: "",
  district: "",
  propertyType: "",
  listingType: "",
  status: "",
  startDate: "",
  endDate: "",
};

export default function MarketRecoveryPage() {
  const [records, setRecords] = useState<MarketRecoveryRecord[]>(marketRecoverySeed);
  const [filters, setFilters] = useState<MarketRecoveryFiltersState>(initialFilters);
  const [modalOpen, setModalOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [editing, setEditing] = useState<MarketRecoveryRecord | null>(null);

  const cities = useMemo(() => Array.from(new Set(records.map((r) => r.city))).sort(), [records]);

  const districts = useMemo(() => {
    const scoped = filters.city ? records.filter((r) => r.city === filters.city) : records;
    return Array.from(new Set(scoped.map((r) => r.district))).sort();
  }, [records, filters.city]);

  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      if (filters.query) {
        const text = `${r.city} ${r.district} ${r.source} ${r.notes}`.toLowerCase();
        if (!text.includes(filters.query.toLowerCase())) return false;
      }

      if (filters.city && r.city !== filters.city) return false;
      if (filters.district && r.district !== filters.district) return false;
      if (filters.propertyType && r.propertyType !== filters.propertyType) return false;
      if (filters.listingType && r.listingType !== filters.listingType) return false;
      if (filters.status && r.status !== filters.status) return false;
      if (filters.startDate && r.dateAdded < filters.startDate) return false;
      if (filters.endDate && r.dateAdded > filters.endDate) return false;

      return true;
    });
  }, [records, filters]);

  const droppingCount = filteredRecords.filter((r) => r.status === "Dropping").length;
  const unstableCount = filteredRecords.filter((r) => r.status === "Unstable").length;
  const recoveringCount = filteredRecords.filter((r) => r.status === "Recovering").length;

  const openCreate = () => {
    setMode("create");
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (record: MarketRecoveryRecord) => {
    setMode("edit");
    setEditing(record);
    setModalOpen(true);
  };

  const handleSave = (payload: MarketRecoveryRecord, saveMode: "create" | "edit") => {
    if (saveMode === "create") {
      setRecords((prev) => [payload, ...prev]);
      return;
    }

    setRecords((prev) => prev.map((item) => (item.id === payload.id ? payload : item)));
  };

  const handleDelete = (record: MarketRecoveryRecord) => {
    const ok = window.confirm(`Delete market record for ${record.city} / ${record.district}?`);
    if (!ok) return;
    setRecords((prev) => prev.filter((item) => item.id !== record.id));
  };

  const handleView = (record: MarketRecoveryRecord) => {
    window.alert(
      [
        `${record.city} / ${record.district}`,
        `${record.propertyType} - ${record.listingType}`,
        `Price: ${record.price.toLocaleString()} SYP`,
        `Price/m²: ${Math.round(record.pricePerSqm).toLocaleString()} SYP`,
        `Source: ${record.source}`,
        `Status: ${record.status}`,
      ].join("\n")
    );
  };

  return (
    <div className="space-y-4">
      <header className="rounded-2xl border border-white/10 bg-white/5 p-4 md:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-white">Market Recovery</h1>
            <p className="mt-1 max-w-3xl text-sm text-white/60">
              Manage emergency market updates, add fresh pricing records, and stabilize property intelligence after market changes.
            </p>
          </div>

          <button
            onClick={openCreate}
            type="button"
            className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white px-4 py-2 text-sm font-semibold text-black"
          >
            <Plus className="h-4 w-4" />
            Add New Market Data
          </button>
        </div>
      </header>

      <MarketRecoveryStats records={filteredRecords} />

      <MarketRecoveryAlerts
        droppingCount={droppingCount}
        unstableCount={unstableCount}
        recoveringCount={recoveringCount}
      />

      <MarketRecoveryFilters
        filters={filters}
        cities={cities}
        districts={districts}
        onChange={(next) => setFilters((prev) => ({ ...prev, ...next }))}
        onReset={() => setFilters(initialFilters)}
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <MarketRecoveryTable records={filteredRecords} onView={handleView} onEdit={openEdit} onDelete={handleDelete} />
        <div className="space-y-4">
          <MarketRecoveryInsights records={filteredRecords} />
          <MarketRecoveryTrendChart records={filteredRecords} />
        </div>
      </div>

      <AddMarketRecoveryEntryModal
        open={modalOpen}
        mode={mode}
        initial={editing}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSave}
      />
    </div>
  );
}
