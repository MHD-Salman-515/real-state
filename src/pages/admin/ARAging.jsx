// src/pages/admin/ARAging.jsx
import { useEffect, useMemo, useState } from "react";
import PageHeader from "../../components/PageHeader.jsx";
import Card from "../../components/Card.jsx";
import api from "../../api/axios";

function getBucketLabel(key) {
  switch (key) {
    case "0_30":
      return "0-30 days";
    case "31_60":
      return "31-60 days";
    case "61_90":
      return "61-90 days";
    case "90_plus":
      return "90+ days";
    default:
      return key;
  }
}

export default function ARAging() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadInvoices = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/invoices");
      const data = Array.isArray(res.data) ? res.data : [];
      const pending = data.filter((inv) => inv.status !== "PAID");
      setInvoices(pending);
    } catch (err) {
      console.error(err);
      setError("Failed to load aging data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvoices();
  }, []);

  const buckets = useMemo(() => {
    const today = new Date();
    const result = {
      "0_30": { count: 0, amount: 0 },
      "31_60": { count: 0, amount: 0 },
      "61_90": { count: 0, amount: 0 },
      "90_plus": { count: 0, amount: 0 },
    };

    for (const inv of invoices) {
      const amount = Number(inv.totalAmount || 0);
      const baseDate = inv.dueDate ? new Date(inv.dueDate) : new Date(inv.issueDate);
      const diffDays = Math.floor((today.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24));

      let key;
      if (diffDays <= 30) key = "0_30";
      else if (diffDays <= 60) key = "31_60";
      else if (diffDays <= 90) key = "61_90";
      else key = "90_plus";

      result[key].count += 1;
      result[key].amount += amount;
    }

    return result;
  }, [invoices]);

  const bucketRows = useMemo(
    () =>
      Object.entries(buckets).map(([key, info]) => ({
        bucket: key,
        label: getBucketLabel(key),
        count: info.count,
        amount: info.amount,
      })),
    [buckets]
  );

  const totalAmount = bucketRows.reduce((sum, b) => sum + b.amount, 0);

  const formatMoney = (value) =>
    value.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }) + "$";

  return (
    <section className="space-y-4">
      <PageHeader
        title="A/R Aging"
        subtitle="Track overdue receivables by aging buckets."
      />

      {loading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
              <div className="h-3 w-20 animate-pulse rounded bg-white/10" />
              <div className="mt-3 h-7 w-28 animate-pulse rounded bg-white/10" />
              <div className="mt-2 h-3 w-16 animate-pulse rounded bg-white/10" />
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {bucketRows.map((row) => (
            <Card
              key={row.bucket}
              className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl transition duration-200 hover:border-white/15 hover:bg-white/10"
            >
              <p className="text-xs text-slate-300">{row.label}</p>
              <p className="mt-2 text-2xl font-semibold text-white/90">{formatMoney(row.amount)}</p>
              <p className="mt-1 text-xs text-slate-400">{row.count} invoices</p>
            </Card>
          ))}

          <Card className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-xl transition duration-200 hover:border-white/15">
            <p className="text-xs text-white/80">Total Overdue</p>
            <p className="mt-2 text-2xl font-semibold text-white/80">
              {totalAmount.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{" "}
              $
            </p>
            <p className="mt-1 text-xs text-white/80">Across all aging buckets</p>
          </Card>
        </div>
      )}

      <Card className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl">
        <div className="border-b border-white/10 px-4 py-3 md:px-5">
          <h2 className="text-sm font-semibold text-white md:text-base">Aging Summary</h2>
          <p className="mt-1 text-xs text-slate-300 md:text-sm">Outstanding receivables grouped by overdue period.</p>
        </div>

        {error ? (
          <div className="p-4">
            <div className="rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</div>
          </div>
        ) : loading ? (
          <div className="p-4">
            <div className="space-y-2 animate-pulse">
              <div className="h-10 rounded-xl bg-white/10" />
              <div className="h-10 rounded-xl bg-white/10" />
              <div className="h-10 rounded-xl bg-white/10" />
              <div className="h-10 rounded-xl bg-white/10" />
            </div>
          </div>
        ) : invoices.length === 0 ? (
          <div className="p-8 text-center">
            <h3 className="text-lg font-semibold text-white">No overdue invoices</h3>
            <p className="mt-2 text-sm text-slate-300">All invoices are paid or there is no receivable data yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[900px] text-sm leading-5 text-slate-100">
              <thead className="sticky top-0 z-10 bg-black/40 backdrop-blur-xl">
                <tr className="border-b border-white/10">
                  <th className="px-4 py-3 align-middle text-left text-[11px] font-semibold uppercase tracking-wide text-slate-300">Bucket</th>
                  <th className="whitespace-nowrap px-4 py-3 align-middle text-left text-[11px] font-semibold uppercase tracking-wide text-slate-300">Count</th>
                  <th className="whitespace-nowrap px-4 py-3 align-middle text-left text-[11px] font-semibold uppercase tracking-wide text-slate-300">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {bucketRows.map((row) => (
                  <tr key={row.bucket} className="transition-colors even:bg-white/[0.02] hover:bg-white/5">
                    <td className="px-4 py-3 align-middle">{row.label}</td>
                    <td className="whitespace-nowrap px-4 py-3 align-middle tabular-nums">{row.count}</td>
                    <td className="whitespace-nowrap px-4 py-3 align-middle font-semibold text-white/80">{formatMoney(row.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </section>
  );
}
