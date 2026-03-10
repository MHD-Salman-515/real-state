import type { DistrictPerformanceRow } from "@/utils/intelligenceAnalytics";

type Props = {
  rows: DistrictPerformanceRow[];
  loading?: boolean;
};

function badgeClass(level: string) {
  const v = String(level).toLowerCase();
  if (v.includes("high")) return "border-red-400/30 bg-red-500/15 text-red-200";
  if (v.includes("medium")) return "border-amber-400/30 bg-amber-500/15 text-amber-200";
  return "border-white/15 bg-white/10 text-white/80";
}

export default function DistrictPerformanceTable({ rows, loading = false }: Props) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="mb-3">
        <h2 className="text-sm font-semibold text-white">District Performance</h2>
        <p className="text-xs text-white/55">Accuracy distribution by district confidence and volatility.</p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-black/40 text-white/65">
            <tr>
              <th className="px-3 py-2 font-medium">District</th>
              <th className="px-3 py-2 font-medium">Predictions</th>
              <th className="px-3 py-2 font-medium">Average Error</th>
              <th className="px-3 py-2 font-medium">Confidence</th>
              <th className="px-3 py-2 font-medium">Volatility</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 6 }).map((_, idx) => (
                <tr key={idx} className="border-t border-white/10">
                  <td className="px-3 py-2" colSpan={5}>
                    <div className="h-4 w-full animate-pulse rounded bg-white/10" />
                  </td>
                </tr>
              ))
            ) : rows.length ? (
              rows.map((row) => (
                <tr key={`${row.district}-${row.predictions}`} className="border-t border-white/10 text-white/85">
                  <td className="px-3 py-2">{row.district}</td>
                  <td className="px-3 py-2">{row.predictions.toLocaleString()}</td>
                  <td className="px-3 py-2">±{row.averageError.toFixed(1)}%</td>
                  <td className="px-3 py-2">
                    <span className={`rounded-full border px-2 py-0.5 text-xs ${badgeClass(row.confidenceLevel)}`}>
                      {row.confidenceLevel} Confidence
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <span className={`rounded-full border px-2 py-0.5 text-xs ${badgeClass(row.marketVolatility)}`}>
                      {row.marketVolatility} Volatility
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-white/55">
                  No district analytics available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
