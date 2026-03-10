import { useEffect, useState } from "react";
import PageHeader from "../../components/PageHeader.jsx";
import Card from "../../components/Card.jsx";
import api from "../../api/axios";
import { notifyCrudError, notifyCrudSuccess } from "../../utils/notify.js";

export default function RecordPayments() {
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const loadInvoices = async () => {
    const res = await api.get("/invoices");
    setInvoices(res.data);
  };

  useEffect(() => {
    loadInvoices();
  }, []);

  const submitPayment = async (e) => {
    e.preventDefault();

    if (!selectedInvoice) {
      alert("Please select an invoice first");
      return;
    }

    if (!amount || Number(amount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    try {
      setLoading(true);

      await api.post("/payments", {
        invoiceId: selectedInvoice.id,
        amount: Number(amount),
      });

      notifyCrudSuccess("Payment recorded successfully", "Operation successful", {
        href: "/accountant/record-payments",
      });

      setAmount("");
      setSelectedInvoice(null);
      await loadInvoices();
    } catch (err) {
      console.error(err);
      notifyCrudError("Failed to record payment", "Operation failed", {
        href: "/accountant/record-payments",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="space-y-4">
      <PageHeader title="Record Payments" subtitle="Settle invoices and update balances." />

      <Card className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
        <form onSubmit={submitPayment} className="space-y-4">
          <div>
            <label className="text-sm text-slate-300">Invoice</label>
            <select
              className="mt-1 w-full rounded-xl border border-white/10 bg-black/25 px-3 py-2 text-sm text-slate-100"
              value={selectedInvoice?.id || ""}
              onChange={(e) => {
                const inv = invoices.find((x) => x.id === Number(e.target.value));
                setSelectedInvoice(inv || null);
              }}
            >
              <option value="">-- Select invoice --</option>
              {invoices.map((inv) => (
                <option key={inv.id} value={inv.id}>
                  #{inv.id} - {inv.type} - {inv.totalAmount}$
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm text-slate-300">Amount</label>
            <input
              type="number"
              className="mt-1 w-full rounded-xl border border-white/10 bg-black/25 px-3 py-2 text-sm text-slate-100"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="1"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white/90 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Saving..." : "Record Payment"}
          </button>
        </form>
      </Card>
    </section>
  );
}
