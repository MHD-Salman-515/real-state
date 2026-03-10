// src/pages/client/BookVisit.jsx
import { useEffect, useState } from "react";
import { useToast } from "../../components/ToastProvider.jsx";
import { store } from "../../lib/clientStore.js";
import { notifyCrudError, notifyCrudSuccess } from "../../utils/notify.js";
import { buildApiUrl } from "../../api/axios";
import { useNotifications } from "@/components/notifications/useNotifications";

export default function BookVisit() {
  const toast = useToast();
  const { notify } = useNotifications();
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
        date: new Date(draft.when).toISOString(),
        status: "PENDING",
        notes: draft.note || "",
      };

      const res = await fetch(buildApiUrl("/appointments"), {
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

      notifyCrudSuccess(
        `Visit appointment created for property #${draft.propId} at ${whenNice} (ID: ${created.id})`
      );
      notify({
        type: "system",
        title: "Visit requested",
        message: "Your visit request was sent successfully.",
      });

      store.clearDraft();
      setDraft({ propId: "", when: "", note: "" });

      setTimeout(() => {
        window.location.href = "/";
      }, 600);
    } catch (err) {
      notifyCrudError("Failed to create visit appointment");
    }
  };

  const inputCls =
    "w-full rounded-xl bg-slate-950/70 border border-white/15 " +
    "px-3 py-2.5 text-sm text-slate-100 placeholder-slate-500 " +
    "focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent";

  return (
    <section className="relative z-10 max-w-3xl mx-auto px-4 lg:px-0 py-10">
      <div className="card-glass border border-white/15 rounded-2xl p-5 md:p-6 shadow-soft bg-black/30 backdrop-blur-xl">
        <div className="mb-6 space-y-2">
          <h1 className="text-2xl md:text-3xl font-black tracking-tight">حجز معاينة</h1>
          <p className="text-sm text-slate-300">
            اختر العقار، حدّد الوقت المناسب، وأضف ملاحظاتك. سيتم حفظ المدخلات تلقائياً كمسودة.
          </p>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-2 text-[11px] sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-slate-200">
            <span className="mr-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-white/90">
              1
            </span>
            Select property
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-slate-200">
            <span className="mr-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-white/90">
              2
            </span>
            Pick time
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-slate-200">
            <span className="mr-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-white/90">
              3
            </span>
            Submit request
          </div>
        </div>

        <div className="hidden mb-6 grid grid-cols-3 gap-2 text-[11px]">
          <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-slate-200">
            <span className="mr-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-white/90">
              1
            </span>
            Ø§Ø®ØªØ± Ø§Ù„Ø¹Ù‚Ø§Ø±
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-slate-200">
            <span className="mr-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-white/90">
              2
            </span>
            Ø­Ø¯Ø¯ Ø§Ù„ÙˆÙ‚Øª
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-slate-200">
            <span className="mr-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-white/90">
              3
            </span>
            Ø£Ø±Ø³Ù„ Ø§Ù„Ø·Ù„Ø¨
          </div>
        </div>

        <form onSubmit={onSubmit} className="grid md:grid-cols-2 gap-4 md:gap-5">
          <div className="md:col-span-1">
            <label className="block text-xs text-slate-400 mb-1.5">معرّف العقار</label>
            <input
              className={inputCls}
              placeholder="مثال: 102 أو 5"
              value={draft.propId}
              onChange={(e) => update({ propId: e.target.value })}
            />
          </div>

          <div className="md:col-span-1">
            <label className="block text-xs text-slate-400 mb-1.5">التاريخ والوقت</label>
            <input
              type="datetime-local"
              className={inputCls + " [color-scheme:dark]"}
              value={draft.when}
              onChange={(e) => update({ when: e.target.value })}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs text-slate-400 mb-1.5">ملاحظات إضافية (اختياري)</label>
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
              className="px-5 py-2.5 rounded-xl bg-white/10 text-sm font-semibold text-black shadow-lg shadow-white/10 hover:bg-white/10 transition"
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
              <span className="text-[11px] text-slate-400">يتم حفظ بياناتك كمسودة تلقائياً.</span>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}
