const EXACT_ROUTES = new Set([
  "/home",
  "/auth/login",
  "/admin/appointments",
  "/admin/maintenance",
  "/admin/users",
  "/admin/commissions",
  "/admin/finance",
  "/admin/aging",
  "/owner",
  "/owner/dashboard",
  "/owner/properties",
  "/owner/properties/new",
  "/owner/appointments",
  "/accountant/sales-invoices",
  "/accountant/rent-invoices",
  "/accountant/record-payments",
  "/accountant/supplier-invoices",
  "/accountant/cost-allocation",
  "/accountant/income",
  "/accountant/aging",
  "/supplier/tasks",
  "/supplier/bills",
  "/supplier/cost-link",
  "/worker",
]);

const OWNER_DYNAMIC_EDIT = /^\/owner\/properties\/[^/]+\/edit$/;

function fallbackFor(scope) {
  if (scope === "admin") return "/admin/users";
  if (scope === "owner") return "/owner/properties";
  if (scope === "accountant") return "/accountant/sales-invoices";
  if (scope === "supplier") return "/supplier/tasks";
  if (scope === "worker") return "/worker";
  return "/home";
}

export function validateHref(href, scope = "public") {
  const value = String(href || "").trim();
  if (!value) return { ok: false, fallbackHref: null };
  if (!value.startsWith("/")) return { ok: false, fallbackHref: fallbackFor(scope) };
  if (EXACT_ROUTES.has(value)) return { ok: true, fallbackHref: value };
  if (OWNER_DYNAMIC_EDIT.test(value)) return { ok: true, fallbackHref: value };
  return { ok: false, fallbackHref: fallbackFor(scope) };
}
