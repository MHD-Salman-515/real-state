// src/components/PermissionGate.jsx
import { useAuth } from "../context/AuthContext.jsx";

export default function PermissionGate({ need = [], children, fallback = null }) {
  const { user } = useAuth();

  // في حال ما في مستخدم أو ما في صلاحيات
  if (!user?.permissions || !Array.isArray(user.permissions)) {
    return fallback;
  }

  // التحقق من وجود جميع الصلاحيات المطلوبة
  const allowed = need.every((p) => user.permissions.includes(p));

  return allowed ? children : fallback;
}
