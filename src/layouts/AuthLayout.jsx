import { Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden flex items-center justify-center p-4">
      <Outlet />
    </div>
  );
}
