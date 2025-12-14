// import { useEffect, useState } from "react";
// import api from "../../api/axios";
// import { useToast } from "../../components/ToastProvider";

// export default function AcceptAssignments() {
//   const toast = useToast();
//   const [rows, setRows] = useState([]);
//   const [loading, setLoading] = useState(true);

//   // جلب المهام الخاصة بالمورد
//   const load = async () => {
//     try {
//       const res = await api.get("/tickets/supplier/me");

//       // فلترة التذاكر المفتوحة فقط
//       const list = res.data.filter((t) => t.status === "OPEN");

//       setRows(list);
//       setLoading(false);
//     } catch (err) {
//       console.error(err);
//       toast.error("تعذر تحميل المهام");
//     }
//   };

//   useEffect(() => {
//     load();
//   }, []);

//   // قبول المهمة
//   const accept = async (id) => {
//     try {
//       await api.put(`/tickets/${id}/status/IN_PROGRESS`);
//       toast.success(`تم قبول المهمة رقم ${id}`);
//       load();
//     } catch (err) {
//       console.error(err);
//       toast.error("تعذر قبول المهمة");
//     }
//   };

//   // رفض المهمة
//   const reject = async (id) => {
//     try {
//       await api.put(`/tickets/${id}/status/CANCELLED`);
//       toast.error(`تم رفض المهمة رقم ${id}`);
//       load();
//     } catch (err) {
//       console.error(err);
//       toast.error("تعذر رفض المهمة");
//     }
//   };

//   const renderCard = (t) => (
//     <div
//       key={t.id}
//       className="p-4 rounded-xl border border-white/10 bg-slate-900/40 backdrop-blur mb-4"
//     >
//       <h2 className="text-emerald-300 font-bold text-lg">
//         مهمة صيانة #{t.id}
//       </h2>

//       <p className="text-slate-300 text-sm mt-1">
//         <b>العقار:</b> {t.property?.title || `#${t.propertyId}`}
//       </p>

//       <p className="text-slate-300 text-sm">
//         <b>العميل:</b> {t.client?.fullName || "—"}
//       </p>

//       <p className="text-slate-300 text-sm">
//         <b>الوصف:</b> {t.description}
//       </p>

//       <p className="text-slate-300 text-sm">
//         <b>الأولوية:</b> {t.priority}
//       </p>

//       <div className="flex gap-3 mt-4">
//         <button
//           className="px-4 py-2 bg-emerald-500/20 text-emerald-300 border border-emerald-400 rounded-xl hover:bg-emerald-500/40 transition"
//           onClick={() => accept(t.id)}
//         >
//           قبول المهمة
//         </button>

//         <button
//           className="px-4 py-2 bg-red-500/20 text-red-300 border border-red-400 rounded-xl hover:bg-red-500/40 transition"
//           onClick={() => reject(t.id)}
//         >
//           رفض المهمة
//         </button>
//       </div>
//     </div>
//   );

//   return (
//     <section className="relative z-10 max-w-5xl mx-auto px-4 lg:px-0 py-10">
//       <div className="card-glass border border-white/10 rounded-2xl p-6 shadow-soft bg-black/30 backdrop-blur-xl">
//         <h1 className="text-3xl font-black bg-gradient-to-r from-emerald-300 to-cyan-300 bg-clip-text text-transparent">
//           مهامي كمورد
//         </h1>

//         <p className="text-slate-300 text-sm mt-1">
//           هنا تظهر جميع المهام التي قام الأدمن بتعيينها لك.
//         </p>

//         {loading ? (
//           <div className="text-center py-10 text-slate-400">
//             جاري التحميل…
//           </div>
//         ) : rows.length === 0 ? (
//           <div className="text-center py-10 text-slate-400">
//             لا يوجد مهام حالياً.
//           </div>
//         ) : (
//           rows.map(renderCard)
//         )}
//       </div>
//     </section>
//   );
// }


