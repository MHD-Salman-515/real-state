import type { MarketRecoveryRecord } from "./types";

type Props = {
  records: MarketRecoveryRecord[];
};

export default function MarketRecoveryInsights({ records }: Props) {
  const byDistrict = new Map<string, MarketRecoveryRecord[]>();
  records.forEach((r) => {
    const key = `${r.city} / ${r.district}`;
    if (!byDistrict.has(key)) byDistrict.set(key, []);
    byDistrict.get(key)?.push(r);
  });

  const districtAverages = [...byDistrict.entries()].map(([district, list]) => ({
    district,
    avg: list.reduce((acc, item) => acc + item.pricePerSqm, 0) / list.length,
    unstable: list.filter((i) => i.status === "Dropping" || i.status === "Unstable").length,
    recovering: list.filter((i) => i.status === "Recovering").length,
  }));

  const mostAffected = districtAverages.sort((a, b) => b.unstable - a.unstable)[0];
  const bestRecovery = districtAverages.sort((a, b) => b.recovering - a.recovering)[0];
  const lowestAvg = districtAverages.sort((a, b) => a.avg - b.avg)[0];
  const highestVol = districtAverages.sort((a, b) => b.unstable - a.unstable)[0];

  const rows = [
    { label: "Most affected district", value: mostAffected?.district || "-" },
    { label: "Best recovery zone", value: bestRecovery?.district || "-" },
    { label: "Lowest average price", value: lowestAvg ? `${lowestAvg.district} (${Math.round(lowestAvg.avg).toLocaleString()} SYP/m²)` : "-" },
    { label: "Highest volatility region", value: highestVol?.district || "-" },
    { label: "Recommendation", value: "Add more entries in Mazzeh, Kafr Sousa, and Abu Rummaneh this week." },
  ];

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <h3 className="text-sm font-semibold text-white">Recovery Insights</h3>
      <div className="mt-3 space-y-2">
        {rows.map((row) => (
          <article key={row.label} className="rounded-xl border border-white/10 bg-black/25 p-3">
            <p className="text-xs text-white/50">{row.label}</p>
            <p className="mt-1 text-sm text-white/90">{row.value}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
