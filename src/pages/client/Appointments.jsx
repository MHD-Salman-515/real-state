import { useEffect, useState, useMemo, useRef } from "react";
import { useToast } from "../../components/ToastProvider.jsx";
import { notifyCrudError, notifyCrudSuccess } from "../../utils/notify.js";
import { buildApiUrl } from "../../api/axios";
import { useNotifications } from "@/components/notifications/useNotifications";

export default function Appointments() {
  const toast = useToast();
  const { notify } = useNotifications();
  const [rows, setRows] = useState([]);
  const [cancelledCount, setCancelledCount] = useState(0);
  const cancelTimersRef = useRef({}); // { [id]: timeoutId }

  // 🔹 جلب المواعيد من الـ API
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(buildApiUrl("/appointments"));
        const data = await res.json();

        if (!Array.isArray(data)) {
          console.error("Expected array, got:", data);
          setRows([]);
          return;
        }

        const normalized = data.map((a) => ({
          id: a.id,
          propId: a.propertyId,
          when: new Date(a.date).toLocaleString("ar-EG"),
          note: a.notes,
          status: a.status?.toLowerCase(),
          // حقول خاصة بالـ UI
          cancelling: false,
          countdown: null,
          removing: false,
        }));

        setRows(normalized);
      } catch (err) {
        console.error(err);
        toast.error("فشل تحميل المواعيد من الخادم");
      }
    }
    load();

    // تنظيف أي تايمرات عند الخروج من الصفحة
    return () => {
      Object.values(cancelTimersRef.current).forEach((timeoutId) =>
        clearTimeout(timeoutId)
      );
      cancelTimersRef.current = {};
    };
  }, [toast]);

  // 🔁 دالة داخلية لخطوة العدّاد
  const scheduleTick = (id, remaining) => {
    if (remaining <= 0) {
      // خلص العدّاد
      delete cancelTimersRef.current[id];

      // 1) أنيميشن تلاشي خفيف
      setRows((prev) =>
        prev.map((r) =>
          r.id === id
            ? {
                ...r,
                status: "cancelled",
                cancelling: false,
                countdown: null,
                removing: true,
              }
            : r
        )
      );

      // 2) حذف من الـ backend
      (async () => {
        try {
          const res = await fetch(buildApiUrl(`/appointments/${id}`), {
            method: "DELETE",
          });

          if (!res.ok) {
            console.error("Delete failed, status:", res.status);
            notifyCrudError("Failed to delete appointment");
            // بما إنو فشل، رجّع الكرت (اختياري):
            setRows((prev) =>
              prev.map((r) =>
                r.id === id
                  ? {
                      ...r,
                      removing: false,
                      status: "pending",
                    }
                  : r
              )
            );
            return;
          }

          // 3) زيادة عدّاد الملغاة + حذف من الـ state
          setCancelledCount((c) => c + 1);
          notifyCrudSuccess(`Appointment cancelled (${id})`);
          notify({
            type: "system",
            title: "Visit cancelled",
            message: "Your visit appointment was cancelled.",
          });

          setTimeout(() => {
            setRows((prev) => prev.filter((r) => r.id !== id));
          }, 400);
        } catch (err) {
          console.error(err);
          notifyCrudError("Failed to delete appointment");
        }
      })();

      return;
    }

    // تحديث العدّاد في الواجهة
    setRows((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, countdown: remaining } : r
      )
    );

    // تايمر لثانية قادمة
    const timeoutId = setTimeout(() => {
      scheduleTick(id, remaining - 1);
    }, 1000);

    cancelTimersRef.current[id] = timeoutId;
  };

  // 🔻 بدء الإلغاء مع العدّ التنازلي
  const startCancel = (id) => {
    setRows((prev) => {
      const target = prev.find((r) => r.id === id);
      if (!target || target.cancelling) return prev;

      return prev.map((r) =>
        r.id === id
          ? {
              ...r,
              cancelling: true,
              countdown: 5,
            }
          : r
      );
    });

    // أول خطوة عدّاد
    scheduleTick(id, 5);
  };

  // 🔄 زر التراجع عن الإلغاء أثناء العدّاد
  const undoCancel = (id) => {
    const t = cancelTimersRef.current[id];
    if (t) {
      clearTimeout(t);
      delete cancelTimersRef.current[id];
    }

    setRows((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              cancelling: false,
              countdown: null,
              removing: false,
            }
          : r
      )
    );

    toast.info(`تم التراجع عن إلغاء الموعد رقم ${id}`);
  };

  const getStatusMeta = (status) => {
    switch (status) {
      case "pending":
        return {
          label: "قيد المعالجة",
          cls: "bg-white/10 text-white/80 border-white/15",
        };
      case "confirmed":
        return {
          label: "مؤكد",
          cls: "bg-white/10 text-white/90 border-white/15",
        };
      case "done":
        return {
          label: "مكتمل",
          cls: "bg-slate-500/10 text-slate-200 border-slate-400",
        };
      case "cancelled":
        return {
          label: "ملغى",
          cls: "bg-red-500/10 text-red-200 border-red-300",
        };
      default:
        return {
          label: status || "غير معروف",
          cls: "bg-slate-500/10 text-slate-200",
        };
    }
  };

  // 🧮 الإحصائيات – تربط نفسها بحالة rows + عدد الملغاة
  const stats = useMemo(() => {
    const total = rows.length; // الموجودين حاليًا
    const upcoming = rows.filter((r) =>
      ["pending", "confirmed"].includes(r.status)
    ).length;
    const cancelled = cancelledCount;

    return { total, upcoming, cancelled };
  }, [rows, cancelledCount]);

  const visibleRows = rows;

  return (
    <section className="relative z-10 max-w-6xl mx-auto px-4 lg:px-0 py-10">
      <div className="card-glass border border-white/15 rounded-2xl p-5 md:p-6 shadow-soft bg-black/30 backdrop-blur-xl">
        {/* الهيدر + إحصائيات بسيطة */}
        <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-black bg-gradient-to-r from-white/20 to-white/10 bg-clip-text text-transparent">
              مواعيدي
            </h1>
            <p className="text-slate-300 text-sm mt-1">
              جميع مواعيدك المرتبطة بمعاينة العقارات.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs text-slate-300">
            <span className="px-3 py-1 rounded-full bg-slate-900/60 border border-slate-600/60">
              الإجمالي: {stats.total}
            </span>
            <span className="px-3 py-1 rounded-full bg-white/10 border border-white/15">
              القادمة: {stats.upcoming}
            </span>
            <span className="px-3 py-1 rounded-full bg-red-900/40 border border-red-500/60">
              الملغاة: {stats.cancelled}
            </span>
          </div>
        </div>

        {visibleRows.length === 0 ? (
          <div className="text-center py-10 text-slate-400">
            لا توجد مواعيد.
          </div>
        ) : (
          visibleRows.map((r) => {
            const meta = getStatusMeta(r.status);

            return (
              <div
                key={r.id}
                className={`p-4 mb-4 rounded-xl border border-white/10 bg-slate-900/40 backdrop-blur 
                transform transition-all duration-500 
                ${r.removing ? "opacity-0 translate-y-2 scale-95" : "opacity-100"}`}
              >
                <h3 className="font-semibold text-white/90">
                  موعد #{r.id}
                </h3>

                <p className="text-slate-300 text-sm">
                  <b>العقار:</b> #{r.propId}
                </p>

                <p className="text-slate-300 text-sm">
                  <b>الوقت:</b> {r.when}
                </p>

                <p className="text-slate-300 text-sm">
                  <b>ملاحظة:</b> {r.note || "—"}
                </p>

                <span
                  className={`inline-block mt-2 px-3 py-1 rounded-full border text-xs ${meta.cls}`}
                >
                  {meta.label}
                </span>

                {r.status !== "cancelled" && r.status !== "done" && (
                  <div className="mt-3 flex items-center gap-3">
                    <button
                      className="px-4 py-1.5 text-sm rounded-xl border border-red-500 text-red-300 hover:bg-red-500/10 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => startCancel(r.id)}
                      disabled={r.cancelling}
                    >
                      {r.cancelling
                        ? `سيتم الإلغاء خلال ${r.countdown} ث`
                        : "إلغاء الموعد"}
                    </button>

                    {r.cancelling && (
                      <button
                        type="button"
                        onClick={() => undoCancel(r.id)}
                        className="px-3 py-1.5 text-xs rounded-xl border border-slate-500 text-slate-200 hover:bg-white/5 transition"
                      >
                        تراجع
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
