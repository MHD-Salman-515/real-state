import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageHeader from "../../components/PageHeader.jsx";
import Card from "../../components/Card.jsx";
import { useToast } from "../../components/ToastProvider.jsx";
import api from "../../api/axios.js";

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

      toast.success("تم إنشاء تذكرة الصيانة بنجاح 🎉");
      navigate("/client/tickets");
    } catch (err) {
      console.error(err);
      toast.error("فشل إنشاء التذكرة، حاول مرة أخرى.");
    } finally {
      setLoading(false);
    }
  };
  console.log("CreateTicket Mounted");

  return (
    <section className="max-w-2xl mx-auto space-y-4 py-6">
      <PageHeader
        title="إنشاء تذكرة صيانة"
        subtitle="أخبرنا عن المشكلة في هذا العقار ليتم متابعتها من قبل الفريق الفني."
      />

      <Card className="p-4 space-y-4">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs mb-1">رقم العقار</label>
            <input
              type="text"
              className="input bg-slate-900/40"
              value={propertyId || ""}
              disabled
            />
          </div>

          <div>
            <label className="block text-xs mb-1">نوع العطل</label>
            <input
              name="category"
              className="input"
              placeholder="مثال: تسريب مياه في الحمام"
              value={form.category}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-xs mb-1">الأولوية</label>
            <select
              name="priority"
              className="input"
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
              className="input min-h-[120px]"
              placeholder="اشرح المشكلة بتفاصيل واضحة ليسهل على الفني التحضير لها..."
              value={form.description}
              onChange={handleChange}
            />
          </div>

          <div className="flex justify-end">
            <button className="btn-primary" disabled={loading}>
              {loading ? "جاري الإرسال..." : "إرسال التذكرة"}
            </button>
          </div>
        </form>
      </Card>
    </section>
  );
}
