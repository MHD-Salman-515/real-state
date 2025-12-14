// // src/pages/admin/Appointments.jsx
// import { useState, useMemo } from "react";
// import PageHeader from "../../components/PageHeader.jsx";
// import Toolbar from "../../components/Toolbar.jsx";
// import Card from "../../components/Card.jsx";
// import Table from "../../components/Table.jsx";
// import StatusDot from "../../components/StatusDot.jsx";

// const STATUS_FILTERS = [
//   { value: "", label: "كل الحالات" },
//   { value: "pending", label: "معلّق" },
//   { value: "confirmed", label: "مؤكد" },
//   { value: "cancelled", label: "ملغى" },
// ];

// const STATUS_MAP = {
//   pending: ["yellow", "معلّق"],
//   confirmed: ["green", "مؤكد"],
//   cancelled: ["red", "ملغى"],
// };

// export default function AdminAppointments() {
//   const [statusFilter, setStatusFilter] = useState("");

//   // 🔹 نخلي المواعيد داخل state مشان نضيف عليها
//   const [rows, setRows] = useState([
//     {
//       id: "A-1001",
//       client: "أحمد علي",
//       agent: "خالد",
//       date: "2025-11-07 10:30",
//       status: "pending",
//     },
//     {
//       id: "A-1002",
//       client: "ليلى حسن",
//       agent: "سارة",
//       date: "2025-11-08 12:00",
//       status: "confirmed",
//     },
//     {
//       id: "A-1003",
//       client: "محمود سمير",
//       agent: "—",
//       date: "2025-11-09 09:00",
//       status: "cancelled",
//     },
//   ]);

//   const filteredRows = useMemo(
//     () =>
//       statusFilter
//         ? rows.filter((r) => r.status === statusFilter)
//         : rows,
//     [rows, statusFilter]
//   );

//   // ✅ مودال "موعد جديد"
//   const [showNewModal, setShowNewModal] = useState(false);
//   const [newAppt, setNewAppt] = useState({
//     client: "",
//     agent: "",
//     date: "",
//     time: "",
//     status: "pending",
//   });

//   const openNewModal = () => setShowNewModal(true);
//   const closeNewModal = () => setShowNewModal(false);

//   // إرسال إشعار للجرس (AdminLayout)
//   const sendAdminNotif = (text) => {
//     try {
//       window.dispatchEvent(
//         new CustomEvent("admin:addNotif", {
//           detail: { text },
//         })
//       );
//     } catch {
//       // نتجاهل أي خطأ
//     }
//   };

//   const handleNewSubmit = (e) => {
//     e.preventDefault();
//     if (!newAppt.client.trim()) return;

//     const id = `A-${Date.now().toString().slice(-4)}`;
//     const dateTime = newAppt.date && newAppt.time
//       ? `${newAppt.date} ${newAppt.time}`
//       : newAppt.date || "غير محدد";

//     const record = {
//       id,
//       client: newAppt.client || "غير محدد",
//       agent: newAppt.agent || "—",
//       date: dateTime,
//       status: newAppt.status || "pending",
//     };

//     setRows((prev) => [record, ...prev]);

//     // إشعار للمدير
//     sendAdminNotif(`تم إضافة موعد جديد للعميل "${record.client}".`);

//     // تصفير النموذج وإغلاق المودال
//     setNewAppt({
//       client: "",
//       agent: "",
//       date: "",
//       time: "",
//       status: "pending",
//     });
//     closeNewModal();
//   };

//   const columns = [
//     { key: "id", header: "رقم الموعد" },
//     { key: "client", header: "الزبون" },
//     { key: "agent", header: "الوكيل" },
//     { key: "date", header: "التاريخ/الوقت" },
//     {
//       key: "status",
//       header: "الحالة",
//       render: (r) => {
//         const [color, label] = STATUS_MAP[r.status] || ["gray", r.status];
//         return <StatusDot color={color} label={label} />;
//       },
//     },
//     {
//       key: "actions",
//       header: "إجراءات",
//       render: () => (
//         <div className="flex items-center gap-2">
//           <button className="px-3 py-1.5 rounded-lg border border-emerald-400/40 text-emerald-200 hover:bg-emerald-500/10 transition text-xs">
//             تأكيد
//           </button>
//           <button className="px-3 py-1.5 rounded-lg border border-sky-400/40 text-sky-200 hover:bg-sky-500/10 transition text-xs">
//             تعديل
//           </button>
//           <button className="px-3 py-1.5 rounded-lg border border-red-400/40 text-red-300 hover:bg-red-500/10 transition text-xs">
//             إلغاء
//           </button>
//         </div>
//       ),
//     },
//   ];

