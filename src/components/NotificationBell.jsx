import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useToast } from "./ToastProvider.jsx";
import { validateHref } from "../utils/notificationRoutes.js";

function titleFromType(type, t) {
  switch (type) {
    case "success":
      return t("Success");
    case "error":
      return t("Error");
    case "warning":
      return t("Warning");
    default:
      return t("Info");
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
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const panelRef = useRef(null);
  const isRtl = i18n.dir() === "rtl";

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
        className="dashboard-icon-btn relative h-9 w-9"
        onClick={() => setOpen((v) => !v)}
        title={t("Notifications")}
        aria-label={t("Notifications")}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2c0 .5-.2 1-.6 1.4L4 17h5" />
          <path d="M9 17a3 3 0 0 0 6 0" />
        </svg>
        {notifications.length > 0 ? (
          <span className="absolute -right-1 -top-1 min-w-[18px] rounded-full bg-[var(--creos-accent)] px-1 text-center text-[10px] font-bold leading-[18px] text-[#3c2f00]">
            {notifications.length}
          </span>
        ) : null}
      </button>

      {open ? (
        <div
          ref={panelRef}
          tabIndex={-1}
          className="dashboard-dropdown absolute z-[9998] mt-2 w-[min(340px,calc(100vw-2rem))] max-w-[calc(100vw-2rem)] overflow-hidden"
          style={{ [isRtl ? "left" : "right"]: 0 }}
          role="dialog"
          aria-label={t("Notifications panel")}
        >
          <div className="flex items-center justify-between border-b border-[var(--creos-border-soft)] px-4 py-3">
            <h3 className="text-sm font-semibold text-[color:var(--creos-text)]">{t("Notifications")}</h3>
            <button
              type="button"
              disabled
              className="cursor-not-allowed rounded-xl border border-[var(--creos-border-soft)] bg-[rgb(var(--creos-surface-rgb)/0.55)] px-2.5 py-1 text-xs text-[color:rgb(var(--creos-text-rgb)/0.45)]"
              title={t("Mark all as read is not available")}
            >
              {t("Mark all as read")}
            </button>
          </div>

          <div className="max-h-[min(70vh,20rem)] overflow-y-auto overflow-x-hidden">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-[color:rgb(var(--creos-text-rgb)/0.56)]">{t("No notifications")}</div>
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
                          <p className="text-xs font-semibold uppercase tracking-wide text-[color:var(--creos-muted)]">
                            {titleFromType(n.type, t)}
                          </p>
                          <span className="text-[11px] text-[color:rgb(var(--creos-text-rgb)/0.45)]">{formatTime(n.at)}</span>
                        </div>
                        <p className="mt-1 text-sm text-[color:var(--creos-text)]">{n.message}</p>
                        {isClickable ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleNotificationClick(n);
                            }}
                            className="mt-2 text-xs font-medium text-[color:var(--creos-accent-bright)] transition hover:text-[color:var(--creos-accent)]"
                          >
                            {n.hrefLabel || t("Open")}
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

          <div className="border-t border-[var(--creos-border-soft)] p-3">
            <button
              type="button"
              onClick={clearHistory}
              className="w-full rounded-2xl border border-[var(--creos-border-soft)] bg-[rgb(var(--creos-surface-rgb)/0.55)] px-3 py-2 text-sm text-[color:var(--creos-text)] transition duration-200 hover:border-rose-300/35 hover:bg-rose-500/10 hover:text-rose-100"
            >
              {t("Clear notifications")}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
