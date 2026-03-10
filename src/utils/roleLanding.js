export function getRoleLandingPath(user) {
  const role = String(user?.role || "").toLowerCase();

  switch (role) {
    case "admin":
      return "/admin/appointments";
    case "owner":
      return "/owner";
    case "accountant":
      return "/accountant/sales-invoices";
    case "supplier":
      return "/supplier/tasks";
    case "worker":
      return "/worker";
    case "agent":
      return "/agent/appointments";
    default:
      return "/home";
  }
}

