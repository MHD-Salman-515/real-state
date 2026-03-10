import type { MarketRecoveryRecord } from "./types";

type Props = {
  records: MarketRecoveryRecord[];
};

function formatPrice(v: number): string {
  return `${Math.round(v).toLocaleString()} SYP`;
}

export default function MarketRecoveryStats({ records }: Props) {
  const total = records.length;
  const latest = [...records].sort((a, b) => +new Date(b.dateAdded) - +new Date(a.dateAdded))[0];
  const affectedZones = new Set(records.filter((r) => r.status !== "Stable").map((r) => `${r.city}-${r.district}`)).size;
  const avgSqm = total ? records.reduce((acc, r) => acc + r.pricePerSqm, 0) / total : 0;
  const recoveringCount = records.filter((r) => r.status === "Recovering").length;
  const recoveryStatus = total ? Math.round((recoveringCount / total) * 100) : 0;

  const cards = [
    { label: "Total Records", value: total.toLocaleString(), hint: "Tracked entries" },
    { label: "Last Update", value: latest?.dateAdded || "-", hint: latest?.district || "No records yet" },
    { label: "Affected Zones", value: affectedZones.toLocaleString(), hint: "Unstable/Dropping" },
    { label: "Average Price / m²", value: formatPrice(avgSqm), hint: "Across filtered records" },
    { label: "Recovery Status", value: `${recoveryStatus}%`, hint: "Recovering entries ratio" },
  ];

  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
      {cards.map((card) => (
        <article
          key={card.label}
          className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-[0_12px_32px_rgba(0,0,0,0.35)]"
        >
          <p className="text-xs uppercase tracking-[0.14em] text-white/55">{card.label}</p>
          <p className="mt-3 text-xl font-semibold text-white">{card.value}</p>
          <p className="mt-1 text-xs text-white/50">{card.hint}</p>
        </article>
      ))}
    </section>
  );
}
