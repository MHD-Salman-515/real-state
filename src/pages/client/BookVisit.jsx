// src/pages/client/BookVisit.jsx
import { useEffect, useState } from "react";
import { useToast } from "../../components/ToastProvider.jsx";
import { store } from "../../lib/clientStore.js";

export default function BookVisit() {
  const toast = useToast();
  const [draft, setDraft] = useState({ propId: "", when: "", note: "" });

  useEffect(() => {
    const d = store.getDraft();
    if (d) setDraft(d);
  }, []);

  const update = (patch) => {
    const d = { ...draft, ...patch };
    setDraft(d);
    store.saveDraft(d);
  };

  const clearDraft = () => {
    store.clearDraft();
    setDraft({ propId: "", when: "", note: "" });
    toast.info("تم مسح المسودة");
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!draft.propId || !draft.when) {
      toast.warning("الرجاء تعبئة رقم العقار والتاريخ/الوقت");
      return;
    }

    try {
     const raw = localStorage.getItem("auth_user_v1");

      if (!raw) {
        toast.error("يجب تسجيل الدخول أولاً");
        return;
      }

      const user = raw ? JSON.parse(raw) : null;


      const payload = {
        clientId: user.id,
        propertyId: Number(draft.propId),
        // agentId: 1,
        date: new Date(draft.when).toISOString(),
        status: "PENDING",
        notes: draft.note || "",
      };

      const res = await fetch("http://localhost:3000/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Server Error");

      const created = await res.json();

      let whenNice = draft.when;
      try {
        whenNice = new Date(draft.when).toLocaleString("ar-SY");
      } catch {}

      window.dispatchEvent(
        new CustomEvent("notify:add", {
          detail: {
            text: `تم تسجيل موعد معاينة للعقار رقم ${draft.propId} في ${whenNice}. رقم الموعد: ${created.id}`,
            scope: "client",
            from: "client",
          },
        })
      );

      store.clearDraft();
      setDraft({ propId: "", when: "", note: "" });
      toast.success("تم إرسال طلب المعاينة بنجاح ✔️");

      setTimeout(() => {
       window.location.href = "/";

      }, 600);

    } catch (err) {
      toast.error("فشل حفظ الموعد — تحقق من الاتصال بالسيرفر");
    }
  };

  const inputCls =
    "w-full rounded-xl bg-slate-950/70 border border-white/15 " +
    "px-3 py-2.5 text-sm text-slate-100 placeholder-slate-500 " +
    "focus:outline-none focus:ring-2 focus:ring-emerald-500/70 focus:border-transparent";

  return (
    <section className="relative z-10 max-w-3xl mx-auto px-4 lg:px-0 py-10">
      <div className="card-glass border border-white/15 rounded-2xl p-5 md:p-6 shadow-soft">
        <div className="mb-6 space-y-2">
          <h1 className="text-2xl md:text-3xl font-black tracking-tight">
            حجز معاينة
          </h1>
          <p className="text-sm text-slate-300">
            اختر العقار، حدّد الوقت المناسب، وأضف ملاحظاتك. سيتم حفظ المدخلات تلقائياً كمسودة.
          </p>
        </div>

        <form onSubmit={onSubmit} className="grid md:grid-cols-2 gap-4 md:gap-5">
          <div className="md:col-span-1">
            <label className="block text-xs text-slate-400 mb-1.5">
              معرّف العقار
            </label>
            <input
              className={inputCls}
              placeholder="مثال: 102 أو 5"
              value={draft.propId}
              onChange={(e) => update({ propId: e.target.value })}
            />
          </div>

          <div className="md:col-span-1">
            <label className="block text-xs text-slate-400 mb-1.5">
              التاريخ والوقت
            </label>
            <input
              type="datetime-local"
              className={inputCls + " [color-scheme:dark]"}
              value={draft.when}
              onChange={(e) => update({ when: e.target.value })}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs text-slate-400 mb-1.5">
              ملاحظات إضافية (اختياري)
            </label>
            <textarea
              rows={3}
              className={inputCls + " resize-none"}
              placeholder="أي تفاصيل تهمك..."
              value={draft.note}
              onChange={(e) => update({ note: e.target.value })}
            />
          </div>

          <div className="md:col-span-2 flex flex-wrap items-center gap-3 pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-emerald-500 text-sm font-semibold text-black shadow-lg shadow-emerald-500/40 hover:bg-emerald-400 transition"
            >
              إرسال طلب المعاينة
            </button>

            <button
              type="button"
              onClick={clearDraft}
              className="px-4 py-2.5 rounded-xl border border-slate-500/60 text-sm text-slate-200 hover:bg-white/5 transition"
            >
              مسح المسودة
            </button>

            {(draft.propId || draft.when || draft.note) && (
              <span className="text-[11px] text-slate-400">
                ✅ يتم حفظ بياناتك كمسودة تلقائياً.
              </span>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}
