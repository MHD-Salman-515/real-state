import { useTranslation } from 'react-i18next';
import StarterDashboard from "../../components/dashboard/StarterDashboard.jsx";

const TASKS = [
  { title: "Review overdue receivables", due: "Today" },
  { title: "Reconcile supplier statements", due: "Tomorrow" },
  { title: "Prepare weekly finance snapshot", due: "Thu" },
  { title: "Validate cost allocations", due: "Fri" },
];

export default function AccountantDashboard() {
  const { t } = useTranslation();
  const KPI = [
    { label: t("Open Invoices"), value: "73", change: "-1.4%" },
    { label: t("Collected This Month"), value: "$412K", change: "+8.9%" },
    { label: "Aging > 30 Days", value: "11", change: "-2.7%" },
    { label: t("Allocation Accuracy"), value: "97%", change: "+0.8%" },
  ];
  const ACTIONS = [t("Record Payment"), "Issue Invoice", "Run Aging", "Export Ledger"];
  return (
    <StarterDashboard
      roleLabel={t("accountant")}
      title={t("Financial Operations Dashboard")}
      subtitle="Monitor invoices, collections, and aging indicators across portfolio operations."
      kpis={KPI}
      actions={ACTIONS}
      tasks={TASKS}
    />
  );
}
