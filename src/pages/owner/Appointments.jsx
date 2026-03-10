import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/appointments");
        const data = res.data || [];

        const owned = data.filter((app) => app.property?.ownerId === user?.id);

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
      render: (r) => (
        <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2.5 py-1">
          <StatusDot label={r.status} />
        </span>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="مواعيد المعاينة"
        subtitle="متابعة جميع مواعيد العملاء للعقارات الخاصة بك"
      />

      <Toolbar className="mb-4 rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-xl">
        <div className="flex w-full flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-300">الحالة</label>
            <select
              className="min-w-[180px] rounded-xl border border-white/10 bg-black/25 px-3 py-2 text-sm text-slate-100 outline-none transition duration-200 focus:border-white/15"
              value={statusFilter}
              onChange={(e) => filterByStatus(e.target.value)}
            >
              <option value="ALL">كل الحالات</option>
              <option value="PENDING">قيد الانتظار</option>
              <option value="CONFIRMED">تم التأكيد</option>
              <option value="DONE">مكتمل</option>
              <option value="CANCELLED">ملغي</option>
            </select>
          </div>

          <button
            type="button"
            className="self-start rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs text-slate-300 transition duration-200 hover:border-white/15 hover:text-white/90 md:self-auto"
            title="Refresh UI"
          >
            Refresh
          </button>
        </div>
      </Toolbar>

      {rows.length === 0 ? (
        <Card className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-xl">
          <h3 className="text-lg font-semibold text-white">لا توجد مواعيد حالياً</h3>
          <p className="mt-2 text-sm text-slate-300">
            لا توجد نتائج مطابقة للحالة المختارة حالياً.
          </p>
          <div className="mt-5">
            <Link
              to="/owner/properties"
              className="inline-flex rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white/90 transition duration-200 hover:bg-white/10"
            >
              الذهاب إلى العقارات
            </Link>
          </div>
        </Card>
      ) : (
        <Card className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl">
          <div className="border-b border-white/10 px-4 py-3 md:px-5">
            <h3 className="text-sm font-semibold text-white md:text-base">Appointments</h3>
            <p className="mt-1 text-xs text-slate-300 md:text-sm">
              Review scheduled visits and monitor their current status.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full table-auto border-collapse text-sm">
              <thead className="bg-[#0a1322]/95 backdrop-blur">
                <tr className="border-b border-white/10 text-slate-300">
                  {columns.map((col) => (
                    <th key={col.key} className="px-4 py-3 text-start text-xs font-semibold tracking-wide">
                      {col.header}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-b border-white/5 transition duration-200 hover:bg-white/5">
                    {columns.map((col) => (
                      <td key={col.key} className="px-4 py-3 text-slate-100">
                        {col.render ? col.render(r) : r[col.key]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </>
  );
}
