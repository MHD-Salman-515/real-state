import { useEffect, useState } from "react";
import PageHeader from "../../components/PageHeader.jsx";
import Card from "../../components/Card.jsx";
import Table from "../../components/Table.jsx";
import StatusDot from "../../components/StatusDot.jsx";
import api, { AUTH_ME_PATH } from "../../api/axios";
import { notifyCrudError, notifyCrudSuccess } from "../../utils/notify.js";

export default function WorkerDashboard() {
  const [tickets, setTickets] = useState([]);
  const [logs, setLogs] = useState([]);
  const [user, setUser] = useState(null);

  // فورم إضافة سجل صيانة
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    ticketId: "",
    description: "",
    maintType: "",
    amount: "",
  });

  // ===========================
  // جلب بيانات المستخدم
  // ===========================
  useEffect(() => {
    api.get(AUTH_ME_PATH).then((res) => setUser(res.data));
  }, []);

  // ===========================
  // جلب التذاكر المسندة للعامل
  // ===========================
  useEffect(() => {
    if (!user) return;
    api.get("/tickets/assigned-to/me").then((res) => {
      setTickets(res.data);
    });
  }, [user]);

  // ===========================
  // جلب السجلات
  // ===========================
  const loadLogs = (ticketId) => {
    api.get(`/ticket-logs/${ticketId}`).then((res) => {
      setLogs(res.data);
    });
  };

  // ===========================
  // تغيير حالة التذكرة
  // ===========================
  const updateStatus = (ticketId, status) => {
    api
      .put(`/tickets/${ticketId}/status/${status}`)
      .then(() => {
        notifyCrudSuccess(`Ticket #${ticketId} status updated`, "Operation successful", {
          href: "/worker",
        });
        api.get("/tickets/assigned-to/me").then((res) => setTickets(res.data));
      })
      .catch(() =>
        notifyCrudError(`Failed to update ticket #${ticketId}`, "Operation failed", {
          href: "/worker",
        })
      );
  };

  // ===========================
  // إنشاء Log جديد
  // ===========================
  const handleSubmit = (e) => {
    e.preventDefault();

    api
      .post(`/tickets/${form.ticketId}/log`, {
        action: `${form.maintType} — ${form.description} — ${form.amount || 0} $`,
      })
      .then(() => {
        notifyCrudSuccess(`Maintenance log added for ticket #${form.ticketId}`, "Operation successful", {
          href: "/worker",
        });
        loadLogs(form.ticketId);
        setShowForm(false);
        setForm({ ticketId: "", description: "", maintType: "", amount: "" });
      })
      .catch(() =>
        notifyCrudError("Failed to add maintenance log", "Operation failed", {
          href: "/worker",
        })
      );
  };

  const ticketColumns = [
    { key: "id", header: "رقم التذكرة" },
    {
      key: "property",
      header: "العقار",
      render: (row) => row.property?.title || "—",
    },
    { key: "category", header: "نوع العطل" },
    {
      key: "priority",
      header: "الأولوية",
      render: (r) => {
        const map = {
          HIGH: ["red", "عالية"],
          MEDIUM: ["yellow", "متوسطة"],
          LOW: ["green", "منخفضة"],
        };
        const [c, label] = map[r.priority] || ["gray", r.priority];
        return <StatusDot color={c} label={label} />;
      },
    },
    {
      key: "status",
      header: "الحالة",
      render: (r) => {
        const map = {
          OPEN: ["blue", "مفتوحة"],
          IN_PROGRESS: ["yellow", "قيد التنفيذ"],
          COMPLETED: ["green", "مكتملة"],
          CANCELLED: ["red", "ملغاة"],
        };
        const [c, label] = map[r.status] || ["gray", r.status];
        return <StatusDot color={c} label={label} />;
      },
    },
    {
      key: "actions",
      header: "إجراءات",
      render: (r) => (
        <div className="flex gap-2">
          <button
            onClick={() => updateStatus(r.id, "IN_PROGRESS")}
            className="text-white/80 text-xs"
          >
            بدء
          </button>
          <button
            onClick={() => updateStatus(r.id, "COMPLETED")}
            className="text-white/80 text-xs"
          >
            إنهاء
          </button>
          <button
            onClick={() => loadLogs(r.id)}
            className="text-white/80 text-xs"
          >
            السجلات
          </button>
          <button
            onClick={() => {
              setShowForm(true);
              setForm((prev) => ({ ...prev, ticketId: r.id }));
            }}
            className="text-white/90 text-xs"
          >
            + صيانة
          </button>
        </div>
      ),
    },
  ];

  return (
    <section className="space-y-6">

      <PageHeader
        title="لوحة الفني / العامل"
        subtitle="تذاكر الصيانة المسندة إليك"
      />

      {/* ===== جدول التذاكر ===== */}
      <Card className="bg-white/5 border-white/10 backdrop-blur-xl text-white">
        <Table
          columns={ticketColumns}
          rows={tickets}
          emptyText="لا توجد تذاكر مسندة إليك."
        />
      </Card>

      {/* ===== جدول السجلات ===== */}
      <Card className="bg-white/5 border-white/10 backdrop-blur-xl text-white">
        <h2 className="px-4 pt-4 pb-2 text-sm font-semibold text-slate-100">
          سجلات التذكرة المختارة
        </h2>

        <Table
          columns={[
            { key: "actionDate", header: "التاريخ" },
            { key: "user.fullName", header: "المستخدم" },
            { key: "action", header: "الإجراء" },
          ]}
          rows={logs}
          emptyText="لا توجد سجلات."
        />
      </Card>

      {/* ===== فورم تسجيل صيانة ===== */}
      {showForm && (
        <Card className="p-4 bg-white/10 backdrop-blur-xl rounded-xl text-white">
          <form className="grid gap-3" onSubmit={handleSubmit}>
            <div>
              <label className="text-xs">وصف الصيانة</label>
              <input
                value={form.description}
                onChange={(e) =>
                  setForm((p) => ({ ...p, description: e.target.value }))
                }
                placeholder="مثال: تبديل صنبور…"
                className="input"
              />
            </div>

            <div>
              <label className="text-xs">نوع الصيانة</label>
              <input
                value={form.maintType}
                onChange={(e) =>
                  setForm((p) => ({ ...p, maintType: e.target.value }))
                }
                placeholder="سباكة / كهرباء / تبريد…"
                className="input"
              />
            </div>

            <div>
              <label className="text-xs">التكلفة</label>
              <input
                type="number"
                value={form.amount}
                onChange={(e) =>
                  setForm((p) => ({ ...p, amount: e.target.value }))
                }
                className="input"
              />
            </div>

            <button className="btn-primary w-fit">حفظ السجل</button>
          </form>
        </Card>
      )}
    </section>
  );
}
