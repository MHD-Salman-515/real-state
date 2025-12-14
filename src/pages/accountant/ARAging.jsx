import { useEffect, useState } from "react";
import api from "../../api/axios";
import PageHeader from "../../components/PageHeader";
import Card from "../../components/Card";
import Table from "../../components/Table";
import { useToast } from "../../components/ToastProvider";

export default function ARAging() {
  const toast = useToast();
  const [invoices, setInvoices] = useState([]);
  const [rows, setRows] = useState([]);

  const load = async () => {
    try {
      const res = await api.get("/invoices");
      const unpaid = res.data.filter(
        (i) => i.status === "PENDING" || i.status === "OVERDUE"
      );
      setInvoices(unpaid);

      const today = new Date();

      const enriched = unpaid.map((inv) => {
        let days = 0;
        if (inv.dueDate) {
          const due = new Date(inv.dueDate);
          const diff = today - due;
          days = Math.floor(diff / (1000 * 60 * 60 * 24));
        }

        let bucket = "";
        if (days <= 30) bucket = "0–30 يوم";
        else if (days <= 60) bucket = "31–60 يوم";
        else if (days <= 90) bucket = "61–90 يوم";
        else bucket = "+90 يوم";

        return {
          ...inv,
          daysLate: days < 0 ? 0 : days,
          bucket,
        };
      });

      setRows(enriched);
    } catch (err) {
      toast.error("فشل تحميل تقرير الذمم");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const columns = [
    { key: "id", header: "#" },

    {
      key: "client",
      header: "العميل",
      render: (i) => i.client?.fullName || "—",
    },

    {
      key: "property",
      header: "العقار",
      render: (i) => i.property?.title || "—",
    },

    {
      key: "amount",
      header: "المبلغ",
      render: (i) => `${i.totalAmount.toFixed(2)} $`,
    },

    {
      key: "dueDate",
      header: "تاريخ الاستحقاق",
      render: (i) =>
        i.dueDate ? new Date(i.dueDate).toLocaleDateString() : "—",
    },

    {
      key: "daysLate",
      header: "أيام التأخير",
      render: (i) => (
        <span className={i.daysLate > 0 ? "text-red-400" : "text-yellow-300"}>
          {i.daysLate}
        </span>
      ),
    },

    {
      key: "bucket",
      header: "تصنيف الذمم",
    },
  ];

  return (
    <section className="space-y-6">
      <PageHeader
        title="تقرير الذمم (AR Aging)"
        subtitle="تحليل الفواتير غير المدفوعة حسب فترات التأخير"
        actions={
          <button
            onClick={load}
            className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold transition"
          >
            تحديث
          </button>
        }
      />

      <Card>
        <Table
          columns={columns}
          rows={rows}
          emptyText="لا توجد فواتير غير مدفوعة"
        />
      </Card>

      {/* ملخص الفئات */}
      <div className="grid md:grid-cols-4 gap-4 mt-6">
        {["0–30 يوم", "31–60 يوم", "61–90 يوم", "+90 يوم"].map((b) => (
          <Card key={b} className="p-4 text-center">
            <h3 className="text-white font-semibold">{b}</h3>
            <p className="text-3xl text-green-300 mt-2">
              {rows.filter((r) => r.bucket === b).length}
            </p>
          </Card>
        ))}
      </div>
    </section>
  );
}
