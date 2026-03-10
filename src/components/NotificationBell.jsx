import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "./ToastProvider.jsx";
import { validateHref } from "../utils/notificationRoutes.js";

function titleFromType(type) {
  switch (type) {
    case "success":
      return "Success";
    case "error":
      return "Error";
    case "warning":
      return "Warning";
    default:
      return "Info";
  }
}

function formatTime(at) {
  if (!at) return "";
  try {
    return new Date(at).toLocaleString();
  } catch {
    return "";
  }
}

export default function NotificationBell() {
  const { history, clearHistory } = useToast();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const panelRef = useRef(null);

  const notifications = useMemo(() => history || [], [history]);

  useEffect(() => {
    function onMouseDown(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false);
      }
    }

    function onKeyDown(e) {
      if (e.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  useEffect(() => {
    if (open && panelRef.current) {
      panelRef.current.focus();
    }
  }, [open]);

  const resolveHref = (notification) => {
    const check = validateHref(notification?.href, "owner");
    return check.ok ? notification?.href : check.fallbackHref;
  };

  const handleNotificationClick = (notification) => {
    const target = resolveHref(notification);
    if (!target) return;
    navigate(target);
    setOpen(false);
  };

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-slate-200 transition duration-200 hover:border-white/15 hover:bg-white/10 hover:text-white/90"
        onClick={() => setOpen((v) => !v)}
        title="Notifications"
        aria-label="Notifications"
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2c0 .5-.2 1-.6 1.4L4 17h5" />
          <path d="M9 17a3 3 0 0 0 6 0" />
        </svg>
        {notifications.length > 0 ? (
          <span className="absolute -right-1 -top-1 min-w-[18px] rounded-full bg-white/10 px-1 text-center text-[10px] font-bold leading-[18px] text-black">
            {notifications.length}
          </span>
        ) : null}
      </button>

      {open ? (
        <div
          ref={panelRef}
          tabIndex={-1}
          className="absolute right-0 z-[9998] mt-2 w-[340px] rounded-2xl border border-white/10 bg-[#050912]/95 backdrop-blur"
          role="dialog"
          aria-label="Notifications panel"
        >
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <h3 className="text-sm font-semibold text-white">Notifications</h3>
            <button
              type="button"
              disabled
              className="cursor-not-allowed rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-500"
              title="Mark all as read is not available"
            >
              Mark all as read
            </button>
          </div>

          <div className="max-h-80 overflow-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-slate-400">لا توجد إشعارات</div>
            ) : (
              <ul className="divide-y divide-white/5">
                {notifications.map((n) => {
                  const target = resolveHref(n);
                  const isClickable = Boolean(target);
                  return (
                  <li
                    key={n.id}
                    className={[
                      "px-4 py-3 transition duration-200 hover:bg-white/5",
                      isClickable ? "cursor-pointer" : "",
                    ].join(" ")}
                    onClick={() => handleNotificationClick(n)}
                  >
                    <div className="flex items-start gap-3">
                      <span className="mt-1 h-2.5 w-2.5 flex-none rounded-full bg-white/10" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-300">
                            {titleFromType(n.type)}
                          </p>
                          <span className="text-[11px] text-slate-500">{formatTime(n.at)}</span>
                        </div>
                        <p className="mt-1 text-sm text-slate-100">{n.message}</p>
                        {isClickable ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleNotificationClick(n);
                            }}
                            className="mt-2 text-xs font-medium text-white/90 transition hover:text-white/90"
                          >
                            {n.hrefLabel || "Open"}
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </li>
                );
                })}
              </ul>
            )}
          </div>

          <div className="border-t border-white/10 p-3">
            <button
              type="button"
              onClick={clearHistory}
              className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-slate-200 transition duration-200 hover:border-rose-300/35 hover:bg-rose-500/10 hover:text-rose-100"
            >
              مسح الإشعارات
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
