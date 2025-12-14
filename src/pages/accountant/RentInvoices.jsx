import { useEffect, useState } from "react";
import api from "../../api/axios";
import PageHeader from "../../components/PageHeader";
import Card from "../../components/Card";
import Table from "../../components/Table";
import { useToast } from "../../components/ToastProvider";

export default function RentInvoices() {
  const toast = useToast();
  const [rows, setRows] = useState([]);
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    clientId: "",
    propertyId: "",
    totalAmount: "",
    tax: 0,
    dueDate: "",
  });

  const [clients, setClients] = useState([]);
  const [properties, setProperties] = useState([]);

  const load = async () => {
    try {
      const res = await api.get("/invoices");
      const rentOnly = res.data.filter((i) => i.type === "RENT");
      setRows(rentOnly);

      // تحميل العملاء والعقارات للاختيار
      const c = await api.get("/users?role=CLIENT");
      setClients(c.data);

      const p = await api.get("/properties");
      setProperties(p.data);

    } catch (err) {
      toast.error("فشل تحميل فواتير الإيجار");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const createInvoice = (e) => {
    e.preventDefault();

    if (
      !form.clientId ||
      !form.propertyId ||
      !form.totalAmount ||
      !form.dueDate
    ) {
      return toast.error("جميع الحقول مطلوبة");
    }

    api
      .post("/invoices", {
        clientId: Number(form.clientId),
        propertyId: Number(form.propertyId),
        type: "RENT",
        totalAmount: Number(form.totalAmount),
        tax: Number(form.tax),
        dueDate: form.dueDate,
      })
      .then(() => {
        toast.success("تم إنشاء فاتورة إيجار جديدة");
        setShowForm(false);
        setForm({
          clientId: "",
          propertyId: "",
          totalAmount: "",
          tax: 0,
          dueDate: "",
        });
        load();
      })
      .catch(() => toast.error("فشل إنشاء الفاتورة"));
  };

  const deleteInvoice = (id) => {
    if (!confirm("هل تريد حذف هذه الفاتورة؟")) return;
    api
      .delete(`/invoices/${id}`)
      .then(() => {
        toast.success("تم الحذف");
        load();
      })
      .catch(() => toast.error("فشل الحذف"));
  };

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
    {
      key: "dueDate",
      header: "تاريخ الاستحقاق",
      render: (i) => (i.dueDate ? new Date(i.dueDate).toLocaleDateString() : "—"),
    },
    {
      key: "actions",
      header: "تحكم",
      render: (i) => (
        <button
          className="px-3 py-1 bg-red-600 text-white rounded"
          onClick={() => deleteInvoice(i.id)}
        >
          حذف
        </button>
      ),
    },
  ];

  return (
    <section className="space-y-6">
      <PageHeader
        title="فواتير الإيجار"
        subtitle="عرض وإدارة فواتير الإيجارات للمستأجرين"
        actions={
          <button
            className="btn-primary"
            onClick={() => setShowForm(true)}
          >
            + إضافة فاتورة جديدة
          </button>
        }
      />

      {/* جدول الفواتير */}
      <Card>
        <Table
          columns={columns}
          rows={rows}
          emptyText="لا توجد فواتير إيجار"
        />
      </Card>

      {/* نافذة إنشاء فاتورة جديدة */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-slate-800 p-6 rounded-lg w-[400px] space-y-4">
            <h3 className="text-lg text-white font-semibold">
              إنشاء فاتورة إيجار
            </h3>

            <form onSubmit={createInvoice} className="space-y-3">
              <div>
                <label className="text-xs text-slate-300">العميل</label>
                <select
                  className="input"
                  value={form.clientId}
                  onChange={(e) =>
                    setForm({ ...form, clientId: e.target.value })
                  }
                >
                  <option value="">اختر العميل…</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.fullName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-300">العقار</label>
                <select
                  className="input"
                  value={form.propertyId}
                  onChange={(e) =>
                    setForm({ ...form, propertyId: e.target.value })
                  }
                >
                  <option value="">اختر العقار…</option>
                  {properties.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-300">المبلغ</label>
                <input
                  type="number"
                  className="input"
                  value={form.totalAmount}
                  onChange={(e) =>
                    setForm({ ...form, totalAmount: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="text-xs text-slate-300">الضريبة</label>
                <input
                  type="number"
                  className="input"
                  value={form.tax}
                  onChange={(e) =>
                    setForm({ ...form, tax: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="text-xs text-slate-300">
                  تاريخ الاستحقاق
                </label>
                <input
                  type="date"
                  className="input"
                  value={form.dueDate}
                  onChange={(e) =>
                    setForm({ ...form, dueDate: e.target.value })
                  }
                />
              </div>

              <button className="btn-primary w-full mt-2">حفظ الفاتورة</button>
            </form>

            <button
              className="w-full py-2 bg-red-500/70 rounded mt-2"
              onClick={() => setShowForm(false)}
            >
              إغلاق
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
