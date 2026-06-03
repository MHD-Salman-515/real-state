import { useTranslation } from 'react-i18next';
import StarterDashboard from "../../components/dashboard/StarterDashboard.jsx";

const TASKS = [
  { title: "Prioritize warm leads", due: "Today" },
  { title: "Prepare showing notes", due: "Tomorrow" },
  { title: "Update lead scoring sheet", due: "Thu" },
  { title: "Review stalled opportunities", due: "Fri" },
];

export default function AgentDashboard() {
  const { t } = useTranslation();
  const KPI = [
    { label: t("Active Leads"), value: "57", change: "+5.2%" },
    { label: t("Scheduled Tours"), value: "24", change: "+3.4%" },
    { label: t("Conversion Rate"), value: "31%", change: "+2.0%" },
    { label: t("Pipeline Value"), value: "$860K", change: "+4.9%" },
  ];
  const ACTIONS = ["Add Lead", "Link Operation", "Send Follow-up", "Create Brief"];
  return (
    <StarterDashboard
      roleLabel={t("agent")}
      title={t("Agent Execution Dashboard")}
      subtitle="Coordinate leads, tours, and follow-ups with a focused operations workflow."
      kpis={KPI}
      actions={ACTIONS}
      tasks={TASKS}
    />
  );
}
