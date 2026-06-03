import type { MarketRecoveryRecord } from "./types";
import { useTranslation } from "react-i18next";

type Props = {
  records: MarketRecoveryRecord[];
  onView: (record: MarketRecoveryRecord) => void;
  onEdit: (record: MarketRecoveryRecord) => void;
  onDelete: (record: MarketRecoveryRecord) => void;
};

function statusClass(status: MarketRecoveryRecord["status"]) {
  if (status === "Stable") return "border-emerald-400/30 bg-emerald-500/15 text-emerald-200";
  if (status === "Unstable") return "border-amber-400/30 bg-amber-500/15 text-amber-200";
  if (status === "Dropping") return "border-red-400/30 bg-red-500/15 text-red-200";
  return "border-sky-400/30 bg-sky-500/15 text-sky-200";
}

export default function MarketRecoveryTable({ records, onView, onEdit, onDelete }: Props) {
  const { t } = useTranslation();
  if (!records.length) {
    return (
      <section className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center">
        <h3 className="text-lg font-semibold text-white">{t("No market records found")}</h3>
        <p className="mt-2 text-sm text-white/60">{t("Try changing filters or add a fresh market recovery entry.")}</p>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
      <div className="overflow-x-auto">
        <table className="min-w-[1280px] w-full text-sm text-white/90">
          <thead className="bg-black/40 text-xs uppercase tracking-[0.12em] text-white/55">
            <tr>
              <th className="px-3 py-3 text-left">{t("City")}</th>
              <th className="px-3 py-3 text-left">{t("District")}</th>
              <th className="px-3 py-3 text-left">{t("Property Type")}</th>
              <th className="px-3 py-3 text-left">{t("Listing Type")}</th>
              <th className="px-3 py-3 text-left">{t("Area")}</th>
              <th className="px-3 py-3 text-left">{t("Price")}</th>
              <th className="px-3 py-3 text-left">{t("Price/m²")}</th>
              <th className="px-3 py-3 text-left">{t("Source")}</th>
              <th className="px-3 py-3 text-left">{t("Status")}</th>
              <th className="px-3 py-3 text-left">{t("Date Added")}</th>
              <th className="px-3 py-3 text-left">{t("Actions")}</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record) => (
              <tr key={record.id} className="border-t border-white/10 hover:bg-white/5">
                <td className="px-3 py-3">{record.city}</td>
                <td className="px-3 py-3">{record.district}</td>
                <td className="px-3 py-3">{record.propertyType}</td>
                <td className="px-3 py-3">{record.listingType}</td>
                <td className="px-3 py-3">{record.area} m²</td>
                <td className="px-3 py-3">{record.price.toLocaleString()} SYP</td>
                <td className="px-3 py-3">{Math.round(record.pricePerSqm).toLocaleString()} SYP</td>
                <td className="px-3 py-3">{record.source}</td>
                <td className="px-3 py-3">
                  <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs ${statusClass(record.status)}`}>
                    {t(record.status)}
                  </span>
                </td>
                <td className="px-3 py-3">{record.dateAdded}</td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => onView(record)} className="rounded-lg border border-white/10 px-2 py-1 text-xs hover:bg-white/10" type="button">{t("View")}</button>
                    <button onClick={() => onEdit(record)} className="rounded-lg border border-white/10 px-2 py-1 text-xs hover:bg-white/10" type="button">{t("Edit")}</button>
                    <button onClick={() => onDelete(record)} className="rounded-lg border border-red-400/30 px-2 py-1 text-xs text-red-200 hover:bg-red-500/15" type="button">{t("Delete")}</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
