import { useEffect, useState } from "react";
import api from "../../api/axios";
import PageHeader from "../../components/PageHeader";
import Card from "../../components/Card";
import Table from "../../components/Table";
import { useToast } from "../../components/ToastProvider";

export default function SupplierInvoices() {
  const toast = useToast();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get("/expenses/supplier");

        setData(res.data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load supplier invoices");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const columns = [
    { key: "id", header: "Expense ID" },
    { key: "invoiceId", header: "Invoice", render: (r) => `#${r.invoice?.id ?? "-"}` },
    { key: "type", header: "Type", render: (r) => r.invoice?.type || "-" },
    { key: "amount", header: "Amount", render: (r) => `${r.amount ?? 0} $` },
    { key: "invoiceStatus", header: "Invoice Status", render: (r) => r.invoice?.status || "-" },
    { key: "supplier", header: "Supplier", render: (r) => r.contractor?.fullName || "-" },
    { key: "ticket", header: "Ticket", render: (r) => r.ticket?.description || "-" },
    { key: "property", header: "Property", render: (r) => r.ticket?.property?.title || "-" },
  ];

  return (
    <section className="space-y-4">
      <PageHeader
        title="Supplier Invoices"
        subtitle="Track supplier-related expenses linked to tickets and invoices."
      />

      {loading ? (
        <Card className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          <div className="animate-pulse space-y-2">
            <div className="h-8 rounded-xl bg-white/10" />
            <div className="h-8 rounded-xl bg-white/10" />
            <div className="h-8 rounded-xl bg-white/10" />
          </div>
        </Card>
      ) : (
        <Card className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
          <div className="mb-3">
            <h3 className="text-sm font-semibold text-white md:text-base">Supplier Expense Records</h3>
            <p className="mt-1 text-xs text-slate-300">All supplier expenses and linked ticket context.</p>
          </div>
          <Table columns={columns} rows={data} emptyText="No supplier invoices available" />
        </Card>
      )}
    </section>
  );
}
