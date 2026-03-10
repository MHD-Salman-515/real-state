// import { Navigate } from "react-router-dom";
// import { useAuth } from "../context/AuthContext";

// export default function ProtectedRoute({ children }) {
//   const { user, authLoading } = useAuth();

//   // أثناء التحميل → لا نرجع أي شيء
//   if (authLoading) return null; 

//   // بعد التحميل → نقرر
//   if (!user) return <Navigate to="/auth/login" />;

//   return children;
// }

// src/components/ProtectedRoute.jsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute() {
  const { user, authLoading } = useAuth();

  // أثناء تحميل البيانات من localStorage
  if (authLoading) return null;

  // إذا المستخدم غير مسجل دخول
  if (!user) return <Navigate to="/auth/login" replace />;

  // إذا كل شيء تمام → أعرض المسار الداخلي
  return <Outlet />;
}
