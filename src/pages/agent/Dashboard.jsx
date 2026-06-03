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
  const tasks = TASKS.map((task) => ({ title: t(task.title), due: t(task.due) }));
  const KPI = [
    { label: t("Active Leads"), value: "57", change: "+5.2%" },
    { label: t("Scheduled Tours"), value: "24", change: "+3.4%" },
    { label: t("Conversion Rate"), value: "31%", change: "+2.0%" },
    { label: t("Pipeline Value"), value: "$860K", change: "+4.9%" },
  ];
  const ACTIONS = [t("Add Lead"), t("Link Operation"), t("Send Follow-up"), t("Create Brief")];
  return (
    <StarterDashboard
      roleLabel={t("agent")}
      title={t("Agent Execution Dashboard")}
      subtitle={t("Coordinate leads, tours, and follow-ups with a focused operations workflow.")}
      kpis={KPI}
      actions={ACTIONS}
      tasks={tasks}
    />
  );
}