//   return (
//     <>
//       {/* ===== عنوان الصفحة ===== */}
//       <PageHeader
//         title={
//           <span className="bg-gradient-to-r from-emerald-300 via-cyan-300 to-sky-300 bg-clip-text text-transparent font-black">
//             إدارة المواعيد
//           </span>
//         }
//         subtitle="تأكيد، تعديل، إلغاء ومتابعة مواعيد المعاينات مع الوكلاء."
//       />

//       {/* ===== Toolbar فاخر مع زر موعد جديد ===== */}
//       <Toolbar className="bg-white/5 border-white/10 backdrop-blur-xl text-white shadow-soft rounded-2xl">
//         <input
//           className="px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40
//                      focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition"
//           placeholder="بحث بالاسم / رقم الموعد"
//         />

//         {/* فلتر الحالة + أسطورة الألوان */}
//         <div className="flex items-center gap-3">
//           <select
//             className="px-3 py-2 min-w-[150px] rounded-xl bg-white/10 border border-white/20 text-white text-sm
//                        focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition cursor-pointer"
//             value={statusFilter}
//             onChange={(e) => setStatusFilter(e.target.value)}
//           >
//             {STATUS_FILTERS.map((opt) => (
//               <option
//                 key={opt.value || "all"}
//                 value={opt.value}
//                 className="bg-slate-900 text-white"
//               >
//                 {opt.label}
//               </option>
//             ))}
//           </select>

//           <div className="hidden md:flex items-center gap-2 text-[11px] text-slate-200">
//             <span className="inline-flex items-center gap-1">
//               <span className="h-2 w-2 rounded-full bg-yellow-400" /> معلّق
//             </span>
//             <span className="inline-flex items-center gap-1">
//               <span className="h-2 w-2 rounded-full bg-emerald-400" /> مؤكد
//             </span>
//             <span className="inline-flex items-center gap-1">
//               <span className="h-2 w-2 rounded-full bg-red-400" /> ملغى
//             </span>
//           </div>
//         </div>

//         {/* زر موعد جديد – فخم ويشبه أزرار الفواتير */}
//         <button
//           type="button"
//           onClick={openNewModal}
//           className="px-4 py-2 rounded-xl bg-gradient-to-r 
//                      from-emerald-500 via-emerald-400 to-cyan-400 
//                      text-black font-semibold text-sm shadow-lg shadow-emerald-500/30
//                      hover:scale-105 active:scale-95 transition
//                      flex items-center gap-2"
//         >
//           <span className="text-lg">＋</span>
//           <span>موعد جديد</span>
//         </button>
//       </Toolbar>

//       {/* ===== الجدول ===== */}
//       <Card className="bg-white/5 backdrop-blur-xl border-white/10 text-white shadow-soft rounded-2xl mt-4">
//         <Table columns={columns} rows={filteredRows} emptyText="لا توجد مواعيد" />
//       </Card>

//       {/* ===== مودال إضافة موعد جديد ===== */}
//       {showNewModal && (
//         <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm">
//           <div className="w-full max-w-lg rounded-2xl bg-[#050910] border border-emerald-400/30 shadow-2xl shadow-emerald-500/30 p-5 space-y-4 animate-slide-up">
//             <div className="flex items-center justify-between mb-2">
//               <div>
//                 <h2 className="text-lg font-semibold text-emerald-200">
//                   إضافة موعد جديد
//                 </h2>
//                 <p className="text-xs text-slate-400 mt-1">
//                   سجّل بيانات الموعد لربطه مع الوكيل العقاري لاحقاً.
//                 </p>
//               </div>
//               <button
//                 type="button"
//                 onClick={closeNewModal}
//                 className="text-slate-400 hover:text-rose-300 text-sm"
//               >
//                 إغلاق ✕
//               </button>
//             </div>

