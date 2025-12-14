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

      // جلب جميع الدفعات لكل فاتورة
      const paymentList = [];
      for (const inv of res.data) {
        const p = await api.get(`/payments/invoice/${inv.id}`);
        paymentList.push(...p.data);
      }
      setPayments(paymentList);

    } catch (err) {
      toast.error("فشل تحميل بيانات الدخل");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // -----------------------------
  // حسابات الدخل
  // -----------------------------

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

  const unpaidInvoices = invoices.filter(
    (i) => i.status === "PENDING" || i.status === "OVERDUE"
  ).length;

  const overdueInvoices = invoices.filter(
    (i) => i.status === "OVERDUE"
  ).length;

  return (
    <section className="space-y-6">
      <PageHeader
        title="تقرير الدخل"
        subtitle="عرض ملخص الدخل من جميع أنواع الفواتير"
        
        actions={
          <button
            onClick={loadData}
            className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold transition"
          >
            تحديث
          </button>
        }
      />

      {/* البطائق الأربعة الرئيسية */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <h3 className="text-lg font-semibold text-white">الدخل الكلي</h3>
          <p className="text-2xl text-green-400 mt-2">{totalPayments.toFixed(2)} $</p>
        </Card>

        <Card className="p-4 text-center">
          <h3 className="text-lg font-semibold text-white">إيجارات</h3>
          <p className="text-2xl text-blue-400 mt-2">{rentIncome.toFixed(2)} $</p>
        </Card>

        <Card className="p-4 text-center">
          <h3 className="text-lg font-semibold text-white">مبيعات</h3>
          <p className="text-2xl text-purple-400 mt-2">{salesIncome.toFixed(2)} $</p>
        </Card>

        <Card className="p-4 text-center">
          <h3 className="text-lg font-semibold text-white">صيانة</h3>
          <p className="text-2xl text-yellow-400 mt-2">{serviceIncome.toFixed(2)} $</p>
        </Card>
      </div>

      {/* ملخص الحالات */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="p-4 text-center">
          <h3 className="text-lg font-semibold text-white">فواتير غير مدفوعة</h3>
          <p className="text-3xl text-red-400">{unpaidInvoices}</p>
        </Card>

        <Card className="p-4 text-center">
          <h3 className="text-lg font-semibold text-white">فواتير متأخرة</h3>
          <p className="text-3xl text-orange-400">{overdueInvoices}</p>
        </Card>
      </div>
    </section>
  );
}
