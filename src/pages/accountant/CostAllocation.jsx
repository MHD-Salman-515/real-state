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

      // نحصل على فواتير الخدمة فقط
      const serviceInvoices = res.data
        .filter((i) => i.type === "SERVICE")
        .map((i) => ({
          ...i,
          expenses: i.expenses ?? [] // 👈 أهم سطر: ضمان وجود مصاريف
        }));

      setRows(serviceInvoices);
    } catch (err) {
      toast.error("فشل تحميل بيانات تخصيص التكاليف");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const columns = [
    { key: "id", header: "#" },

    {
      key: "property",
      header: "العقار",
      render: (i) => i.property?.title || "—",
    },

    {
      key: "client",
      header: "العميل",
      render: (i) => i.client?.fullName || "—",
    },

    {
      key: "expenses",
      header: "عدد المصاريف",
      render: (i) => (i.expenses ?? []).length,
    },

    {
      key: "total",
      header: "إجمالي المصاريف",
      render: (i) =>
        (i.expenses ?? [])
          .reduce((sum, ex) => sum + ex.amount, 0)
          .toFixed(2) + " $",
    },

    {
      key: "status",
      header: "الحالة",
      render: (i) => (
        <span
          className={
            i.status === "PAID"
              ? "text-green-400"
              : i.status === "OVERDUE"
                ? "text-red-400"
                : "text-yellow-400"
          }
        >
          {i.status}
        </span>
      ),
    },
  ];

  return (
    <section className="space-y-6">
      <PageHeader
        title="تخصيص التكاليف (تلقائي)"
        subtitle="تم ربط تكاليف الصيانة تلقائياً بالفواتير. هذا الجدول للعرض فقط."
        
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
          emptyText="لا توجد فواتير خدمة مرتبطة بمصاريف"
        />
      </Card>

      {/* تفاصيل المصاريف لكل فاتورة */}
      <div className="space-y-4 mt-6">
        {rows.map((invoice) => (
          <Card key={invoice.id} className="p-4 space-y-2">
            <h3 className="text-lg text-white font-semibold">
              فاتورة خدمة رقم #{invoice.id}
            </h3>

            {(invoice.expenses ?? []).length === 0 ? (
              <p className="text-gray-400 text-sm">لا توجد مصاريف مرتبطة</p>
            ) : (
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-gray-700 text-gray-300">
                    <th className="py-2">الوصف</th>
                    <th className="py-2">المبلغ</th>
                    <th className="py-2">المورد</th>
                    <th className="py-2">التاريخ</th>
                  </tr>
                </thead>
                <tbody>
                  {(invoice.expenses ?? []).map((ex) => (
                    <tr key={ex.id} className="border-b border-gray-800">
                      <td className="py-2">{ex.description}</td>
                      <td className="py-2">{ex.amount.toFixed(2)} $</td>
                      <td className="py-2">
                        {ex.contractor?.fullName || "—"}
                      </td>
                      <td className="py-2">
                        {new Date(ex.expenseDate).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>
        ))}
      </div>
    </section>
  );
}
