// src/components/NotificationBell.jsx
import { useEffect, useRef, useState } from "react";
import { useToast } from "./ToastProvider.jsx";

function TypeDot({ type }) {
  const map = {
    success: "bg-emerald-400",
    error: "bg-red-500",
    warning: "bg-amber-400",
    info: "bg-cyan-400",
  };
  return (
    <span
      className={`inline-block h-2.5 w-2.5 rounded-full ${
        map[type] || "bg-slate-400"
      }`}
    />
  );
}

export default function NotificationBell() {
  const { history, clearHistory } = useToast();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // إغلاق عند الضغط خارج القائمة
  useEffect(() => {
    function onClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      {/* زر الجرس */}
      <button
        type="button"
        className="
          relative inline-flex items-center justify-center 
          w-10 h-10 rounded-xl 
          border border-white/20 
          bg-white/10 
          backdrop-blur-md 
          hover:bg-white/20 
          hover:scale-110 
          transition 
          shadow-lg shadow-emerald-500/25
        "
        onClick={() => setOpen((v) => !v)}
        title="الإشعارات"
        aria-label="الإشعارات"
      >
        {/* أيقونة جرس (SVG) */}
        <svg
          viewBox="0 0 24 24"
          className="w-5 h-5 text-slate-50"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <path d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2c0 .5-.2 1-.6 1.4L4 17h5" />
          <path d="M9 17a3 3 0 0 0 6 0" />
        </svg>

        {/* عدّاد الإشعارات */}
        {history.length > 0 && (
          <span
            className="
              absolute -top-1 -right-1 
              min-w-[18px] h-[18px] px-1 
              rounded-full bg-emerald-400 
              text-black text-[10px] font-bold 
              leading-[18px] text-center
              shadow shadow-emerald-500/60
            "
          >
            {history.length}
          </span>
        )}
      </button>

      {/* قائمة الإشعارات (من التوست الحقيقي) */}
      {open && (
        <div
          className="
            absolute z-[9998] mt-2 right-0 w-[320px] 
            rounded-2xl 
            bg-[#050911]/95 
            border border-white/15 
            shadow-xl shadow-emerald-500/30 
            backdrop-blur-xl 
            overflow-hidden
          "
        >
          {/* الهيدر */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-white/10 bg-white/5">
            <div className="text-xs font-semibold text-emerald-200">
              الإشعارات
            </div>
            {history.length > 0 && (
              <button
                className="text-[11px] text-emerald-300 hover:text-emerald-100 hover:underline transition"
                onClick={clearHistory}
                title="مسح الكل"
                type="button"
              >
                مسح الكل
              </button>
            )}
          </div>

          {/* محتوى الإشعارات */}
          <div className="max-h-[320px] overflow-auto divide-y divide-white/5">
            {history.length === 0 ? (
              <div className="px-3 py-6 text-center text-slate-400 text-sm">
                لا توجد إشعارات حالياً.
              </div>
            ) : (
              history.map((n) => (
                <div
                  key={n.id}
                  className="px-3 py-2.5 text-sm flex items-start gap-2 hover:bg-white/5 transition"
                >
                  <TypeDot type={n.type} />
                  <div className="flex-1">
                    <div className="text-slate-50">{n.message}</div>
                    {n.at && (
                      <div className="text-slate-400 text-[11px] mt-0.5">
                        {new Date(n.at).toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
