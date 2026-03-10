export function pushBellNotification({
  type = "info",
  title = "Notification",
  message = "",
  time = Date.now(),
  href,
  hrefLabel,
  meta,
} = {}) {
  if (typeof window === "undefined") return;
  const safeMessage = String(message || "").trim();
  const detail = {
    type,
    title,
    message: safeMessage,
    text: safeMessage,
    time,
    createdAt: time,
    at: new Date(time).toISOString(),
    href,
    hrefLabel,
    meta,
  };
  window.dispatchEvent(new CustomEvent("notify:add", { detail }));
}

export function notifyCrudSuccess(
  message,
  title = "Operation successful",
  options = {}
) {
  pushBellNotification({
    type: "success",
    title,
    message,
    time: Date.now(),
    href: options.href,
    hrefLabel: options.hrefLabel,
    meta: options.meta,
  });
}

export function notifyCrudError(
  message,
  title = "Operation failed",
  options = {}
) {
  pushBellNotification({
    type: "error",
    title,
    message,
    time: Date.now(),
    href: options.href,
    hrefLabel: options.hrefLabel,
    meta: options.meta,
  });
}
