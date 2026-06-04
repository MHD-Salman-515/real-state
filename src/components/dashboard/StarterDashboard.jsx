import { useTranslation } from "react-i18next";

const DEFAULT_KPIS = [
  { label: "Active Listings", value: "148", change: "+8.2%" },
  { label: "Open Appointments", value: "37", change: "+2.4%" },
  { label: "Pipeline Value", value: "$1.9M", change: "+5.1%" },
  { label: "Completion Rate", value: "92%", change: "+1.8%" },
];

const DEFAULT_ACTIONS = [
  "Create Listing",
  "Schedule Visit",
  "Generate Report",
  "Invite Team Member",
];

const DEFAULT_TASKS = [
  { title: "Review pending approvals", due: "Today" },
  { title: "Confirm next-week visits", due: "Tomorrow" },
  { title: "Finalize monthly summary", due: "Fri" },
  { title: "Follow up high-priority leads", due: "Mon" },
];

const DEFAULT_ACTIVITY = [
  { id: "ACT-1029", item: "Downtown Tower Unit 14", owner: "Rania Haddad", status: "Updated", time: "5m ago" },
  { id: "ACT-1028", item: "Harbor Loft A2", owner: "Liam Morgan", status: "Scheduled", time: "18m ago" },
  { id: "ACT-1027", item: "West End Residence 7", owner: "Maya Karim", status: "Approved", time: "34m ago" },
  { id: "ACT-1026", item: "Elm Court Block C", owner: "Noah Patel", status: "Reviewed", time: "1h ago" },
  { id: "ACT-1025", item: "Northline Duplex 11", owner: "Sara Jensen", status: "Flagged", time: "2h ago" },
];

function statusClass(status) {
  switch (status.toLowerCase()) {
    case "approved":
    case "updated":
      return "text-[color:var(--creos-text)] bg-[rgb(var(--creos-accent-rgb)/0.16)] border-[rgb(var(--creos-accent-rgb)/0.22)]";
    case "scheduled":
    case "reviewed":
      return "text-[color:var(--creos-text)] bg-[rgb(var(--creos-surface-max-rgb)/0.72)] border-[var(--creos-border-soft)]";
    default:
      return "text-[color:var(--creos-text)] bg-[rgb(var(--creos-surface-rgb)/0.62)] border-[var(--creos-border-soft)]";
  }
}

export default function StarterDashboard({
  roleLabel,
  title,
  subtitle,
  kpis = DEFAULT_KPIS,
  actions = DEFAULT_ACTIONS,
  tasks = DEFAULT_TASKS,
  activity = DEFAULT_ACTIVITY,
}) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <section className="card-glass rounded-3xl p-5 md:p-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="dashboard-pill inline-flex px-2.5 py-1 text-[11px] uppercase tracking-[0.16em]">
              {t(roleLabel)}
            </span>
            <h1 className="mt-3 text-2xl font-bold text-[color:var(--creos-text)] md:text-3xl">{t(title)}</h1>
            <p className="mt-2 max-w-3xl text-sm text-[color:rgb(var(--creos-text-rgb)/0.72)] md:text-base">{t(subtitle)}</p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {kpis.map((kpi) => (
          <article
            key={kpi.label}
            className="card-glass hover-card-pop rounded-3xl p-4"
          >
            <p className="text-xs uppercase tracking-[0.16em] text-[color:var(--creos-muted)]">{t(kpi.label)}</p>
            <p className="mt-2 text-3xl font-bold text-[color:var(--creos-accent-bright)]">{kpi.value}</p>
            <p className="mt-2 text-xs text-[color:rgb(var(--creos-text-rgb)/0.82)]">{kpi.change}</p>
          </article>
        ))}
      </section>

      <section className="card-glass rounded-3xl p-4">
        <div className="mb-3 text-sm font-semibold text-[color:var(--creos-text)]">{t("Quick Actions")}</div>
        <div className="flex flex-wrap gap-2">
          {actions.map((action) => (
            <button
              key={action}
              type="button"
              className="btn-glass px-3 py-2 text-xs"
            >
              {t(action)}
            </button>
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.8fr_1fr]">
        <article className="card-glass rounded-3xl p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="text-sm font-semibold text-[color:var(--creos-text)]">{t("Recent Activity")}</div>
            <button
              type="button"
              className="btn-glass px-2.5 py-1 text-xs"
            >
              {t("View all")}
            </button>
          </div>
          <div className="table-creos">
            <table className="min-w-full text-sm">
              <thead>
                <tr>
                  <th className="px-2 py-2 text-left">{t("ID")}</th>
                  <th className="px-2 py-2 text-left">{t("Item")}</th>
                  <th className="px-2 py-2 text-left">{t("Owner")}</th>
                  <th className="px-2 py-2 text-left">{t("Status")}</th>
                  <th className="px-2 py-2 text-left">{t("Time")}</th>
                </tr>
              </thead>
              <tbody>
                {activity.map((row) => (
                  <tr key={row.id}>
                    <td className="px-2 py-2 text-[color:rgb(var(--creos-text-rgb)/0.54)]">{row.id}</td>
                    <td className="px-2 py-2">{row.item}</td>
                    <td className="px-2 py-2">{row.owner}</td>
                    <td className="px-2 py-2">
                      <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs ${statusClass(row.status)}`}>
                        {t(row.status)}
                      </span>
                    </td>
                    <td className="px-2 py-2 text-[color:rgb(var(--creos-text-rgb)/0.54)]">{t(row.time)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <aside className="card-glass rounded-3xl p-4">
          <div className="mb-3 text-sm font-semibold text-[color:var(--creos-text)]">{t("Tasks & Reminders")}</div>
          {tasks.length === 0 ? (
            <div className="dashboard-empty">
              {t("No reminders yet.")}
            </div>
          ) : (
            <div className="space-y-2">
              {tasks.map((task) => (
                <div
                  key={`${task.title}-${task.due}`}
                  className="rounded-2xl border border-[var(--creos-border-soft)] bg-[rgb(var(--creos-surface-rgb)/0.52)] p-3 transition duration-200 hover:bg-[rgb(var(--creos-surface-hi-rgb)/0.68)]"
                >
                  <p className="text-sm text-[color:var(--creos-text)]">{t(task.title)}</p>
                  <p className="mt-1 text-xs text-[color:var(--creos-muted)]">{t(task.due)}</p>
                </div>
              ))}
            </div>
          )}
        </aside>
      </section>
    </div>
  );
}
