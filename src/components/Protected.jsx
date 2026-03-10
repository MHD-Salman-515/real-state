// src/components/Protected.jsx
import { Navigate } from "react-router-dom";
import { useAuthRole } from "../context/AuthRoleProvider.jsx";
import { hasPermission } from "../lib/permissions.js";

/* --------------------- Route Guard حسب الدور --------------------- */
/**
 * Wrap any route/page that يحتاج دور معيّن.
 * - roles: مصفوفة أدوار مسموح بها ["owner", "admin", ...]
 * - to: مسار إعادة التوجيه إذا ما عنده الصلاحية
 */
export function RequireRole({ roles, children, to = "/" }) {
  const { role } = useAuthRole();

  // لو ما حددنا أدوار: نسمح افتراضيًا
  if (!roles || roles.length === 0) return children;

  // إذا المستخدم عنده الدور الصحيح
  if (roles.includes(role)) return children;

  // غير ذلك نعيد توجيهه
  return <Navigate to={to} replace />;
}

/* ------------------- إظهار المحتوى حسب الصلاحية ------------------- */
/**
 * يعرض الـ children فقط إذا عنده صلاحية معيّنة
 * perm: اسم الصلاحية، مثل "invoices.view" أو "owner.properties.manage"
 */
export function HasPerm({ perm, children }) {
  const { perms } = useAuthRole();
  return hasPermission(perms, perm) ? children : null;
}

/* ----------------- إظهار المحتوى لو *ما* عنده صلاحية ----------------- */
/**
 * عكس HasPerm:
 * يعرض الـ children فقط إذا **لا** يملك هذه الصلاحية.
 */
export function HideIfNoPerm({ perm, children }) {
  const { perms } = useAuthRole();
  return !hasPermission(perms, perm) ? children : null;
}
