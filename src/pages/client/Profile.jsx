// src/pages/client/Profile.jsx
import { useEffect, useState } from "react";
import { useToast } from "../../components/ToastProvider.jsx";

export default function Profile() {
  const toast = useToast();
  const [me, setMe] = useState({ fullName: "", phone: "" });
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    // تحميل بيانات المستخدم من localStorage
    const raw = localStorage.getItem("auth_user_v1");
    if (raw) {
      const u = JSON.parse(raw);
      setUserId(u.id); // ضرورية لـ PATCH /users/:id

      setMe({
        fullName: u.fullName || "",
        phone: u.phone || "",
      });
    }
  }, []);

  const save = async () => {
    if (!me.fullName.trim()) {
      return toast.warning("أدخل الاسم الكامل");
    }

    if (!userId) {
      return toast.error("حدث خطأ: لم يتم العثور على رقم المستخدم");
    }

    try {
      setLoading(true);

      const token = localStorage.getItem("auth_token_v1");
      if (!token) {
        toast.error("يجب تسجيل الدخول أولاً");
        return;
      }

      // 🔥 إرسال التعديل إلى الباك باستخدام /users/:id
     const res = await fetch(`http://localhost:3000/users/${userId}`, {
  method: "PUT", // 👈 كانت PATCH
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({
    fullName: me.fullName,
    phone: me.phone,
  }),
});

      if (!res.ok) throw new Error("Server Error");

      const updated = await res.json();

      // 🔁 تحديث نسخة اليوزر في localStorage
      localStorage.setItem("auth_user_v1", JSON.stringify(updated));

      toast.success("تم حفظ الملف الشخصي بنجاح ✔️");

      // إشعار في الجرس
      try {
        window.dispatchEvent(
          new CustomEvent("notify:add", {
            detail: {
              text: `تم تحديث بيانات المستخدم: ${me.fullName}`,
            },
          })
        );
      } catch {}

    } catch (err) {
      toast.error("فشل تحديث الملف الشخصي");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setMe({ fullName: "", phone: "" });
    toast.info("تمت إعادة ضبط الحقول");
  };

  const inputCls =
    "w-full rounded-xl bg-slate-950/70 border border-white/15 " +
    "px-3 py-2.5 text-sm text-slate-100 placeholder-slate-500 " +
    "focus:outline-none focus:ring-2 focus:ring-emerald-500/70 focus:border-transparent";

  return (
    <section className="relative z-10 max-w-3xl mx-auto px-4 lg:px-0 py-10">
      <div className="card-glass border border-white/15 rounded-2xl p-5 md:p-6 shadow-soft space-y-5">

        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-black tracking-tight">
            الملف الشخصي
          </h1>
          <p className="text-sm text-slate-300">
            حدّث بياناتك الأساسية لسهولة التواصل مع الوسطاء وربط المواعيد.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4 md:gap-5">
          <div>
            <label className="block text-xs text-slate-400 mb-1.5">
              الاسم الكامل
            </label>
            <input
              className={inputCls}
              placeholder="مثال: محمد الأمين السلمان"
              value={me.fullName}
              onChange={(e) => setMe({ ...me, fullName: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1.5">
              رقم الهاتف
            </label>
            <input
              className={inputCls}
              placeholder="مثال: +963 9xx xxx xxx"
              value={me.phone}
              onChange={(e) => setMe({ ...me, phone: e.target.value })}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            type="button"
            onClick={save}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl bg-emerald-500 text-sm font-semibold text-black shadow-lg shadow-emerald-500/40 hover:bg-emerald-400 transition disabled:opacity-50"
          >
            {loading ? "جاري الحفظ..." : "حفظ البيانات"}
          </button>

          <button
            type="button"
            onClick={reset}
            className="px-4 py-2.5 rounded-xl border border-slate-500/60 text-sm text-slate-200 hover:bg-white/5 transition"
          >
            إعادة ضبط
          </button>

          {(me.fullName || me.phone) && (
            <span className="text-[11px] text-slate-400">
              يتم حفظ بياناتك على السيرفر.
            </span>
          )}
        </div>
      </div>
    </section>
  );
}
