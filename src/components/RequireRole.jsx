// // src/components/RequireRole.jsx
// import { Navigate, Outlet } from "react-router-dom";
// import { useAuth } from "../context/AuthContext.jsx";

// /**
//  * 🎯 RequireRole
//  * حماية المسارات حسب الدور (Role-Based Route Guard)
//  *
//  * allow = ["admin", "owner", "accountant"]
//  * fallback = "/"
//  */
// export default function RequireRole({ allow = [], fallback = "/" }) {
//   const { user } = useAuth(); // { id, full_name, role } أو null

//   // المستخدم غير مسجّل → تحويل لصفحة تسجيل الدخول
//   if (!user) {
//     return <Navigate to="/auth/login" replace />;
//   }

//   // ما عنده الدور المطلوب → تحويل لصفحة fallback
//   if (!allow.includes(user.role)) {
//     return <Navigate to={fallback} replace />;
//   }

//   // عنده الدور الصحيح → عرض محتوى المسار
//   return <Outlet />;
// }


// src/components/RequireRole.jsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function RequireRole({ allow = [], fallback = "/" }) {
  const { user } = useAuth();

  // لو ما في مستخدم → رجعيه لصفحة تسجيل الدخول
  if (!user) return <Navigate to="/auth/login" replace />;

  // الدور نرجّعه lowercase ليتطابق مع الراوتر
  const role = user.role?.toLowerCase();

  // إذا الدور غير مسموح → رجوع للـ fallback
  if (!allow.includes(role)) {
    return <Navigate to={fallback} replace />;
  }

  // مسموح → أظهري الصفحة
  return <Outlet />;
}
