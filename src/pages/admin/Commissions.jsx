import { useEffect, useState } from "react";
import api from "../../api/axios";
import PageHeader from "../../components/PageHeader.jsx";
import Card from "../../components/Card.jsx";
import Toolbar from "../../components/Toolbar.jsx";
import { notifyCrudError, notifyCrudSuccess } from "../../utils/notify.js";

export default function Commissions() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const res = await api.get("/commissions");
      setRows(res.data);
      notifyCrudSuccess("Record refreshed", "Operation successful", {
        href: "/admin/commissions",
      });
    } catch (err) {
      notifyCrudError("Failed to load commission records", "Operation failed", {
        href: "/admin/commissions",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <section className="space-y-4">
      <PageHeader title="Commissions" subtitle="Track invoice-based commission records and updates." />

      <Toolbar className="rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-xl">
        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-400">Review and refresh latest commission entries.</p>
          <button
            onClick={load}
            disabled={loading}
            className={`inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-5 py-2 text-sm font-semibold text-white/90 transition duration-300 hover:bg-white/10 hover:shadow-lg hover:shadow-white/10 ${
              loading ? "cursor-not-allowed opacity-60" : ""
            }`}
          >
            {loading ? (
              <>
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/15 border-t-transparent" />
                Refreshing...
              </>
            ) : (
              "Refresh"
            )}
          </button>
        </div>
      </Toolbar>

      {rows.length === 0 && !loading ? (
        <Card className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-xl">
          <h3 className="text-lg font-semibold text-white">No commissions found</h3>
          <p className="mt-2 text-sm text-slate-300">Refresh after new sales or rent invoices are recorded.</p>
          <button
            onClick={load}
            className="mt-4 inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white/90 transition duration-200 hover:bg-white/10"
          >
            Refresh
          </button>
        </Card>
      ) : (
        <Card className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl">
          <div className="border-b border-white/10 px-4 py-3 md:px-5">
            <h3 className="text-sm font-semibold text-white md:text-base">Commission Records</h3>
            <p className="mt-1 text-xs text-slate-300 md:text-sm">Review invoice-linked commission entries.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-[900px] text-sm leading-5 text-slate-100">
              <thead className="sticky top-0 z-10 bg-black/40 backdrop-blur-xl">
                <tr className="border-b border-white/10">
                  <th className="min-w-[90px] whitespace-nowrap px-4 py-3 align-middle text-left text-[11px] font-semibold uppercase tracking-wide text-slate-300 tabular-nums">ID</th>
                  <th className="min-w-[90px] whitespace-nowrap px-4 py-3 align-middle text-left text-[11px] font-semibold uppercase tracking-wide text-slate-300 tabular-nums">Invoice ID</th>
                  <th className="px-4 py-3 align-middle text-left text-[11px] font-semibold uppercase tracking-wide text-slate-300">Amount</th>
                  <th className="whitespace-nowrap px-4 py-3 align-middle text-left text-[11px] font-semibold uppercase tracking-wide text-slate-300">Percentage</th>
                  <th className="whitespace-nowrap px-4 py-3 align-middle text-left text-[11px] font-semibold uppercase tracking-wide text-slate-300">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {loading
                  ? Array.from({ length: 5 }).map((_, idx) => (
                      <tr key={`skeleton-${idx}`} className="even:bg-white/[0.02]">
                        <td className="px-4 py-3 align-middle"><div className="h-4 w-10 animate-pulse rounded bg-white/10" /></td>
                        <td className="px-4 py-3 align-middle"><div className="h-4 w-24 animate-pulse rounded bg-white/10" /></td>
                        <td className="px-4 py-3 align-middle"><div className="h-4 w-20 animate-pulse rounded bg-white/10" /></td>
                        <td className="px-4 py-3 align-middle"><div className="h-4 w-14 animate-pulse rounded bg-white/10" /></td>
                        <td className="px-4 py-3 align-middle"><div className="h-4 w-24 animate-pulse rounded bg-white/10" /></td>
                      </tr>
                    ))
                  : rows.map((c, idx) => (
                      <tr key={c.id ?? idx} className="transition-colors even:bg-white/[0.02] hover:bg-white/5">
                        <td className="min-w-[90px] whitespace-nowrap px-4 py-3 align-middle tabular-nums">{c.id}</td>
                        <td className="min-w-[90px] whitespace-nowrap px-4 py-3 align-middle tabular-nums">#{c.invoiceId}</td>
                        <td className="px-4 py-3 align-middle text-base font-semibold text-white/90">{c.amount.toFixed(2)} $</td>
                        <td className="whitespace-nowrap px-4 py-3 align-middle">{c.percentage}%</td>
                        <td className="whitespace-nowrap px-4 py-3 align-middle">{c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "—"}</td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </section>
  );
}
