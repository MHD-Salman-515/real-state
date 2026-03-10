import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageHeader from "../../components/PageHeader.jsx";
import Card from "../../components/Card.jsx";
import { useToast } from "../../components/ToastProvider.jsx";
import api from "../../api/axios.js";
import { notifyCrudError, notifyCrudSuccess } from "../../utils/notify.js";

export default function CreateTicket() {
  const { id } = useParams(); // رقم العقار من الـ URL
  const propertyId = Number(id);
  const toast = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    category: "",
    priority: "MEDIUM",
    description: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!propertyId) {
      return toast.error("خطأ في رقم العقار، الرجاء العودة للمحاولة مجدداً.");
    }
    if (!form.category || !form.description) {
      return toast.error("الرجاء إدخال نوع العطل ووصف المشكلة.");
    }

    try {
      setLoading(true);
      await api.post("/tickets", {
        propertyId,
        category: form.category,
        description: form.description,
        priority: form.priority,
      });

      notifyCrudSuccess("Maintenance ticket created");
      navigate("/client/tickets");
    } catch (err) {
      console.error(err);
      notifyCrudError("Failed to create maintenance ticket");
    } finally {
      setLoading(false);
    }
  };
  return (
    <section className="relative z-10 max-w-3xl mx-auto px-4 lg:px-0 py-10 space-y-6">
      <PageHeader
        title="إنشاء تذكرة صيانة"
        subtitle="أخبرنا عن المشكلة في هذا العقار ليتم متابعتها من قبل الفريق الفني."
      />

      <Card className="p-5 md:p-6 space-y-5">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs mb-1">رقم العقار</label>
            <input
              type="text"
              className="input bg-slate-950/70 border-white/15 text-slate-100 [color-scheme:dark]"
              value={propertyId || ""}
              disabled
            />
          </div>

          <div>
            <label className="block text-xs mb-1">نوع العطل</label>
            <input
              name="category"
              className="input bg-slate-950/70 border-white/15 text-slate-100 placeholder-slate-500 focus:ring-white/30 focus:border-transparent"
              placeholder="مثال: تسريب مياه في الحمام"
              value={form.category}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-xs mb-1">الأولوية</label>
            <select
              name="priority"
              className="input bg-slate-950/70 border-white/15 text-slate-100 focus:ring-white/30 focus:border-transparent [color-scheme:dark]"
              value={form.priority}
              onChange={handleChange}
            >
              <option value="HIGH">عالية</option>
              <option value="MEDIUM">متوسطة</option>
              <option value="LOW">منخفضة</option>
            </select>
          </div>

          <div>
            <label className="block text-xs mb-1">وصف المشكلة</label>
            <textarea
              name="description"
              className="input min-h-[120px] bg-slate-950/70 border-white/15 text-slate-100 placeholder-slate-500 focus:ring-white/30 focus:border-transparent resize-none"
              placeholder="اشرح المشكلة بتفاصيل واضحة ليسهل على الفني التحضير لها..."
              value={form.description}
              onChange={handleChange}
            />
          </div>

          <div className="flex justify-end">
            <button className="btn-primary bg-white/10 text-black hover:bg-white/10 shadow-lg shadow-white/10" disabled={loading}>
              {loading ? "جاري الإرسال..." : "إرسال التذكرة"}
            </button>
          </div>
        </form>
      </Card>
    </section>
  );
}
