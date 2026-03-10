// src/pages/admin/Finance.jsx
import { useEffect, useMemo, useState } from "react";
import PageHeader from "../../components/PageHeader.jsx";
import Card from "../../components/Card.jsx";
import api from "../../api/axios";

function KpiSkeleton() {
  return (
    <Card className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
      <div className="h-3 w-24 animate-pulse rounded bg-white/10" />
      <div className="mt-3 h-8 w-32 animate-pulse rounded bg-white/10" />
    </Card>
  );
}

export default function AdminFinance() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadInvoices = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/invoices");
      setInvoices(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      setError("Failed to load finance invoices");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvoices();
  }, []);

  const stats = useMemo(() => {
    let totalAmount = 0;
    let totalPaid = 0;
    let totalPending = 0;
    let totalOverdue = 0;
    let totalTax = 0;

    const byType = {};
    const today = new Date();

    for (const inv of invoices) {
      const amount = Number(inv.totalAmount || 0);
      const tax = Number(inv.tax || 0);
      const status = inv.status || "PENDING";
      const type = inv.type || "OTHER";

      totalAmount += amount;
      totalTax += tax;

      if (!byType[type]) {
        byType[type] = { amount: 0, count: 0 };
      }
      byType[type].amount += amount;
      byType[type].count += 1;

      if (status === "PAID") {
        totalPaid += amount;
      } else {
        totalPending += amount;
        if (inv.dueDate) {
          const due = new Date(inv.dueDate);
          if (due < today) {
            totalOverdue += amount;
          }
        }
      }
    }

    return {
      totalAmount,
      totalPaid,
      totalPending,
      totalOverdue,
      totalTax,
      byType,
    };
  }, [invoices]);

  const typeRows = useMemo(() => {
    return Object.entries(stats.byType || {}).map(([type, info]) => ({
      type,
      label:
        type === "RENT"
          ? "Rent"
          : type === "SALE"
            ? "Sale"
            : type === "SERVICE"
              ? "Service"
              : type,
      count: info.count,
      amount: info.amount,
    }));
  }, [stats.byType]);

  const hasRows = typeRows.length > 0;

  return (
    <section className="space-y-4">
      <PageHeader
        title="Finance & Reports"
        subtitle="Invoices summary, cash flow insights, and distribution."
      />

      {error ? (
        <Card className="rounded-2xl border border-red-400/30 bg-red-500/10 p-4 backdrop-blur-xl">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-red-200">{error}</p>
            <button
              type="button"
              onClick={loadInvoices}
              className="inline-flex items-center justify-center rounded-xl border border-red-300/40 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-100 transition duration-200 hover:bg-red-500/20"
            >
              Retry
            </button>
          </div>
        </Card>
      ) : null}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {loading ? (
          <>
            <KpiSkeleton />
            <KpiSkeleton />
            <KpiSkeleton />
            <KpiSkeleton />
          </>
        ) : (
          <>
            <Card className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-xl transition duration-200 hover:border-white/15 hover:bg-white/10">
              <p className="text-xs text-white/90">Total Invoices</p>
              <p className="mt-2 text-2xl font-semibold text-white/90">
                {stats.totalAmount.toLocaleString("en-US", { maximumFractionDigits: 0 })} $
              </p>
            </Card>

            <Card className="rounded-2xl border border-white/15 bg-white/5 p-4 backdrop-blur-xl transition duration-200 hover:border-white/15 hover:bg-white/10">
              <p className="text-xs text-slate-300">Paid</p>
              <p className="mt-2 text-2xl font-semibold text-white">
                {stats.totalPaid.toLocaleString("en-US", { maximumFractionDigits: 0 })} $
              </p>
            </Card>

            <Card className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-xl transition duration-200 hover:border-white/15 hover:bg-white/10">
              <p className="text-xs text-white/80">Pending</p>
              <p className="mt-2 text-2xl font-semibold text-white/80">
                {stats.totalPending.toLocaleString("en-US", { maximumFractionDigits: 0 })} $
              </p>
            </Card>

            <Card className="rounded-2xl border border-red-400/30 bg-red-500/10 p-4 backdrop-blur-xl transition duration-200 hover:border-red-300/50 hover:bg-red-500/15">
              <p className="text-xs text-red-200">Overdue</p>
              <p className="mt-2 text-2xl font-semibold text-red-100">
                {stats.totalOverdue.toLocaleString("en-US", { maximumFractionDigits: 0 })} $
              </p>
            </Card>
          </>
        )}
      </div>

      <Card className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl">
        <div className="border-b border-white/10 px-4 py-3 md:px-5">
          <h2 className="text-sm font-semibold text-white md:text-base">Revenue Distribution</h2>
          <p className="mt-1 text-xs text-slate-300 md:text-sm">Distribution by invoice type and amount share.</p>
        </div>

        {loading ? (
          <div className="p-4">
            <div className="space-y-2 animate-pulse">
              <div className="h-10 rounded-xl bg-white/10" />
              <div className="h-10 rounded-xl bg-white/10" />
              <div className="h-10 rounded-xl bg-white/10" />
              <div className="h-10 rounded-xl bg-white/10" />
            </div>
          </div>
        ) : !hasRows ? (
          <div className="p-8 text-center">
            <h3 className="text-lg font-semibold text-white">No finance records yet</h3>
            <p className="mt-2 text-sm text-slate-300">There are no invoice distributions to display.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[900px] text-sm leading-5 text-slate-100">
              <thead className="sticky top-0 z-10 bg-black/40 backdrop-blur-xl">
                <tr className="border-b border-white/10">
                  <th className="px-4 py-3 align-middle text-left text-[11px] font-semibold uppercase tracking-wide text-slate-300">Invoice Type</th>
                  <th className="whitespace-nowrap px-4 py-3 align-middle text-left text-[11px] font-semibold uppercase tracking-wide text-slate-300">Count</th>
                  <th className="whitespace-nowrap px-4 py-3 align-middle text-left text-[11px] font-semibold uppercase tracking-wide text-slate-300">Total Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {typeRows.map((row) => (
                  <tr key={row.type} className="transition-colors even:bg-white/[0.02] hover:bg-white/5">
                    <td className="px-4 py-3 align-middle">{row.label}</td>
                    <td className="whitespace-nowrap px-4 py-3 align-middle tabular-nums">{row.count}</td>
                    <td className="whitespace-nowrap px-4 py-3 align-middle font-semibold text-white/90">
                      {row.amount.toLocaleString("en-US", {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      })}
                      $
                    </td>
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
