import StarterDashboard from "../../components/dashboard/StarterDashboard.jsx";

const KPI = [
  { label: "Owned Properties", value: "42", change: "+4.8%" },
  { label: "Visit Requests", value: "19", change: "+2.2%" },
  { label: "Occupancy", value: "88%", change: "+1.3%" },
  { label: "Monthly Revenue", value: "$214K", change: "+7.6%" },
];

const ACTIONS = ["Add Property", "Review Visits", "Update Pricing", "Download Summary"];

const TASKS = [
  { title: "Approve pending tenant requests", due: "Today" },
  { title: "Confirm this week appointments", due: "Tomorrow" },
  { title: "Update top listing media", due: "Thu" },
  { title: "Review monthly occupancy trend", due: "Mon" },
];

export default function OwnerDashboard() {
  return (
    <StarterDashboard
      roleLabel="Owner"
      title="Owner Performance Dashboard"
      subtitle="Track property performance, incoming requests, and occupancy momentum at a glance."
      kpis={KPI}
      actions={ACTIONS}
      tasks={TASKS}
    />
  );
}
