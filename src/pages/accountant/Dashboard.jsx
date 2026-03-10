import StarterDashboard from "../../components/dashboard/StarterDashboard.jsx";

const KPI = [
  { label: "Open Invoices", value: "73", change: "-1.4%" },
  { label: "Collected This Month", value: "$412K", change: "+8.9%" },
  { label: "Aging > 30 Days", value: "11", change: "-2.7%" },
  { label: "Allocation Accuracy", value: "97%", change: "+0.8%" },
];

const ACTIONS = ["Record Payment", "Issue Invoice", "Run Aging", "Export Ledger"];

const TASKS = [
  { title: "Review overdue receivables", due: "Today" },
  { title: "Reconcile supplier statements", due: "Tomorrow" },
  { title: "Prepare weekly finance snapshot", due: "Thu" },
  { title: "Validate cost allocations", due: "Fri" },
];

export default function AccountantDashboard() {
  return (
    <StarterDashboard
      roleLabel="Accountant"
      title="Financial Operations Dashboard"
      subtitle="Monitor invoices, collections, and aging indicators across portfolio operations."
      kpis={KPI}
      actions={ACTIONS}
      tasks={TASKS}
    />
  );
}
