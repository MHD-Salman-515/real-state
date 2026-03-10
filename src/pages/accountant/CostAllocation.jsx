import { useEffect, useState } from "react";
import api from "../../api/axios";
import PageHeader from "../../components/PageHeader";
import Card from "../../components/Card";
import Table from "../../components/Table";
import { useToast } from "../../components/ToastProvider";

export default function CostAllocation() {
  const toast = useToast();
  const [rows, setRows] = useState([]);

  const load = async () => {
    try {
      const res = await api.get("/invoices");
      const serviceInvoices = res.data
        .filter((i) => i.type === "SERVICE")
        .map((i) => ({
          ...i,
          expenses: i.expenses ?? [],
        }));

      setRows(serviceInvoices);
    } catch (err) {
      toast.error("Failed to load cost allocation data");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const columns = [
    { key: "id", header: "#" },
    { key: "property", header: "Property", render: (i) => i.property?.title || "-" },
    { key: "client", header: "Client", render: (i) => i.client?.fullName || "-" },
    { key: "expenses", header: "Expense Count", render: (i) => (i.expenses ?? []).length },
    {
      key: "total",
      header: "Total Expenses",
      render: (i) => (i.expenses ?? []).reduce((sum, ex) => sum + ex.amount, 0).toFixed(2) + " $",
    },
    {
      key: "status",
      header: "Status",
      render: (i) => (
        <span
          className={`inline-flex rounded-full border px-2 py-0.5 text-xs ${
            i.status === "PAID"
              ? "border-white/15 bg-white/10 text-white/90"
              : i.status === "OVERDUE"
                ? "border-rose-400/40 bg-rose-500/15 text-rose-200"
                : "border-white/15 bg-white/10 text-white/80"
          }`}
        >
          {i.status}
        </span>
      ),
    },
  ];

  return (
    <section className="space-y-4">
      <PageHeader
        title="Cost Allocation"
        subtitle="Service invoices automatically linked to maintenance expenses."
        actions={
          <button
            onClick={load}
            className="rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white/90 transition hover:bg-white/10"
          >
            Refresh
          </button>
        }
      />

      <Card className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
        <div className="mb-3">
          <h3 className="text-sm font-semibold text-white md:text-base">Service Invoice Allocation</h3>
          <p className="mt-1 text-xs text-slate-300">Summary view of expense distribution per service invoice.</p>
        </div>
        <Table columns={columns} rows={rows} emptyText="No service invoices linked to expenses" />
      </Card>

      <div className="space-y-4">
        {rows.map((invoice) => (
          <Card
            key={invoice.id}
            className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl"
          >
            <h3 className="text-base font-semibold text-white">Service Invoice #{invoice.id}</h3>

            {(invoice.expenses ?? []).length === 0 ? (
              <p className="mt-2 text-sm text-slate-400">No linked expenses.</p>
            ) : (
              <div className="mt-3 overflow-x-auto rounded-2xl border border-white/10">
                <table className="min-w-[900px] text-sm leading-5 text-slate-100">
                  <thead className="sticky top-0 z-10 bg-black/40 backdrop-blur-xl">
                    <tr className="border-b border-white/10">
                      <th className="px-4 py-3 align-middle text-left text-[11px] font-semibold uppercase tracking-wide text-slate-300">
                        Description
                      </th>
                      <th className="px-4 py-3 align-middle text-left text-[11px] font-semibold uppercase tracking-wide text-slate-300">
                        Amount
                      </th>
                      <th className="px-4 py-3 align-middle text-left text-[11px] font-semibold uppercase tracking-wide text-slate-300">
                        Supplier
                      </th>
                      <th className="whitespace-nowrap px-4 py-3 align-middle text-left text-[11px] font-semibold uppercase tracking-wide text-slate-300">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {(invoice.expenses ?? []).map((ex) => (
                      <tr key={ex.id} className="transition-colors even:bg-white/[0.02] hover:bg-white/5">
                        <td className="px-4 py-3 align-middle">{ex.description}</td>
                        <td className="px-4 py-3 align-middle">{Number(ex.amount || 0).toFixed(2)} $</td>
                        <td className="px-4 py-3 align-middle">{ex.contractor?.fullName || "-"}</td>
                        <td className="whitespace-nowrap px-4 py-3 align-middle">
                          {ex.expenseDate ? new Date(ex.expenseDate).toLocaleDateString() : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        ))}
      </div>
    </section>
  );
}