//             <form
//               onSubmit={handleNewSubmit}
//               className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm"
//             >
//               <div className="space-y-1 md:col-span-2">
//                 <label className="text-xs text-slate-300">اسم الزبون</label>
//                 <input
//                   className="w-full rounded-xl bg-white/5 border border-white/20 px-3 py-2 text-white
//                              focus:outline-none focus:ring-2 focus:ring-emerald-500/60"
//                   placeholder="مثال: أحمد علي"
//                   value={newAppt.client}
//                   onChange={(e) =>
//                     setNewAppt((p) => ({ ...p, client: e.target.value }))
//                   }
//                   required
//                 />
//               </div>

//               <div className="space-y-1">
//                 <label className="text-xs text-slate-300">اسم الوكيل</label>
//                 <input
//                   className="w-full rounded-xl bg-white/5 border border-white/20 px-3 py-2 text-white
//                              focus:outline-none focus:ring-2 focus:ring-emerald-500/60"
//                   placeholder="مثال: خالد"
//                   value={newAppt.agent}
//                   onChange={(e) =>
//                     setNewAppt((p) => ({ ...p, agent: e.target.value }))
//                   }
//                 />
//               </div>

//               <div className="space-y-1">
//                 <label className="text-xs text-slate-300">التاريخ</label>
//                 <input
//                   type="date"
//                   className="w-full rounded-xl bg-white/5 border border-white/20 px-3 py-2 text-white
//                              focus:outline-none focus:ring-2 focus:ring-emerald-500/60"
//                   value={newAppt.date}
//                   onChange={(e) =>
//                     setNewAppt((p) => ({ ...p, date: e.target.value }))
//                   }
//                 />
//               </div>

//               <div className="space-y-1">
//                 <label className="text-xs text-slate-300">الوقت</label>
//                 <input
//                   type="time"
//                   className="w-full rounded-xl bg-white/5 border border-white/20 px-3 py-2 text-white
//                              focus:outline-none focus:ring-2 focus:ring-emerald-500/60"
//                   value={newAppt.time}
//                   onChange={(e) =>
//                     setNewAppt((p) => ({ ...p, time: e.target.value }))
//                   }
//                 />
//               </div>

//               <div className="space-y-1">
//                 <label className="text-xs text-slate-300">حالة الموعد</label>
//                 <select
//                   className="w-full rounded-xl bg-white/5 border border-white/20 px-3 py-2 text-white
//                              focus:outline-none focus:ring-2 focus:ring-emerald-500/60"
//                   value={newAppt.status}
//                   onChange={(e) =>
//                     setNewAppt((p) => ({ ...p, status: e.target.value }))
//                   }
//                 >
//                   <option value="pending">معلّق</option>
//                   <option value="confirmed">مؤكد</option>
//                   <option value="cancelled">ملغى</option>
//                 </select>
//               </div>

//               <div className="md:col-span-2 flex justify-end gap-2 pt-2">
//                 <button
//                   type="button"
//                   onClick={closeNewModal}
//                   className="px-3 py-1.5 rounded-xl border border-white/20 bg-white/5 text-xs text-slate-200 hover:bg-white/10 transition"
//                 >
//                   إلغاء
//                 </button>
//                 <button
//                   type="submit"
//                   className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-400 
//                              text-black text-xs font-semibold shadow-lg shadow-emerald-500/40
//                              hover:scale-105 active:scale-95 transition"
//                 >
//                   حفظ الموعد
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </>
//   );
// }

import { useEffect, useState } from "react";
import PageHeader from "../../components/PageHeader.jsx";
import Card from "../../components/Card.jsx";
import Toolbar from "../../components/Toolbar.jsx";
import Table from "../../components/Table.jsx";
import api from "../../api/axios";

const STATUS_LABELS = {
  PENDING: "قيد الانتظار",
  APPROVED: "مؤكد",
  COMPLETED: "مكتمل",
  CANCELLED: "ملغي",
};

