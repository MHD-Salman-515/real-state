// src/pages/admin/ARAging.jsx
import { useEffect, useMemo, useState } from "react";
import PageHeader from "../../components/PageHeader.jsx";
import Card from "../../components/Card.jsx";
import Table from "../../components/Table.jsx";
import api from "../../api/axios";

function getBucketLabel(key) {
  switch (key) {
    case "0_30":
      return "0 – 30 يوم";
    case "31_60":
      return "31 – 60 يوم";
    case "61_90":
      return "61 – 90 يوم";
    case "90_plus":
      return "+90 يوم";
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
      // نحتاج فقط الفواتير غير المدفوعة
      const pending = data.filter((inv) => inv.status !== "PAID");
      setInvoices(pending);
    } catch (err) {
      console.error(err);
      setError("فشل في تحميل بيانات المتأخرات");
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
      const diffDays = Math.floor(
        (today.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24)
      );

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

  const totalAmount = bucketRows.reduce(
    (sum, b) => sum + b.amount,
    0
  );

  const columns = [
    { key: "label", header: "الفترة الزمنية" },
    { key: "count", header: "عدد الفواتير" },
    {
      key: "amount",
      header: "إجمالي المتأخرات",
      render: (row) =>
        row.amount.toLocaleString("en-US", {
          maximumFractionDigits: 0,
        }) + "$",
    },
  ];

  return (
    <section className="space-y-4">
      <PageHeader
        title="تقرير المتأخرات (A/R Aging)"
        subtitle="متابعة الذمم المدينة حسب الفترات الزمنية لمساعدة الإدارة والمحاسب على التحصيل."
      />

      <Card className="bg-slate-900/60 border-white/10">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-100">
            توزيع المتأخرات حسب الفترات
          </h2>
          {loading && (
            <span className="text-[11px] text-slate-400">
              جارٍ التحميل…
            </span>
          )}
        </div>

        {error && (
          <div className="text-xs text-red-300 mb-2">{error}</div>
        )}

        <Table columns={columns} rows={bucketRows} />

        <div className="mt-4 text-sm text-slate-200 flex justify-between">
          <span>إجمالي المتأخرات الكلي:</span>
          <span className="font-semibold text-amber-200">
            {totalAmount.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}{" "}
            $
          </span>
        </div>

        <p className="mt-3 text-[11px] text-slate-400">
          الحساب مبني على الفواتير غير المدفوعة حسب تاريخ الاستحقاق
          (dueDate). إذا لم يكن هناك تاريخ استحقاق، يتم استخدام تاريخ إصدار
          الفاتورة.
        </p>
      </Card>
    </section>
  );
}
