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
import { useAuth } from "../context/AuthContext.jsx";

const ToastCtx = createContext(null);
const LS_PREFIX = "creos_notifications_";

function buildStorageKey(user) {
  const identity = user?.id ?? user?.email ?? user?.username;
  if (!identity) return null;
  return `${LS_PREFIX}${String(identity)}`;
}

export function ToastProvider({ children }) {
  const { user } = useAuth();
  const [toasts, setToasts] = useState([]);
  const [history, setHistory] = useState([]);
  const idRef = useRef(1);

  const storageKey = useMemo(
    () => buildStorageKey(user),
    [user?.id, user?.email, user?.username]
  );

  // Load per-user history only when user identity is available.
  useEffect(() => {
    setToasts([]);

    if (!storageKey) {
      setHistory([]);
      return;
    }

    try {
      const raw = localStorage.getItem(storageKey);
      setHistory(raw ? JSON.parse(raw) : []);
    } catch {
      setHistory([]);
    }
  }, [storageKey]);

  // Persist history to the active user key only.
  useEffect(() => {
    if (!storageKey) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(history));
    } catch {}
  }, [history, storageKey]);

  useEffect(() => {
    function onNotifyAdd(e) {
      if (!storageKey) return;
      const d = e?.detail || {};
      const ts = Number(d.time || d.createdAt || Date.now());
      const item = {
        id: idRef.current++,
        message: d.message || d.text || "Notification",
        type: d.type || "info",
        title: d.title || "",
        at: d.at || new Date(ts).toISOString(),
        time: ts,
        href: d.href || "",
        hrefLabel: d.hrefLabel || "",
        meta: d.meta,
      };
      setHistory((prev) => [item, ...prev]);
    }

    window.addEventListener("notify:add", onNotifyAdd);
    return () => window.removeEventListener("notify:add", onNotifyAdd);
  }, [storageKey]);

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (msg, opts = {}) => {
      const id = idRef.current++;
      const toast = {
        id,
        message: typeof msg === "string" ? msg : "Done",
        type: opts.type || "info", // success | error | info | warning
        duration: opts.duration ?? 3000,
        at: new Date().toISOString(),
      };
      setToasts((prev) => [...prev, toast]);
      setHistory((prev) => [{ ...toast }, ...prev]);
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
      ? "border-white/15"
      : t === "error"
      ? "border-red-400/60"
      : t === "warning"
      ? "border-white/15"
      : "border-white/15";

  const typeDot = (t) =>
    t === "success"
      ? "bg-white/10"
      : t === "error"
      ? "bg-red-400"
      : t === "warning"
      ? "bg-white/10"
      : "bg-white/10";

  return (
    <ToastCtx.Provider value={api}>
      {children}

      <div className="fixed top-4 right-4 z-[9999] max-w-[360px] space-y-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={[
              "min-w-[220px] rounded-2xl border px-3 py-2 shadow-lg",
              "bg-[#020617]/90 backdrop-blur-xl",
              "shadow-white/10",
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
              <div className="flex-1 text-sm text-slate-100">{t.message}</div>
              <button
                onClick={() => remove(t.id)}
                className="px-1 text-sm leading-none text-slate-400 hover:text-slate-200"
                aria-label="Close"
                title="Close"
              >
                x
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
