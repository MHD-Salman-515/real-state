import type { MarketSnapshot } from "@/services/adminMarketSnapshots.api";

type Props = {
  snapshots: MarketSnapshot[];
  loading: boolean;
  onSelect: (snapshot: MarketSnapshot) => void;
};

export default function SnapshotTable({ snapshots, loading, onSelect }: Props) {
  return (
    <div className="overflow-x-auto rounded-xl border border-white/10">
      <table className="min-w-[1050px] w-full text-sm text-white/90">
        <thead className="bg-black/40 text-xs uppercase tracking-[0.12em] text-white/55">
          <tr>
            <th className="px-3 py-2 text-left">Date</th>
            <th className="px-3 py-2 text-left">City</th>
            <th className="px-3 py-2 text-left">District</th>
            <th className="px-3 py-2 text-left">Property Type</th>
            <th className="px-3 py-2 text-left">Listing Type</th>
            <th className="px-3 py-2 text-left">Avg Price</th>
            <th className="px-3 py-2 text-left">Avg Price/m²</th>
            <th className="px-3 py-2 text-left">Listings</th>
            <th className="px-3 py-2 text-left">Volatility</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={9} className="px-3 py-6 text-center text-white/60">Loading snapshots...</td></tr>
          ) : snapshots.length ? (
            snapshots.map((s) => (
              <tr key={String(s.id)} className="cursor-pointer border-t border-white/10 hover:bg-white/5" onClick={() => onSelect(s)}>
                <td className="px-3 py-2">{String(s.date || "-")}</td>
                <td className="px-3 py-2">{String(s.city || "-")}</td>
                <td className="px-3 py-2">{String(s.district || "-")}</td>
                <td className="px-3 py-2">{String(s.propertyType || "-")}</td>
                <td className="px-3 py-2">{String(s.listingType || "-")}</td>
                <td className="px-3 py-2">{Number(s.avgPrice || 0).toLocaleString()} SYP</td>
                <td className="px-3 py-2">{Number(s.avgPricePerSqm || 0).toLocaleString()} SYP</td>
                <td className="px-3 py-2">{Number(s.listingCount || 0).toLocaleString()}</td>
                <td className="px-3 py-2">{String(s.volatility || "-")}</td>
              </tr>
            ))
          ) : (
            <tr><td colSpan={9} className="px-3 py-6 text-center text-white/60">No snapshots available.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
