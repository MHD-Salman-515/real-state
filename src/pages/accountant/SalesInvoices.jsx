import { useEffect, useState } from "react";
import api from "../../api/axios";
import PageHeader from "../../components/PageHeader";
import Card from "../../components/Card";
import Table from "../../components/Table";
import { useToast } from "../../components/ToastProvider";
import { notifyCrudError, notifyCrudSuccess } from "../../utils/notify.js";

const initialForm = {
  clientId: "",
  propertyId: "",
  totalAmount: "",
  tax: 0,
  dueDate: "",
};

export default function SalesInvoices() {
  const toast = useToast();
  const [rows, setRows] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [clients, setClients] = useState([]);
  const [properties, setProperties] = useState([]);

  const load = async () => {
    try {
      const res = await api.get("/invoices");
      const sales = res.data.filter((i) => i.type === "SALE");
      setRows(sales);

      const c = await api.get("/users?role=CLIENT");
      setClients(c.data);

      const p = await api.get("/properties");
      setProperties(p.data);
    } catch (err) {
      toast.error("Failed to load sales invoices");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const createInvoice = (e) => {
    e.preventDefault();

    if (!form.clientId || !form.propertyId || !form.totalAmount || !form.dueDate) {
      return toast.error("All required fields must be filled");
    }

    api
      .post("/invoices", {
        clientId: Number(form.clientId),
        propertyId: Number(form.propertyId),
        type: "SALE",
        totalAmount: Number(form.totalAmount),
        tax: Number(form.tax),
        dueDate: form.dueDate,
      })
      .then(() => {
        notifyCrudSuccess("Sales invoice created", "Operation successful", {
          href: "/accountant/sales-invoices",
        });
        setShowForm(false);
        setForm(initialForm);
        load();
      })
      .catch(() =>
        notifyCrudError("Failed to create sales invoice", "Operation failed", {
          href: "/accountant/sales-invoices",
        })
      );
  };

  const deleteInvoice = (id) => {
    if (!confirm("Delete this invoice?")) return;
    api
      .delete(`/invoices/${id}`)
      .then(() => {
        notifyCrudSuccess("Invoice deleted", "Operation successful", {
          href: "/accountant/sales-invoices",
        });
        load();
      })
      .catch(() =>
        notifyCrudError("Failed to delete invoice", "Operation failed", {
          href: "/accountant/sales-invoices",
        })
      );
  };

  const columns = [
    { key: "id", header: "#" },
    { key: "client", header: "Client", render: (i) => i.client?.fullName || "-" },
    { key: "property", header: "Property", render: (i) => i.property?.title || "-" },
    { key: "amount", header: "Total", render: (i) => `${Number(i.totalAmount || 0).toFixed(2)} $` },
    { key: "tax", header: "Tax", render: (i) => `${Number(i.tax || 0).toFixed(2)} $` },
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
    {
      key: "dueDate",
      header: "Due Date",
      render: (i) => (i.dueDate ? new Date(i.dueDate).toLocaleDateString() : "-"),
    },
    {
      key: "actions",
      header: "Actions",
      render: (i) => (
        <button
          className="inline-flex h-8 items-center justify-center rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 text-xs text-rose-200 transition hover:bg-rose-500/20"
          onClick={() => deleteInvoice(i.id)}
        >
          Delete
        </button>
      ),
    },
  ];

  const selectClass =
    "mt-1 w-full appearance-none rounded-xl border border-white/10 bg-[#0b1220]/60 px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-white/15 focus:ring-2 focus:ring-white/30";
  const optionClass = "bg-[#050912] text-slate-100";

  return (
    <section className="space-y-4">
      <PageHeader
        title="Sales Invoices"
        subtitle="Manage property sales invoices and payment status."
        actions={
          <button
            className="rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white/90 transition hover:bg-white/10"
            onClick={() => setShowForm(true)}
          >
            + New Sales Invoice
          </button>
        }
      />

      <Card className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
        <div className="mb-3">
          <h3 className="text-sm font-semibold text-white md:text-base">Sales Invoice Records</h3>
          <p className="mt-1 text-xs text-slate-300">Create, review, and remove sales invoices.</p>
        </div>
        <Table columns={columns} rows={rows} emptyText="No sales invoices found" />
      </Card>

      {showForm ? (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#050912]/95 p-5 backdrop-blur-xl">
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5 md:p-6 backdrop-blur-xl">
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent" />
              <div className="relative flex items-start gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-white/90">
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M4 7.5h16M7.5 4v7M16.5 4v7M6 20h12a2 2 0 0 0 2-2V8H4v10a2 2 0 0 0 2 2Z" />
                  </svg>
                </span>
                <div>
                  <h3 className="text-lg font-semibold text-white">Create Sales Invoice</h3>
                  <p className="mt-1 text-xs text-slate-300">Fill invoice details and save.</p>
                </div>
              </div>
            </div>

            <form onSubmit={createInvoice} className="mt-4 space-y-3">
              <div>
                <label className="text-xs text-slate-300">Client</label>
                <div className="relative">
                  <select
                    className={selectClass}
                    value={form.clientId}
                    onChange={(e) => setForm({ ...form, clientId: e.target.value })}
                  >
                    <option className={optionClass} value="">
                      Select client...
                    </option>
                    {clients.map((c) => (
                      <option className={optionClass} key={c.id} value={c.id}>
                        {c.fullName}
                      </option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-300">
                    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="m5 7 5 5 5-5" />
                    </svg>
                  </span>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-300">Property</label>
                <div className="relative">
                  <select
                    className={selectClass}
                    value={form.propertyId}
                    onChange={(e) => setForm({ ...form, propertyId: e.target.value })}
                  >
                    <option className={optionClass} value="">
                      Select property...
                    </option>
                    {properties.map((p) => (
                      <option className={optionClass} key={p.id} value={p.id}>
                        {p.title}
                      </option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-300">
                    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="m5 7 5 5 5-5" />
                    </svg>
                  </span>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-300">Total Amount</label>
                <input
                  type="number"
                  className="mt-1 w-full rounded-xl border border-white/10 bg-black/25 px-3 py-2 text-sm text-slate-100"
                  value={form.totalAmount}
                  onChange={(e) => setForm({ ...form, totalAmount: e.target.value })}
                />
              </div>

              <div>
                <label className="text-xs text-slate-300">Tax</label>
                <input
                  type="number"
                  className="mt-1 w-full rounded-xl border border-white/10 bg-black/25 px-3 py-2 text-sm text-slate-100"
                  value={form.tax}
                  onChange={(e) => setForm({ ...form, tax: e.target.value })}
                />
              </div>

              <div>
                <label className="text-xs text-slate-300">Due Date</label>
                <input
                  type="date"
                  className="mt-1 w-full rounded-xl border border-white/10 bg-black/25 px-3 py-2 text-sm text-slate-100"
                  value={form.dueDate}
                  onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                />
              </div>

              <button className="w-full rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-sm font-medium text-white/90 transition hover:bg-white/10">
                Save Invoice
              </button>
            </form>

            <button
              className="mt-3 w-full rounded-xl border border-white/20 px-3 py-2 text-sm text-slate-200 transition hover:bg-white/10"
              onClick={() => setShowForm(false)}
            >
              Close
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
