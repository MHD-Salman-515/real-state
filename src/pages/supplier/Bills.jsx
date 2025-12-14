// // src/pages/supplier/Bills.jsx
// import { useEffect, useState } from "react";
// import PageHeader from "../../components/PageHeader.jsx";
// import Card from "../../components/Card.jsx";
// import Table from "../../components/Table.jsx";
// import api from "../../api/axios.js";

// export default function Bills() {
//   const [rows, setRows] = useState([]);

//   useEffect(() => {
//     api.get("/expenses/my").then((res) => setRows(res.data));
//   }, []);

//   const columns = [
//     {
//       key: "ticket",
//       header: "تذكرة الصيانة",
//       render: (r) => (r.ticket ? `T-${r.ticket.id}` : "—"),
//     },
//     {
//       key: "property",
//       header: "العقار",
//       render: (r) =>
//         r.ticket && r.ticket.property
//           ? r.ticket.property.title
//           : "—",
//     },
//     { key: "description", header: "الوصف" },
//     {
//       key: "amount",
//       header: "المبلغ",
//       render: (r) => `${r.amount.toFixed(2)} $`,
//     },
//     {
//       key: "invoice",
//       header: "الفاتورة",
//       render: (r) =>
//         r.invoice
//           ? `فاتورة #${r.invoice.id} — ${r.invoice.status}`
//           : "لم تُصدر بعد",
//     },
//     { key: "expenseDate", header: "التاريخ" },
//   ];

//   return (
//     <section className="space-y-4">
//       <PageHeader
//         title="مصاريف الصيانة الخاصة بي"
//         subtitle="عرض جميع تكاليف الصيانة المرتبطة بالتذاكر، مع حالة الفاتورة إن وُجدت."
//       />
//       <Card>
//         <Table
//           columns={columns}
//           rows={rows}
//           emptyText="لا توجد مصاريف مسجلة حتى الآن."
//         />
//       </Card>
//     </section>
//   );
// }


// src/pages/supplier/Bills.jsx
import { useEffect, useMemo, useState } from "react";
import PageHeader from "../../components/PageHeader.jsx";
import Card from "../../components/Card.jsx";
import Table from "../../components/Table.jsx";
import { useToast } from "../../components/ToastProvider.jsx";
import api from "../../api/axios";

export default function Bills() {
  const toast = useToast();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      const res = await api.get("/expenses/my");
      setRows(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error("تعذّر تحميل مصاريفك");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const data = useMemo(
    () =>
      (rows || []).map((e) => {
        const propertyTitle = e.ticket?.property?.title || "-";
        const propertyCity = e.ticket?.property?.city || "";
        const ticketLabel = `#${e.ticketId || (e.ticket && e.ticket.id) || "?"}`;

        const invoiceStatus = e.invoice
          ? `#${e.invoice.id} – ${e.invoice.status}`
          : "بانتظار إصدار الفاتورة من المحاسب";

        return {
          id: e.id,
          ticket: `${ticketLabel} – ${propertyTitle} ${propertyCity}`,
          amount: e.amount,
          expenseDate: e.expenseDate
            ? new Date(e.expenseDate).toLocaleDateString("ar-SY")
            : "",
          description: e.description || "",
          invoiceInfo: invoiceStatus,
        };
      }),
    [rows]
  );

  const columns = [
    { key: "id", header: "ID" },
    { key: "ticket", header: "التذكرة / العقار" },
    {
      key: "amount",
      header: "المبلغ",
      render: (r) => Number(r.amount || 0).toLocaleString(),
    },
    { key: "expenseDate", header: "تاريخ المصروف" },
    { key: "description", header: "الوصف" },
    { key: "invoiceInfo", header: "حالة الفاتورة" },
  ];

  return (
    <section className="relative z-10 max-w-6xl mx-auto px-4 lg:px-0 py-10">
      <PageHeader
        title="مصاريفي وفواتيري"
        subtitle="جميع المصاريف التي سجّلتها على التذاكر، مع حالة الفاتورة لكل مصروف."
      />

      {loading ? (
        <Card className="p-4 mt-4 text-sm">جارِ تحميل البيانات…</Card>
      ) : data.length === 0 ? (
        <Card className="p-6 mt-4 text-sm text-center">
          لم تقم بإضافة أي مصاريف بعد.
          <div className="mt-2 text-xs text-gray-500">
            ابدأ من صفحة <span className="font-semibold">"ربط التكاليف"</span>{" "}
            لإضافة مصاريف مرتبطة بتذاكر الصيانة التي تعمل عليها.
          </div>
        </Card>
      ) : (
        <Card className="mt-6">
          <Table columns={columns} rows={data} />
        </Card>
      )}
    </section>
  );
}
