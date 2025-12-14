import { useEffect, useState, useMemo } from "react";
import PageHeader from "../../components/PageHeader.jsx";
import Card from "../../components/Card.jsx";
import { useToast } from "../../components/ToastProvider.jsx";
import api from "../../api/axios";

export default function CostLink() {
  const toast = useToast();
  const [tickets, setTickets] = useState([]);
  const [loadingTickets, setLoadingTickets] = useState(true);

  const [form, setForm] = useState({
    ticketId: "",
    amount: "",
    description: "",
  });
  const [submitting, setSubmitting] = useState(false);

  // 🎨 كلاس موحّد لعناصر الإدخال / القائمة / التكس تريا
  const baseFieldClass =
    "w-full px-3 py-2 text-sm rounded-xl " +
    "bg-emerald-900/20 text-emerald-100 " +
    "border border-emerald-500/40 " +
    "placeholder-slate-500 " +
    "focus:outline-none focus:ring-2 focus:ring-emerald-400/60 focus:border-emerald-300 " +
    "transition";

  const selectClass = baseFieldClass;
  const inputClass = baseFieldClass;
  const textareaClass = baseFieldClass + " resize-none";

  const optionClass = "bg-slate-900 text-emerald-100";

  const loadTickets = async () => {
    try {
      setLoadingTickets(true);
      const res = await api.get("/tickets/supplier/me");
      const data = res.data || [];
      // نسمح بإضافة تكاليف فقط للتذاكر المقبولة / قيد التنفيذ / المكتملة
      const valid = data.filter((t) =>
        ["IN_PROGRESS", "COMPLETED"].includes(t.status)
      );
      setTickets(valid);
    } catch (err) {
      console.error(err);
      toast.error("تعذّر تحميل التذاكر المرتبطة بك");
    } finally {
      setLoadingTickets(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.ticketId) {
      toast.error("الرجاء اختيار تذكرة");
      return;
    }
    if (!form.amount || isNaN(form.amount)) {
      toast.error("الرجاء إدخال مبلغ صحيح");
      return;
    }

    const payload = {
      ticketId: Number(form.ticketId),
      amount: Number(form.amount),
      description: form.description?.trim() || "",
    };

    try {
      setSubmitting(true);
      await api.post("/expenses", payload);
      toast.success("تم تسجيل المصروف وربطه بالتذكرة بنجاح");

      setForm({
        ticketId: "",
        amount: "",
        description: "",
      });
    } catch (err) {
      console.error(err);
      toast.error("فشل تسجيل المصروف");
    } finally {
      setSubmitting(false);
    }
  };

  const ticketOptions = useMemo(
    () =>
      tickets.map((t) => ({
        id: t.id,
        label: `#${t.id} – ${t.property?.title || "عقار"} – ${t.category}`,
      })),
    [tickets]
  );

  return (
    <section className="relative z-10 max-w-xl mx-auto px-4 lg:px-0 py-10">
      <PageHeader
        title="ربط التكاليف بالتذاكر"
        subtitle="سجّل مصاريفك (مواد، أجور، إلخ) واربطها بكل تذكرة صيانة. سيتمكن المحاسب لاحقاً من اعتماد هذه المصاريف وإصدار الفاتورة."
      />

      <Card className="mt-6 p-6 bg-slate-900/60 border border-white/10">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* اختيار التذكرة */}
          <div>
            <label className="block mb-1 text-sm font-medium text-slate-100">
              التذكرة المرتبطة بالمصروف
            </label>
            {loadingTickets ? (
              <p className="text-xs text-slate-400">جارِ تحميل التذاكر…</p>
            ) : ticketOptions.length === 0 ? (
              <p className="text-xs text-slate-400">
                لا توجد تذاكر مقبولة أو قيد التنفيذ مرتبطة بك كمورد.
              </p>
            ) : (
              <select
                name="ticketId"
                value={form.ticketId}
                onChange={handleChange}
                className={selectClass}
              >
                <option className={optionClass} value="">
                  اختر تذكرة…
                </option>
                {ticketOptions.map((t) => (
                  <option key={t.id} className={optionClass} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* مبلغ المصروف */}
          <div>
            <label className="block mb-1 text-sm font-medium text-slate-100">
              مبلغ المصروف (بالدولار أو العملة المتفق عليها)
            </label>
            <input
              type="number"
              name="amount"
              value={form.amount}
              onChange={handleChange}
              className={inputClass}
              min="0"
              step="0.01"
              placeholder="مثال: 150"
            />
          </div>

          {/* وصف المصروف */}
          <div>
            <label className="block mb-1 text-sm font-medium text-slate-100">
              وصف المصروف
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              className={textareaClass}
              rows={3}
              placeholder="مثال: شراء أنابيب وقطع تبديل + أجور العمال المساعدين"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={
                submitting || loadingTickets || ticketOptions.length === 0
              }
              className="
                px-4 py-2 rounded-xl text-sm 
                bg-emerald-500 text-slate-950 
                hover:bg-emerald-400 
                disabled:opacity-60 disabled:cursor-not-allowed
                font-semibold shadow-md shadow-emerald-500/30
                transition
              "
            >
              {submitting ? "جارِ الحفظ…" : "حفظ المصروف"}
            </button>
          </div>
        </form>

        <p className="mt-3 text-[11px] text-slate-400">
          بعد تسجيل المصاريف، سيتمكن قسم المحاسبة من مراجعتها وربطها بفواتير
          المورد. يمكنك متابعة حالة المصاريف من صفحة{" "}
          <span className="font-semibold text-emerald-300">
            "فواتيري / Bills"
          </span>
          .
        </p>
      </Card>
    </section>
  );
}
