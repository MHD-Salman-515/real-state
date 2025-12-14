import { useEffect, useState } from "react";
import api from "../../api/axios";
import PageHeader from "../../components/PageHeader";
import Card from "../../components/Card";
import Table from "../../components/Table";
import { useToast } from "../../components/ToastProvider";

export default function Commissions() {
  const toast = useToast();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const res = await api.get("/commissions");
      setRows(res.data);
      toast.success("تم تحديث السجل");
    } catch (err) {
      toast.error("فشل تحميل سجل العمولة");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const columns = [
    { key: "id", header: "#" },
    {
      key: "invoiceId",
      header: "رقم الفاتورة",
      render: (c) => `#${c.invoiceId}`,
    },
    {
      key: "amount",
      header: "قيمة العمولة",
      render: (c) => `${c.amount.toFixed(2)} $`,
    },
    {
      key: "percentage",
      header: "النسبة",
      render: (c) => `${c.percentage}%`,
    },
    {
      key: "createdAt",
      header: "تاريخ التسجيل",
      render: (c) =>
        c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "—",
    },
  ];

  return (
    <section className="space-y-6">
      <PageHeader
        title="سجل العمولات"
        subtitle="قائمة العمولة التي يكسبها الموقع من كل عملية بيع أو إيجار."
        actions={
          <button
            onClick={load}
            disabled={loading}
            className={`
              px-5 py-2 rounded-xl font-semibold text-emerald-300
              border border-emerald-400 bg-emerald-900/20 
              hover:bg-emerald-900/40 hover:shadow-emerald-500/20 
              transition duration-300 
              ${loading ? "opacity-60 cursor-not-allowed" : ""}
            `}
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-emerald-300 border-t-transparent rounded-full animate-spin"></span>
            ) : (
              "تحديث"
            )}
          </button>
        }
      />

      <Card>
        <Table columns={columns} rows={rows} emptyText="لا توجد عمولات بعد" />
      </Card>
    </section>
  );
}
