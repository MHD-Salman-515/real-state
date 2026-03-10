import StarterDashboard from "../../components/dashboard/StarterDashboard.jsx";

const KPI = [
  { label: "Active Leads", value: "57", change: "+5.2%" },
  { label: "Scheduled Tours", value: "24", change: "+3.4%" },
  { label: "Conversion Rate", value: "31%", change: "+2.0%" },
  { label: "Pipeline Value", value: "$860K", change: "+4.9%" },
];

const ACTIONS = ["Add Lead", "Link Operation", "Send Follow-up", "Create Brief"];

const TASKS = [
  { title: "Prioritize warm leads", due: "Today" },
  { title: "Prepare showing notes", due: "Tomorrow" },
  { title: "Update lead scoring sheet", due: "Thu" },
  { title: "Review stalled opportunities", due: "Fri" },
];

export default function AgentDashboard() {
  return (
    <StarterDashboard
      roleLabel="Agent"
      title="Agent Execution Dashboard"
      subtitle="Coordinate leads, tours, and follow-ups with a focused operations workflow."
      kpis={KPI}
      actions={ACTIONS}
      tasks={TASKS}
    />
  );
}
