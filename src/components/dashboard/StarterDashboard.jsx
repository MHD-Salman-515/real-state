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
      return "text-white/90 bg-white/10 border-white/15";
    case "scheduled":
    case "reviewed":
      return "text-slate-200 bg-white/10 border-white/20";
    default:
      return "text-white/80 bg-white/10 border-white/15";
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
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-white/10 bg-black/30 p-5 backdrop-blur-xl md:p-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="inline-flex rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[11px] uppercase tracking-wide text-white/90">
              {roleLabel}
            </span>
            <h1 className="mt-3 text-2xl font-bold text-white md:text-3xl">{title}</h1>
            <p className="mt-2 max-w-3xl text-sm text-slate-300 md:text-base">{subtitle}</p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {kpis.map((kpi) => (
          <article
            key={kpi.label}
            className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl transition duration-300 hover:border-white/15 hover:bg-white/10"
          >
            <p className="text-xs uppercase tracking-wide text-slate-400">{kpi.label}</p>
            <p className="mt-2 text-3xl font-bold text-white">{kpi.value}</p>
            <p className="mt-2 text-xs text-white/90">{kpi.change}</p>
          </article>
        ))}
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
        <div className="mb-3 text-sm font-semibold text-white">Quick Actions</div>
        <div className="flex flex-wrap gap-2">
          {actions.map((action) => (
            <button
              key={action}
              type="button"
              className="rounded-lg border border-white/20 bg-black/30 px-3 py-2 text-xs text-slate-200 transition duration-200 hover:border-white/15 hover:bg-white/10 hover:text-white/90"
            >
              {action}
            </button>
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.8fr_1fr]">
        <article className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="text-sm font-semibold text-white">Recent Activity</div>
            <button
              type="button"
              className="rounded-lg border border-white/15 bg-black/20 px-2.5 py-1 text-xs text-slate-300 transition duration-200 hover:border-white/15 hover:text-white/90"
            >
              View all
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wide text-slate-400">
                  <th className="px-2 py-2">ID</th>
                  <th className="px-2 py-2">Item</th>
                  <th className="px-2 py-2">Owner</th>
                  <th className="px-2 py-2">Status</th>
                  <th className="px-2 py-2">Time</th>
                </tr>
              </thead>
              <tbody>
                {activity.map((row) => (
                  <tr key={row.id} className="border-b border-white/5 text-slate-200 transition duration-200 hover:bg-white/5">
                    <td className="px-2 py-2 text-slate-400">{row.id}</td>
                    <td className="px-2 py-2">{row.item}</td>
                    <td className="px-2 py-2">{row.owner}</td>
                    <td className="px-2 py-2">
                      <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs ${statusClass(row.status)}`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="px-2 py-2 text-slate-400">{row.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <aside className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
          <div className="mb-3 text-sm font-semibold text-white">Tasks & Reminders</div>
          {tasks.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/15 bg-black/20 p-4 text-sm text-slate-400">
              No reminders yet.
            </div>
          ) : (
            <div className="space-y-2">
              {tasks.map((task) => (
                <div
                  key={`${task.title}-${task.due}`}
                  className="rounded-xl border border-white/10 bg-black/25 p-3 transition duration-200 hover:border-white/15 hover:bg-black/35"
                >
                  <p className="text-sm text-slate-100">{task.title}</p>
                  <p className="mt-1 text-xs text-white/90">{task.due}</p>
                </div>
              ))}
            </div>
          )}
        </aside>
      </section>
    </div>
  );
}
