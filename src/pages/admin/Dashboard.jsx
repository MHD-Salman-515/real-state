import StarterDashboard from "../../components/dashboard/StarterDashboard.jsx";

const KPI = [
  { label: "Platform Health", value: "99.2%", change: "+0.4%" },
  { label: "Open Incidents", value: "12", change: "-3.1%" },
  { label: "New Users", value: "84", change: "+6.8%" },
  { label: "Compliance", value: "96%", change: "+1.1%" },
];

const ACTIONS = ["Manage Users", "Review Permissions", "Broadcast Notice", "Export Audit"];

const TASKS = [
  { title: "Approve role change requests", due: "Today" },
  { title: "Review maintenance escalations", due: "Today" },
  { title: "Finalize monthly governance report", due: "Thu" },
  { title: "Verify commission payout batch", due: "Fri" },
];

const ACTIVITY = [
  { id: "ADM-3021", item: "User role update request", owner: "Security Team", status: "Reviewed", time: "6m ago" },
  { id: "ADM-3020", item: "Maintenance assignment queue", owner: "Ops Desk", status: "Updated", time: "21m ago" },
  { id: "ADM-3019", item: "Commission batch validation", owner: "Finance Unit", status: "Approved", time: "47m ago" },
  { id: "ADM-3018", item: "Permission matrix export", owner: "Admin Console", status: "Scheduled", time: "1h ago" },
];

export default function AdminDashboard() {
  return (
    <StarterDashboard
      roleLabel="Admin"
      title="Admin Control Dashboard"
      subtitle="Monitor system health, users, and operational governance from one control center."
      kpis={KPI}
      actions={ACTIONS}
      tasks={TASKS}
      activity={ACTIVITY}
    />
  );
}