const STATUS_COLORS = {
  PENDING: "bg-amber-500/20 text-amber-300 border-amber-400/40",
  APPROVED: "bg-green-500/20 text-green-200 border-green-400/40",
  COMPLETED: "bg-sky-500/20 text-sky-200 border-sky-400/40",
  CANCELLED: "bg-red-500/20 text-red-300 border-red-400/40",
};

export default function AdminAppointments() {
  const [rows, setRows] = useState([]);
  const [allRows, setAllRows] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");

  const load = async () => {
    try {
      const res = await api.get("/appointments");
      const list = (res.data || []).map((a) => ({
        id: a.id,
        client: a.client?.fullName || "—",
        property: a.property?.title || "—",
        agent: a.agent?.fullName || "—",
        date: a.date?.slice(0, 10),
        time: a.date?.slice(11, 16),
        status: a.status,
        notes: a.notes || "",
      }));

      setAllRows(list);
      setRows(list);
    } catch (err) {
      console.error(err);
      alert("فشل تحميل المواعيد");
    }
  };

  useEffect(() => {
    load();
  }, []);

  // ====== فلترة حسب الحالة ======
  const filterStatus = (st) => {
    setStatusFilter(st);
    if (!st) {
      setRows(allRows);
      return;
    }
    setRows(allRows.filter((r) => r.status === st));
  };

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/appointments/${id}`, { status });
      alert("تم تحديث الحالة");
      load();
    } catch (err) {
      console.error(err);
      alert("تعذر تحديث الحالة");
    }
  };

  const deleteItem = async (id) => {
    if (!confirm("هل أنت متأكد من حذف الموعد؟")) return;

    try {
      await api.delete(`/appointments/${id}`);
      alert("تم الحذف بنجاح");
      load();
    } catch (err) {
      console.error(err);
      alert("تعذر حذف الموعد");
    }
  };

  const columns = [
    { key: "id", header: "المعرف" },
    { key: "client", header: "العميل" },
    { key: "property", header: "العقار" },
    { key: "agent", header: "الموظف" },
    { key: "date", header: "التاريخ" },
    { key: "time", header: "الوقت" },
    {
      key: "status",
      header: "الحالة",
      render: (r) => (
        <span
          className={
            "px-3 py-1 rounded-full border text-xs " +
            (STATUS_COLORS[r.status] || "bg-slate-700 border-slate-500")
          }
        >
          {STATUS_LABELS[r.status] || r.status}
        </span>
      ),
    },
    {
      key: "actions",
      header: "إجراءات",
      render: (r) => (
        <div className="flex gap-2">
          {/* زر تغيير الحالة */}
          <select
            className="px-2 py-1 rounded bg-slate-800 border border-slate-600 text-white text-xs"
            value={r.status}
            onChange={(e) => updateStatus(r.id, e.target.value)}
          >
            <option value="PENDING">قيد الانتظار</option>
            <option value="APPROVED">مؤكد</option>
            <option value="COMPLETED">مكتمل</option>
            <option value="CANCELLED">ملغي</option>
          </select>

          {/* زر حذف */}
          <button
            onClick={() => deleteItem(r.id)}
            className="px-3 py-1 bg-red-500/20 text-red-300 border border-red-500/40 rounded text-xs"
          >
            حذف
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title={
          <span className="bg-gradient-to-r from-pink-400 to-rose-300 bg-clip-text text-transparent font-black">
            إدارة المواعيد
          </span>
        }
      />

      <Toolbar className="flex items-center gap-3">
        <select
          className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-600 text-white"
          value={statusFilter}
          onChange={(e) => filterStatus(e.target.value)}
        >
          <option value="">كل الحالات</option>
          <option value="PENDING">قيد الانتظار</option>
          <option value="APPROVED">مؤكد</option>
          <option value="COMPLETED">مكتمل</option>
          <option value="CANCELLED">ملغي</option>
        </select>
      </Toolbar>

      <Card className="mt-4 bg-white/5 border-white/10 backdrop-blur-xl rounded-2xl shadow-soft text-white">
        <Table columns={columns} rows={rows} emptyText="لا توجد مواعيد" />
      </Card>
    </>
  );
}
