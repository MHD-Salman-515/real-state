import { useEffect, useState } from "react";
import api from "../../api/axios";
import Card from "../../components/Card";
import PageHeader from "../../components/PageHeader";
import { useToast } from "../../components/ToastProvider";

export default function Income() {
  const toast = useToast();
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);

  const loadData = async () => {
    try {
      const res = await api.get("/invoices");
      setInvoices(res.data);

      const paymentList = [];
      for (const inv of res.data) {
        const p = await api.get(`/payments/invoice/${inv.id}`);
        paymentList.push(...p.data);
      }
      setPayments(paymentList);
    } catch (err) {
      toast.error("Failed to load income data");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalPayments = payments.reduce((s, p) => s + p.amount, 0);
  const rentIncome = invoices
    .filter((i) => i.type === "RENT" && i.status === "PAID")
    .reduce((s, i) => s + i.totalAmount, 0);
  const salesIncome = invoices
    .filter((i) => i.type === "SALE" && i.status === "PAID")
    .reduce((s, i) => s + i.totalAmount, 0);
  const serviceIncome = invoices
    .filter((i) => i.type === "SERVICE" && i.status === "PAID")
    .reduce((s, i) => s + i.totalAmount, 0);
  const unpaidInvoices = invoices.filter((i) => i.status === "PENDING" || i.status === "OVERDUE").length;
  const overdueInvoices = invoices.filter((i) => i.status === "OVERDUE").length;

  return (
    <section className="space-y-4">
      <PageHeader
        title="Income"
        subtitle="Summary of collected income across invoice types."
        actions={
          <button
            onClick={loadData}
            className="rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white/90 transition hover:bg-white/10"
          >
            Refresh
          </button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-xl">
          <p className="text-xs text-white/90">Total Income</p>
          <p className="mt-2 text-2xl font-semibold text-white/90">{totalPayments.toFixed(2)} $</p>
        </Card>
        <Card className="rounded-2xl border border-sky-400/30 bg-sky-500/10 p-4 backdrop-blur-xl">
          <p className="text-xs text-sky-200">Rent</p>
          <p className="mt-2 text-2xl font-semibold text-sky-100">{rentIncome.toFixed(2)} $</p>
        </Card>
        <Card className="rounded-2xl border border-indigo-400/30 bg-indigo-500/10 p-4 backdrop-blur-xl">
          <p className="text-xs text-indigo-200">Sales</p>
          <p className="mt-2 text-2xl font-semibold text-indigo-100">{salesIncome.toFixed(2)} $</p>
        </Card>
        <Card className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-xl">
          <p className="text-xs text-white/80">Service</p>
          <p className="mt-2 text-2xl font-semibold text-white/80">{serviceIncome.toFixed(2)} $</p>
        </Card>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <Card className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center backdrop-blur-xl">
          <h3 className="text-base font-semibold text-white">Unpaid Invoices</h3>
          <p className="mt-2 text-3xl font-semibold text-rose-300">{unpaidInvoices}</p>
        </Card>
        <Card className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center backdrop-blur-xl">
          <h3 className="text-base font-semibold text-white">Overdue Invoices</h3>
          <p className="mt-2 text-3xl font-semibold text-white/80">{overdueInvoices}</p>
        </Card>
      </div>
    </section>
  );
}