// src/pages/supplier/AcceptAssignments.jsx
import { useEffect, useState } from "react";
import PageHeader from "../../components/PageHeader.jsx";
import Card from "../../components/Card.jsx";
import { useToast } from "../../components/ToastProvider.jsx";
import api from "../../api/axios";

export default function AcceptAssignments() {
  const toast = useToast();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      const res = await api.get("/tickets/supplier/me");
      // نعرض هنا فقط التذاكر المفتوحة اللي بحاجة موافقة المورد
      const openTickets = (res.data || []).filter(
        (t) => t.status === "OPEN"
      );
      setRows(openTickets);
    } catch (err) {
      console.error(err);
      toast.error("تعذّر تحميل المهام الموكلة إليك");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const accept = async (id) => {
    try {
      await api.put(`/tickets/${id}/status/IN_PROGRESS`);
      await api.post(`/tickets/${id}/logs`, {
        action: "Supplier accepted assignment",
      });
      toast.success("تم قبول المهمة، يمكنك الآن إدخال التكاليف من صفحة 'ربط التكاليف'");
      load();
    } catch (err) {
      console.error(err);
      toast.error("فشل قبول المهمة");
    }
  };

  const reject = async (id) => {
    try {
      await api.put(`/tickets/${id}/status/CANCELLED`);
      await api.post(`/tickets/${id}/logs`, {
        action: "Supplier rejected assignment",
      });
      toast.info("تم رفض المهمة");
      load();
    } catch (err) {
      console.error(err);
      toast.error("فشل رفض المهمة");
    }
  };

  const formatDate = (d) =>
    d ? new Date(d).toLocaleString("ar-SY") : "غير محدد";

  return (
    <section className="relative z-10 max-w-6xl mx-auto px-4 lg:px-0 py-10">
      <PageHeader
        title="مهامي الموكلة"
        subtitle="هنا تظهر طلبات الصيانة التي عيّنتها الإدارة لك كمورد، يمكنك قبول أو رفض كل مهمة."
      />

      {loading ? (
        <Card className="p-4 mt-4 text-sm">جاري تحميل المهام…</Card>
      ) : rows.length === 0 ? (
        <Card className="p-6 mt-4 text-sm text-center">
          لا توجد حالياً مهام تحتاج لموافقتك.
        </Card>
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {rows.map((t) => (
            <Card key={t.id} className="flex flex-col gap-2 p-4">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-semibold text-base">
                  تذكرة #{t.id} – {t.category}
                </h3>
                <span className="text-xs px-2 py-1 rounded-full bg-amber-50 border border-amber-200">
                  أولوية: {t.priority}
                </span>
              </div>

              <p className="text-sm text-gray-700">
                <span className="font-medium">العقار:</span>{" "}
                {t.property?.title || "-"} – {t.property?.city || ""}
              </p>

              <p className="text-xs text-gray-500">
                تاريخ الإنشاء: {formatDate(t.createdAt)}
              </p>

              <p className="text-sm mt-1 line-clamp-3">
                {t.description || "لا يوجد وصف مفصل"}
              </p>

              <div className="mt-3 flex items-center justify-between gap-2">
                <button
                  onClick={() => accept(t.id)}
                  className="flex-1 px-3 py-1.5 rounded-lg text-sm bg-emerald-600 text-white hover:bg-emerald-700 transition"
                >
                  قبول المهمة
                </button>
                <button
                  onClick={() => reject(t.id)}
                  className="flex-1 px-3 py-1.5 rounded-lg text-sm border border-red-400 text-red-600 hover:bg-red-50 transition"
                >
                  رفض
                </button>
              </div>

              <p className="mt-2 text-[11px] text-gray-500">
                بعد قبول المهمة، انتقل إلى صفحة{" "}
                <span className="font-semibold">"ربط التكاليف"</span> لإدخال
                مصاريفك وربطها بالتذكرة.
              </p>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
