// src/pages/admin/Finance.jsx
import { useEffect, useMemo, useState } from "react";
import PageHeader from "../../components/PageHeader.jsx";
import Card from "../../components/Card.jsx";
import Table from "../../components/Table.jsx";
import api from "../../api/axios";

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
      setError("فشل في تحميل الفواتير المالية");
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

        // نحدد هل متأخرة بناءً على dueDate
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
          ? "إيجار"
          : type === "SALE"
            ? "بيع"
            : type === "SERVICE"
              ? "خدمة"
              : type,
      count: info.count,
      amount: info.amount,
    }));
  }, [stats.byType]);

  const columns = [
    { key: "label", header: "نوع الفاتورة" },
    { key: "count", header: "عدد الفواتير" },
    {
      key: "amount",
      header: "إجمالي المبلغ",
      render: (row) =>
        row.amount.toLocaleString("en-US", {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }) + "$",
    },
  ];

  return (
    <section className="space-y-4">
      <PageHeader
        title="المالية / التقارير المالية"
        subtitle="لوحة سريعة لمراقبة المبيعات، الإيجارات، والمبالغ المستحقة."
      />

      {/* كروت مختصرة للملخص المالي */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        <Card className="bg-emerald-500/10 border-emerald-400/30">
          <div className="text-xs text-emerald-200 mb-1">إجمالي الفواتير</div>
          <div className="text-lg font-semibold text-emerald-100">
            {stats.totalAmount.toLocaleString("en-US", {
              maximumFractionDigits: 0,
            })}{" "}
            $
          </div>
        </Card>

        <Card className="bg-sky-500/10 border-sky-400/30">
          <div className="text-xs text-sky-200 mb-1">المحصل (PAID)</div>
          <div className="text-lg font-semibold text-sky-100">
            {stats.totalPaid.toLocaleString("en-US", {
              maximumFractionDigits: 0,
            })}{" "}
            $
          </div>
        </Card>

        <Card className="bg-amber-500/10 border-amber-400/30">
          <div className="text-xs text-amber-200 mb-1">
            غير محصل / قيد الانتظار
          </div>
          <div className="text-lg font-semibold text-amber-100">
            {stats.totalPending.toLocaleString("en-US", {
              maximumFractionDigits: 0,
            })}{" "}
            $
          </div>
        </Card>

        <Card className="bg-red-500/10 border-red-400/30">
          <div className="text-xs text-red-200 mb-1">متأخرات (Overdue)</div>
          <div className="text-lg font-semibold text-red-100">
            {stats.totalOverdue.toLocaleString("en-US", {
              maximumFractionDigits: 0,
            })}{" "}
            $
          </div>
        </Card>
      </div>

      {/* جدول حسب نوع الفاتورة */}
      <Card className="bg-slate-900/60 border-white/10">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-100">
            توزيع الإيرادات حسب نوع الفاتورة
          </h2>
          {loading && (
            <span className="text-[11px] text-slate-400">
              جاري التحميل…
            </span>
          )}
        </div>

        {error && (
          <div className="text-xs text-red-300 mb-2">{error}</div>
        )}

        <Table columns={columns} rows={typeRows} />

        <p className="mt-3 text-[11px] text-slate-400">
          البيانات محسوبة مباشرة من جدول الفواتير الحالي. لاحقاً فيكِ تربطيها
          مع مصاريف/تكاليف لعرض صافي الربح.
        </p>
      </Card>
    </section>
  );
}
