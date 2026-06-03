import type { MarketSnapshot } from "@/services/adminMarketSnapshots.api";
import { useTranslation } from "react-i18next";

type Props = {
  snapshots: MarketSnapshot[];
  loading: boolean;
  onSelect: (snapshot: MarketSnapshot) => void;
};

export default function SnapshotTable({ snapshots, loading, onSelect }: Props) {
  const { t } = useTranslation();
  return (
    <div className="overflow-x-auto rounded-xl border border-white/10">
      <table className="min-w-[1050px] w-full text-sm text-white/90">
        <thead className="bg-black/40 text-xs uppercase tracking-[0.12em] text-white/55">
          <tr>
            <th className="px-3 py-2 text-left">{t("Date")}</th>
            <th className="px-3 py-2 text-left">{t("City")}</th>
            <th className="px-3 py-2 text-left">{t("District")}</th>
            <th className="px-3 py-2 text-left">{t("Property Type")}</th>
            <th className="px-3 py-2 text-left">{t("Listing Type")}</th>
            <th className="px-3 py-2 text-left">{t("Avg Price")}</th>
            <th className="px-3 py-2 text-left">{t("Avg Price/m²")}</th>
            <th className="px-3 py-2 text-left">{t("Listings")}</th>
            <th className="px-3 py-2 text-left">{t("Volatility")}</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={9} className="px-3 py-6 text-center text-white/60">{t("Loading snapshots...")}</td></tr>
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
            <tr><td colSpan={9} className="px-3 py-6 text-center text-white/60">{t("No snapshots available.")}</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
