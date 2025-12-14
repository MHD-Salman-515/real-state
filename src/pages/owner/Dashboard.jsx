import { useEffect, useState } from "react";
import api from "../../api/axios";
import PageHeader from "../../components/PageHeader.jsx";
import Card from "../../components/Card.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

export default function OwnerDashboard() {
  const { user } = useAuth();

  const [stats, setStats] = useState({
    props: 0,
    appts: 0,
    pending: 0,
    confirmed: 0,
    done: 0,
    today: 0,
  });

  const [topProperty, setTopProperty] = useState(null);
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        // تحميل العقارات
        const propsRes = await api.get("/properties");
        const allProps = propsRes.data || [];

        const ownedProps = allProps.filter((p) => p.ownerId === user.id);

        // تحميل المواعيد
        const apptsRes = await api.get("/appointments");
        const allAppts = apptsRes.data || [];

        const ownedAppts = allAppts.filter(
          (app) => app.property?.ownerId === user.id
        );

        // ================================
        // حساب الإحصائيات
        // ================================
        const byStatus = {
          pending: 0,
          confirmed: 0,
          done: 0,
        };

        const todayStr = new Date().toISOString().slice(0, 10);
        let todayCount = 0;

        ownedAppts.forEach((a) => {
          if (byStatus[a.status.toLowerCase()] !== undefined) {
            byStatus[a.status.toLowerCase()]++;
          }
          if (a.date?.slice(0, 10) === todayStr) todayCount++;
        });

        setStats({
          props: ownedProps.length,
          appts: ownedAppts.length,
          pending: byStatus.pending,
          confirmed: byStatus.confirmed,
          done: byStatus.done,
          today: todayCount,
        });

        // ================================
        // أكثر عقار يحتوي مواعيد
        // ================================
        const counts = {};

        ownedAppts.forEach((a) => {
          const pid = a.propertyId;
          counts[pid] = (counts[pid] || 0) + 1;
        });

        let maxProp = null;
        let maxCount = 0;

        Object.entries(counts).forEach(([pid, count]) => {
          if (count > maxCount) {
            maxCount = count;
            maxProp = ownedProps.find((p) => p.id === Number(pid));
          }
        });

        setTopProperty(
          maxProp
            ? {
              title: maxProp.title,
              count: maxCount,
            }
            : null
        );

        // ================================
        // آخر 5 مواعيد
        // ================================
        const recentList = ownedAppts
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5)
          .map((a) => ({
            id: a.id,
            property: a.property?.title || "—",
            client: a.client?.name || "—",
            date: a.date?.slice(0, 10),
            time: a.date?.slice(11, 16),
            status: a.status,
          }));

        setRecent(recentList);
      } catch (err) {
        console.error(err);
      }
    };

    load();
  }, [user]);

  return (
    <>
      <PageHeader
        title="اللوحة الرئيسية"
        subtitle="نظرة عامة على نشاط عقاراتك"
      />

      {/* ====== الإحصائيات ====== */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <CardStat label="إجمالي العقارات" value={stats.props} color="text-blue-600" />
        <CardStat label="إجمالي المواعيد" value={stats.appts} color="text-purple-600" />
        <CardStat label="مواعيد اليوم" value={stats.today} color="text-orange-600" />
        <CardStat label="قيد الانتظار" value={stats.pending} color="text-red-600" />
        <CardStat label="تم التأكيد" value={stats.confirmed} color="text-green-600" />
        <CardStat label="مكتمل" value={stats.done} color="text-gray-700" />
      </div>

      {/* ====== أكثر عقار طلباً ====== */}
      {topProperty && (
        <Card className="mb-6 p-4">
          <h3 className="font-bold text-lg mb-2">أكثر عقار تمت معاينته</h3>
          <p className="text-sm text-gray-600">العقار: {topProperty.title}</p>
          <p className="text-sm text-gray-600">عدد المواعيد: {topProperty.count}</p>
        </Card>
      )}

      {/* ====== آخر المواعيد ====== */}
      <Card className="p-4">
        <h3 className="font-bold text-lg mb-3">آخر المواعيد</h3>

        {recent.length === 0 ? (
          <p className="text-gray-500">لا توجد مواعيد حديثة.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-gray-500">
                <th className="py-2 text-start">#</th>
                <th className="py-2 text-start">العقار</th>
                <th className="py-2 text-start">العميل</th>
                <th className="py-2 text-start">التاريخ</th>
                <th className="py-2 text-start">الوقت</th>
                <th className="py-2 text-start">الحالة</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((r) => (
                <tr key={r.id} className="border-b">
                  <td className="py-2">{r.id}</td>
                  <td className="py-2">{r.property}</td>
                  <td className="py-2">{r.client}</td>
                  <td className="py-2">{r.date}</td>
                  <td className="py-2">{r.time}</td>
                  <td className="py-2">{r.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </>
  );
}

function CardStat({ label, value, color }) {
  return (
    <Card className="p-4">
      <div className="text-sm text-gray-600">{label}</div>
      <div className={`text-3xl font-bold ${color}`}>{value}</div>
    </Card>
  );
}
