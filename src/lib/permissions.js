// src/lib/permissions.js
export const ROLES = {
  admin: "admin",          // 👈 مستقل
  owner: "owner",
  salesAgent: "salesAgent",
  technician: "technician",
  accountant: "accountant",
  supervisor: "supervisor",
  client: "client",
};

export const ROLE_PERMS = {
  // الـAdmin عنده لوحة خاصة /admin وما منعتبره Owner
  [ROLES.admin]: [
    "admin:*",           // صلاحيات لوحة الأدمن فقط
    "users:*",
    "reports:*",
    "audit:*",
    // ملاحظة: ما منعطيه props:* / appts:* هنا حتى ما يتداخل مع مالك
  ],

  [ROLES.owner]: [
    "props:*",
    "appts:*",
    "tickets:*",
    "finance:*",
    "reports:ops",
  ],

  [ROLES.salesAgent]: [
    "props:read",
    "props:create",
    "appts:read",
    "appts:update:assigned",
    "crm:*",
  ],

  [ROLES.technician]: [
    "tickets:read:assigned",
    "tickets:update:assigned",
    "tickets:log:create",
  ],

  [ROLES.accountant]: [
    "finance:*",
    "props:read",
    "appts:read",
  ],

  [ROLES.supervisor]: [
    "tickets:*",
    "appts:read",
    "props:read",
    "reports:ops",
  ],

  [ROLES.client]: [
    "client:request:visit",
    "client:request:ticket",
    "client:track:*",
  ],
};

// matcher كما هو إن كنت مستخدمه
export function hasPermission(perms, need) {
  if (!Array.isArray(perms)) return false;
  if (perms.includes("*")) return true;
  const [resA, actA, scopeA] = String(need).split(":");
  return perms.some(p => {
    const [resB, actB, scopeB] = String(p).split(":");
    const resOk = resB === "*" || resB === resA;
    const actOk = !actA || actB === "*" || actB === actA;
    const scpOk = !scopeA || !scopeB || scopeB === "*" || scopeB === scopeA;
    return resOk && actOk && scpOk;
  });
}
