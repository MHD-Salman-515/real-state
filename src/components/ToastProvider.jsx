// src/components/ToastProvider.jsx
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const ToastCtx = createContext(null);
const LS_KEY = "exs_notifications_history";

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [history, setHistory] = useState([]);
  const idRef = useRef(1);

  // تحميل السجل من التخزين المحلي
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) setHistory(JSON.parse(raw));
    } catch {}
  }, []);

  // حفظ السجل
  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(history));
    } catch {}
  }, [history]);

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (msg, opts = {}) => {
      const id = idRef.current++;
      const toast = {
        id,
        message: typeof msg === "string" ? msg : "تم الإجراء",
        type: opts.type || "info", // success | error | info | warning
        duration: opts.duration ?? 3000,
        at: new Date().toISOString(),
      };
      setToasts((prev) => [...prev, toast]);
      setHistory((prev) => [{ ...toast }, ...prev]); // أحدث إشعار في الأعلى
      setTimeout(() => remove(id), toast.duration);
    },
    [remove]
  );

  const clearHistory = useCallback(() => setHistory([]), []);

  const api = useMemo(
    () => ({
      show,
      success: (m, o) => show(m, { ...o, type: "success" }),
      error: (m, o) => show(m, { ...o, type: "error" }),
      info: (m, o) => show(m, { ...o, type: "info" }),
      warning: (m, o) => show(m, { ...o, type: "warning" }),
      remove,
      history,
      clearHistory,
    }),
    [show, remove, history, clearHistory]
  );

  const typeBorder = (t) =>
    t === "success"
      ? "border-emerald-400/50"
      : t === "error"
      ? "border-red-400/60"
      : t === "warning"
      ? "border-amber-400/60"
      : "border-cyan-300/40";

  const typeDot = (t) =>
    t === "success"
      ? "bg-emerald-400"
      : t === "error"
      ? "bg-red-400"
      : t === "warning"
      ? "bg-amber-300"
      : "bg-cyan-300";

  return (
    <ToastCtx.Provider value={api}>
      {children}

      {/* Toaster العلوي العابر – ستايل غلاس دارك */}
      <div className="fixed top-4 right-4 z-[9999] space-y-2 max-w-[360px]">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={[
              "min-w-[220px] px-3 py-2 rounded-2xl border shadow-lg",
              "bg-[#020617]/90 backdrop-blur-xl",
              "shadow-emerald-500/25",
              typeBorder(t.type),
            ].join(" ")}
          >
            <div className="flex items-start gap-2">
              <span
                className={[
                  "mt-1 inline-block h-2.5 w-2.5 rounded-full",
                  typeDot(t.type),
                ].join(" ")}
              />
              <div className="flex-1 text-slate-100 text-sm">
                {t.message}
              </div>
              <button
                onClick={() => remove(t.id)}
                className="text-slate-400 hover:text-slate-200 text-sm leading-none px-1"
                aria-label="إغلاق"
                title="إغلاق"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
  return ctx;
}
