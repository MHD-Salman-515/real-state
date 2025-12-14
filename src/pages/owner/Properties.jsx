import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import PageHeader from "../../components/PageHeader.jsx";
import Toolbar from "../../components/Toolbar.jsx";
import Card from "../../components/Card.jsx";
import Table from "../../components/Table.jsx";
import { useToast } from "../../components/ToastProvider.jsx";
import NotificationBell from "../../components/NotificationBell.jsx";

import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext.jsx";

export default function OwnerProperties() {
  const toast = useToast();
  const nav = useNavigate();
  const { user } = useAuth();

  const [rows, setRows] = useState([]);
  const [allRows, setAllRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================
  // تحميل العقارات من الباك
  // =========================
  useEffect(() => {
    const fetchProps = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await api.get("/properties");
        const all = res.data || [];

        // فلترة حسب مالك العقار الحالي
        const owned = user?.id
          ? all.filter((p) => p.ownerId === user.id)
          : all;

        // **💎 تحويل الداتا بالشكل الصحيح**
        const mapped = owned.map((p) => ({
          id: p.id,
          title: p.title || "بدون عنوان",
          city: p.city || "",
          address: p.address || "",
          type: p.type || "",
          area: p.area ?? "",
          price: p.price ?? 0,
          listed: p.createdAt ? String(p.createdAt).slice(0, 10) : "",
        }));

        setAllRows(mapped);
        setRows(mapped);
      } catch (err) {
        console.error(err);
        setError("فشل تحميل العقارات من الخادم");
        toast.error("تعذر تحميل عقاراتك");
      } finally {
        setLoading(false);
      }
    };

    fetchProps();
  }, [user?.id]);

  const handleAdd = () => nav("/owner/properties/new");

  const handleEdit = (id) => {
    nav(`/owner/properties/${id}/edit`);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا العقار؟")) {
      toast.info("تم إلغاء الحذف");
      return;
    }

    try {
      await api.delete(`/properties/${id}`);
      setRows((prev) => prev.filter((r) => r.id !== id));
      setAllRows((prev) => prev.filter((r) => r.id !== id));
      toast.error(`تم حذف العقار (${id})`);
    } catch (err) {
      console.error(err);
      toast.error("تعذر حذف العقار من الخادم");
    }
  };

  // =========================
  // أعمدة الجدول بعد التعديل
  // =========================
  const columns = [
    { key: "id", header: "المعرّف" },
    { key: "title", header: "العنوان" },
    { key: "city", header: "المدينة" },
    { key: "address", header: "العنوان التفصيلي" },
    { key: "type", header: "النوع" },
    { key: "area", header: "المساحة (م²)" },
    {
      key: "price",
      header: "السعر ($)",
      render: (r) => Number(r.price || 0).toLocaleString(),
    },
    { key: "listed", header: "مضاف بتاريخ" },
    {
      key: "image",
      header: "الصورة",
      render: (r) => (
        <img
          src={
            r.image
              ? `http://localhost:3000${r.image}`
              : "https://via.placeholder.com/80x60?text=No+Image"
          }
          className="w-20 h-16 object-cover rounded border"
          alt="Property"
        />
      ),
    },

    {
      key: "act",
      header: "إجراء",
      render: (r) => (
        <div className="flex items-center gap-2">
          <button
            className="px-2 py-1 text-sm rounded-lg border hover:bg-green-50"
            onClick={() => handleEdit(r.id)}
          >
            تعديل
          </button>
          <button
            className="px-2 py-1 text-sm rounded-lg border text-red-600 hover:bg-red-50"
            onClick={() => handleDelete(r.id)}
          >
            حذف
          </button>
        </div>
      ),
    },
  ];

  const handleSearch = (q) => {
    const query = q.toLowerCase().trim();
    if (!query) return setRows(allRows);

    setRows(
      allRows.filter(
        (r) =>
          r.title.toLowerCase().includes(query) ||
          r.city.toLowerCase().includes(query) ||
          (r.address || "").toLowerCase().includes(query)
      )
    );
  };

  // =========================
  // Render
  // =========================

  if (loading)
    return (
      <>
        <PageHeader
          title="عقاراتي"
          subtitle="جاري تحميل العقارات..."
          actions={<NotificationBell />}
        />
        <Card className="p-4 mt-4 text-sm">جاري التحميل…</Card>
      </>
    );

  if (error)
    return (
      <>
        <PageHeader
          title="عقاراتي"
          subtitle="حدث خطأ أثناء تحميل العقارات"
          actions={<NotificationBell />}
        />
        <Card className="p-4 mt-4 text-sm text-red-300">{error}</Card>
      </>
    );

  return (
    <>
      <PageHeader
        title="عقاراتي"
        subtitle="إدارة العقارات المسجّلة بملكيتك"
        actions={
          <div className="flex items-center gap-2">
            <NotificationBell />
            <button
              className="px-3 py-2 rounded-lg bg-green-600 text-white"
              onClick={handleAdd}
            >
              + عقار
            </button>
          </div>
        }
      />

      <Toolbar>
        <input
          className="px-3 py-2 border rounded-lg"
          placeholder="ابحث بالعنوان أو المدينة"
          onChange={(e) => handleSearch(e.target.value)}
        />
      </Toolbar>

      <Card>
        <Table
          columns={columns}
          rows={rows}
          emptyText="لا توجد عقارات حالياً"
        />
      </Card>
    </>
  );
}
