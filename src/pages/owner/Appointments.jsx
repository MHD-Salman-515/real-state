import { useEffect, useState } from "react";
import api from "../../api/axios";
import PageHeader from "../../components/PageHeader.jsx";
import Card from "../../components/Card.jsx";
import Toolbar from "../../components/Toolbar.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import StatusDot from "../../components/StatusDot.jsx";

export default function OwnerAppointments() {
  const { user } = useAuth();

  const [rows, setRows] = useState([]);
  const [allRows, setAllRows] = useState([]);
  const [statusFilter, setStatusFilter] = useState("ALL");

  // ===========================
  // تحميل المواعيد
  // ===========================
  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/appointments");
        const data = res.data || [];

        // فلترة حسب المالك
        const owned = data.filter(
          (app) => app.property?.ownerId === user?.id
        );

        // تجهيز البيانات للعرض
        const mapped = owned.map((app) => ({
          id: app.id,
          property: app.property?.title || "—",
          propertyId: app.property?.id,
          client: app.client?.name || "—",
          agent: app.agent?.name || "—",
          date: app.date?.slice(0, 10),
          time: app.date?.slice(11, 16),
          status: app.status,
        }));

        setAllRows(mapped);
        setRows(mapped);
      } catch (err) {
        console.error(err);
      }
    };

    load();
  }, [user]);

  // ===========================
  // فلترة حسب الحالة
  // ===========================
  const filterByStatus = (status) => {
    setStatusFilter(status);

    if (status === "ALL") return setRows(allRows);

    setRows(allRows.filter((r) => r.status === status));
  };

  const columns = [
    { key: "id", header: "#" },
    { key: "property", header: "العقار" },
    { key: "client", header: "العميل" },
    { key: "agent", header: "الموظف" },
    { key: "date", header: "التاريخ" },
    { key: "time", header: "الوقت" },
    {
      key: "status",
      header: "الحالة",
      render: (r) => <StatusDot label={r.status} />,
    },
  ];

  return (
    <>
      <PageHeader
        title="مواعيد المعاينة"
        subtitle="متابعة جميع مواعيد العملاء للعقارات الخاصة بك"
      />

      <Toolbar>
        <select
          className="px-3 py-2 border rounded-lg"
          value={statusFilter}
          onChange={(e) => filterByStatus(e.target.value)}
        >
          <option value="ALL">كل الحالات</option>
          <option value="PENDING">قيد الانتظار</option>
          <option value="CONFIRMED">تم التأكيد</option>
          <option value="DONE">مكتمل</option>
          <option value="CANCELLED">ملغي</option>
        </select>
      </Toolbar>

      <Card>
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="text-sm text-gray-500 border-b">
              {columns.map((col) => (
                <th key={col.key} className="px-4 py-2 text-start">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-4 text-gray-400">
                  لا توجد مواعيد حالياً
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="border-b">
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3">
                      {col.render ? col.render(r) : r[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>
    </>
  );
}
