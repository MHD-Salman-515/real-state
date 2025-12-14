import { useEffect, useState } from "react";
import PageHeader from "../../components/PageHeader.jsx";
import Card from "../../components/Card.jsx";
import api from "../../api/axios";

export default function RecordPayments() {
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  // تحميل الفواتير
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
      alert("يجب اختيار فاتورة أولاً");
      return;
    }

    if (!amount || Number(amount) <= 0) {
      alert("أدخل مبلغ صالح");
      return;
    }

    try {
      setLoading(true);

      await api.post("/payments", {
        invoiceId: selectedInvoice.id,
        amount: Number(amount),
      });

      alert("تم تسجيل الدفعة بنجاح ✔");

      setAmount("");
      setSelectedInvoice(null);
      await loadInvoices();
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء تسجيل الدفعة");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="space-y-4">
      <PageHeader title="تسجيل دفعة" subtitle="تسديد الفواتير وتحديث حالتها." />

      <Card className="p-5 space-y-4">
        <form onSubmit={submitPayment} className="space-y-4">

          {/* اختيار الفاتورة */}
          <div>
            <label className="text-sm text-slate-300">اختر الفاتورة</label>
            <select
              className="w-full mt-1 bg-slate-900/60 border border-white/10 rounded-lg px-3 py-2"
              value={selectedInvoice?.id || ""}
              onChange={(e) => {
                const inv = invoices.find((x) => x.id === Number(e.target.value));
                setSelectedInvoice(inv || null);
              }}
            >
              <option value="">-- اختر --</option>
              {invoices.map((inv) => (
                <option key={inv.id} value={inv.id}>
                  #{inv.id} — {inv.type} — {inv.totalAmount}$
                </option>
              ))}
            </select>
          </div>

          {/* مبلغ الدفع */}
          <div>
            <label className="text-sm text-slate-300">المبلغ</label>
            <input
              type="number"
              className="w-full mt-1 bg-slate-900/60 border border-white/10 rounded-lg px-3 py-2"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="1"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-emerald-500 text-black font-medium hover:bg-emerald-400 disabled:opacity-50"
          >
            {loading ? "جارٍ الحفظ..." : "تسجيل الدفعة"}
          </button>
        </form>
      </Card>
    </section>
  );
}
