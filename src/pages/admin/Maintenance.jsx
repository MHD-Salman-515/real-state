// src/pages/admin/Maintenance.jsx
import { useEffect, useState } from "react";
import api from "../../api/axios";
import { useToast } from "../../components/ToastProvider";

export default function AdminMaintenance() {
  const toast = useToast();

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");

  // بيانات الفنيين والموردين
  const [workers, setWorkers] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  // إدارة النوافذ
  const [showWorkerModal, setShowWorkerModal] = useState(false);
  const [showSupplierModal, setShowSupplierModal] = useState(false);

  const [currentTicket, setCurrentTicket] = useState(null);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [selectedSupplier, setSelectedSupplier] = useState(null);

  // 🔹 كلاس موحّد للـ <select>
  const selectClass =
    "w-full px-3 py-2 rounded-xl " +
    "bg-emerald-900/20 text-emerald-200 " +
    "border border-emerald-400/40 " +
    "focus:outline-none focus:ring-2 focus:ring-emerald-400/60 " +
    "transition";

  const optionClass = "bg-slate-900 text-emerald-100";

  // 🔹 تحميل التذاكر
  const load = async () => {
    try {
      setLoading(true);
      const res = await api.get("/tickets");
      setTickets(res.data);
    } catch (err) {
      console.error("Load tickets error:", err.response?.data || err.message);
      toast.error("تعذّر تحميل التذاكر");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // 🔹 فلترة حسب الحالة
  const filtered = tickets.filter((t) =>
    filter === "ALL" ? true : t.status === filter
  );

  // 🔹 تغيير الحالة
  const updateStatus = async (id, status) => {
    try {
      await api.put(`/tickets/${id}/status/${status}`);
      toast.success("تم تحديث الحالة");
      await load();
    } catch (err) {
      console.error("Update status error:", err.response?.data || err.message);
      toast.error("فشل تحديث الحالة");
    }
  };

  // 🔹 حذف التذكرة
  const deleteTicket = async (id) => {
    if (!confirm("هل تريد حذف التذكرة؟")) return;

    try {
      await api.delete(`/tickets/${id}`);
      toast.success("تم الحذف");
      await load();
    } catch (err) {
      console.error("Delete ticket error:", err.response?.data || err.message);
      toast.error("فشل الحذف (تحقق من السيرفر / القيود في قاعدة البيانات)");
    }
  };

  // 🔹 فتح نافذة تعيين فني
  const openAssignWorker = async (ticket) => {
    try {
      setCurrentTicket(ticket);
      setSelectedWorker(null);
      const res = await api.get("/users/role/WORKER");
      setWorkers(res.data);
      setShowWorkerModal(true);
    } catch (err) {
      console.error("Load workers error:", err.response?.data || err.message);
      toast.error("فشل تحميل قائمة الفنيين");
    }
  };

  // 🔹 فتح نافذة تعيين مورد
  const openAssignSupplier = async (ticket) => {
    try {
      setCurrentTicket(ticket);
      setSelectedSupplier(null);
      const res = await api.get("/users/role/SUPPLIER");
      setSuppliers(res.data);
      setShowSupplierModal(true);
    } catch (err) {
      console.error("Load suppliers error:", err.response?.data || err.message);
      toast.error("فشل تحميل قائمة الموردين");
    }
  };

  // 🔹 تنفيذ تعيين الفني
  const assignWorker = async () => {
    if (!currentTicket || !selectedWorker) {
      return toast.error("اختر فنيًا أولًا");
    }

    try {
      await api.put(
        `/tickets/${currentTicket.id}/assign-worker/${selectedWorker}`
      );
      toast.success("تم تعيين الفني");
      setShowWorkerModal(false);
      setSelectedWorker(null);
      setCurrentTicket(null);
      await load();
    } catch (err) {
      console.error("Assign worker error:", err.response?.data || err.message);
      toast.error("فشل تعيين الفني (تحقق من السيرفر)");
    }
  };

  // 🔹 تنفيذ تعيين المورد
  const assignSupplier = async () => {
    if (!currentTicket || !selectedSupplier) {
      return toast.error("اختر موردًا أولًا");
    }

    try {
      await api.put(
        `/tickets/${currentTicket.id}/assign-supplier/${selectedSupplier}`
      );
      toast.success("تم تعيين المورد");
      setShowSupplierModal(false);
      setSelectedSupplier(null);
      setCurrentTicket(null);
      await load();
    } catch (err) {
      console.error(
        "Assign supplier error:",
        err.response?.data || err.message
      );
      toast.error("فشل تعيين المورد (تحقق من السيرفر)");
    }
  };

  if (loading) return <div className="text-white">جاري التحميل…</div>;

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-white">
          الصيانة — إدارة التذاكر الفنية
        </h1>
        <p className="text-sm text-slate-300">
          تعيين الفنيين والموردين، تحديث الحالة، ومتابعة التذاكر.
        </p>
      </header>

      {/* الفلترة */}
      <div className="flex gap-3">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className={selectClass}
        >
          <option className={optionClass} value="ALL">
            كل الحالات
          </option>
          <option className={optionClass} value="OPEN">
            قيد المراجعة
          </option>
          <option className={optionClass} value="IN_PROGRESS">
            قيد التنفيذ
          </option>
          <option className={optionClass} value="COMPLETED">
            مكتمل
          </option>
          <option className={optionClass} value="CANCELLED">
            ملغى
          </option>
        </select>
      </div>

      {/* الجدول */}
      <div className="overflow-x-auto rounded-xl bg-white/5 border border-white/10 p-4">
        <table className="w-full text-sm text-white">
          <thead className="text-slate-300 border-b border-white/10">
            <tr>
              <th className="p-2">#</th>
              <th className="p-2">العقار</th>
              <th className="p-2">العميل</th>
              <th className="p-2">الفني</th>
              <th className="p-2">المورد</th>
              <th className="p-2">الحالة</th>
              <th className="p-2">تاريخ الإنشاء</th>
              <th className="p-2">تحكم</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((t) => (
              <tr key={t.id} className="border-b border-white/5">
                <td className="p-2">{t.id}</td>
                <td className="p-2">{t.property?.title || "—"}</td>
                <td className="p-2">{t.client?.fullName || "—"}</td>
                <td className="p-2">{t.worker?.fullName || "—"}</td>
                <td className="p-2">{t.supplier?.fullName || "—"}</td>

                <td className="p-2">
                  <select
                    value={t.status}
                    onChange={(e) => updateStatus(t.id, e.target.value)}
                    className={selectClass}
                  >
                    <option className={optionClass} value="OPEN">
                      قيد المراجعة
                    </option>
                    <option className={optionClass} value="IN_PROGRESS">
                      قيد التنفيذ
                    </option>
                    <option className={optionClass} value="COMPLETED">
                      مكتمل
                    </option>
                    <option className={optionClass} value="CANCELLED">
                      ملغى
                    </option>
                  </select>
                </td>

                <td className="p-2">
                  {t.createdAt
                    ? new Date(t.createdAt).toLocaleDateString("ar-EG")
                    : "—"}
                </td>

                <td className="p-2 flex flex-wrap gap-2">
                  {/* زر تعيين فني */}
                  <button
                    className="px-3 py-1 bg-blue-600 rounded text-sm"
                    onClick={() => openAssignWorker(t)}
                  >
                    تعيين فني
                  </button>

                  {/* زر تعيين مورد */}
                  <button
                    className="px-3 py-1 bg-purple-600 rounded text-sm"
                    onClick={() => openAssignSupplier(t)}
                  >
                    تعيين مورد
                  </button>

                  {/* زر حذف */}
                  <button
                    className="px-3 py-1 bg-red-500 rounded text-sm"
                    onClick={() => deleteTicket(t.id)}
                  >
                    حذف
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <p className="text-center text-slate-400 mt-4">لا توجد تذاكر</p>
        )}
      </div>

      {/* نافذة تعيين فني */}
      {showWorkerModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-slate-800 p-5 rounded-lg w-[350px] space-y-4">
            <h3 className="text-lg font-bold text-white">تعيين فني</h3>

            <select
              className={selectClass}
              value={selectedWorker ?? ""}
              onChange={(e) =>
                setSelectedWorker(
                  e.target.value ? Number(e.target.value) : null
                )
              }
            >
              <option className={optionClass} value="">
                اختر الفني…
              </option>
              {workers.map((w) => (
                <option key={w.id} className={optionClass} value={w.id}>
                  {w.fullName}
                </option>
              ))}
            </select>

            <button className="btn-primary w-full" onClick={assignWorker}>
              حفظ
            </button>

            <button
              className="w-full py-2 text-center bg-red-500/70 rounded mt-2"
              onClick={() => {
                setShowWorkerModal(false);
                setSelectedWorker(null);
                setCurrentTicket(null);
              }}
            >
              إغلاق
            </button>
          </div>
        </div>
      )}

      {/* نافذة تعيين مورد */}
      {showSupplierModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-slate-800 p-5 rounded-lg w-[350px] space-y-4">
            <h3 className="text-lg font-bold text-white">تعيين مورد</h3>

            <select
              className={selectClass}
              value={selectedSupplier ?? ""}
              onChange={(e) =>
                setSelectedSupplier(
                  e.target.value ? Number(e.target.value) : null
                )
              }
            >
              <option className={optionClass} value="">
                اختر المورد…
              </option>
              {suppliers.map((s) => (
                <option key={s.id} className={optionClass} value={s.id}>
                  {s.fullName}
                </option>
              ))}
            </select>

            <button className="btn-primary w-full" onClick={assignSupplier}>
              حفظ
            </button>

            <button
              className="w-full py-2 text-center bg-red-500/70 rounded mt-2"
              onClick={() => {
                setShowSupplierModal(false);
                setSelectedSupplier(null);
                setCurrentTicket(null);
              }}
            >
              إغلاق
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
