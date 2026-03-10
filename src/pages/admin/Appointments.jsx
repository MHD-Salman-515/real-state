import { useEffect, useState } from "react";
import PageHeader from "../../components/PageHeader.jsx";
import Card from "../../components/Card.jsx";
import Toolbar from "../../components/Toolbar.jsx";
import api from "../../api/axios";
import { notifyCrudError, notifyCrudSuccess } from "../../utils/notify.js";

const STATUS_LABELS = {
  PENDING: "Pending",
  APPROVED: "Approved",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

const STATUS_COLORS = {
  PENDING: "bg-white/10 text-white/80 border-white/15",
  APPROVED: "bg-white/10 text-white/80 border-white/15",
  COMPLETED: "bg-sky-500/20 text-sky-200 border-sky-400/40",
  CANCELLED: "bg-red-500/20 text-red-300 border-red-400/40",
};

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  );
}

export default function AdminAppointments() {
  const [rows, setRows] = useState([]);
  const [allRows, setAllRows] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const res = await api.get("/appointments");
      const list = (res.data || []).map((a) => ({
        id: a.id,
        client: a.client?.fullName || "—",
        property: a.property?.title || "—",
        agent: a.agent?.fullName || "—",
        date: a.date?.slice(0, 10),
        time: a.date?.slice(11, 16),
        status: a.status,
        notes: a.notes || "",
      }));

      setAllRows(list);
      setRows(list);
    } catch (err) {
      console.error(err);
      alert("Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filterStatus = (st) => {
    setStatusFilter(st);
    if (!st) {
      setRows(allRows);
      return;
    }
    setRows(allRows.filter((r) => r.status === st));
  };

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/appointments/${id}`, { status });
      notifyCrudSuccess("Appointment status updated", "Operation successful", {
        href: "/admin/appointments",
      });
      load();
    } catch (err) {
      console.error(err);
      notifyCrudError("Failed to update appointment status", "Operation failed", {
        href: "/admin/appointments",
      });
    }
  };

  const deleteItem = async (id) => {
    if (!confirm("Are you sure you want to delete this appointment?")) return;

    try {
      await api.delete(`/appointments/${id}`);
      notifyCrudSuccess("Appointment deleted", "Operation successful", {
        href: "/admin/appointments",
      });
      load();
    } catch (err) {
      console.error(err);
      notifyCrudError("Failed to delete appointment", "Operation failed", {
        href: "/admin/appointments",
      });
    }
  };

  return (
    <section className="space-y-4">
      <PageHeader title="Appointments" subtitle="Manage, update, and clean appointment records." />

      <Toolbar className="rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-xl">
        <div className="flex w-full flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-300">Status</label>
            <select
              className="min-w-[180px] rounded-xl border border-white/10 bg-black/25 px-3 py-2 text-sm text-slate-100 outline-none transition duration-200 focus:border-white/15"
              value={statusFilter}
              onChange={(e) => filterStatus(e.target.value)}
            >
              <option value="">All statuses</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <button
            type="button"
            onClick={load}
            className="self-start rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs text-slate-300 transition duration-200 hover:border-white/15 hover:text-white/90 md:self-auto"
          >
            Refresh
          </button>
        </div>
      </Toolbar>

      <Card className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl">
        <div className="border-b border-white/10 px-4 py-3 md:px-5">
          <h3 className="text-sm font-semibold text-white md:text-base">All Appointments</h3>
          <p className="mt-1 text-xs text-slate-300 md:text-sm">Update status or remove entries.</p>
        </div>

        {loading ? (
          <div className="p-4">
            <div className="animate-pulse space-y-2">
              <div className="h-10 rounded-xl bg-white/10" />
              <div className="h-10 rounded-xl bg-white/10" />
              <div className="h-10 rounded-xl bg-white/10" />
              <div className="h-10 rounded-xl bg-white/10" />
            </div>
          </div>
        ) : rows.length === 0 ? (
          <div className="p-8 text-center">
            <h4 className="text-base font-semibold text-white">No appointments found</h4>
            <p className="mt-2 text-sm text-slate-300">Try changing the status filter to view more records.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[1080px] text-sm leading-5 text-slate-100">
              <thead className="sticky top-0 z-10 bg-black/40 backdrop-blur-xl">
                <tr className="border-b border-white/10">
                  <th className="min-w-[90px] whitespace-nowrap px-4 py-3 align-middle text-left text-[11px] font-semibold uppercase tracking-wide text-slate-300 tabular-nums">ID</th>
                  <th className="px-4 py-3 align-middle text-left text-[11px] font-semibold uppercase tracking-wide text-slate-300">Client</th>
                  <th className="px-4 py-3 align-middle text-left text-[11px] font-semibold uppercase tracking-wide text-slate-300">Property</th>
                  <th className="px-4 py-3 align-middle text-left text-[11px] font-semibold uppercase tracking-wide text-slate-300">Agent</th>
                  <th className="whitespace-nowrap px-4 py-3 align-middle text-left text-[11px] font-semibold uppercase tracking-wide text-slate-300">Date</th>
                  <th className="whitespace-nowrap px-4 py-3 align-middle text-left text-[11px] font-semibold uppercase tracking-wide text-slate-300">Time</th>
                  <th className="w-[160px] whitespace-nowrap px-4 py-3 align-middle text-left text-[11px] font-semibold uppercase tracking-wide text-slate-300">Status</th>
                  <th className="w-[120px] whitespace-nowrap px-4 py-3 align-middle text-center text-[11px] font-semibold uppercase tracking-wide text-slate-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {rows.map((r) => (
                  <tr key={r.id} className="transition-colors even:bg-white/[0.02] hover:bg-white/5">
                    <td className="min-w-[90px] whitespace-nowrap px-4 py-3 align-middle tabular-nums">{r.id}</td>
                    <td className="max-w-[170px] truncate px-4 py-3 align-middle" title={r.client}>{r.client}</td>
                    <td className="max-w-[200px] truncate px-4 py-3 align-middle" title={r.property}>{r.property}</td>
                    <td className="max-w-[170px] truncate px-4 py-3 align-middle" title={r.agent}>{r.agent}</td>
                    <td className="whitespace-nowrap px-4 py-3 align-middle">{r.date}</td>
                    <td className="whitespace-nowrap px-4 py-3 align-middle">{r.time}</td>
                    <td className="w-[160px] whitespace-nowrap px-4 py-3 align-middle">
                      <span
                        className={
                          "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs leading-5 " +
                          (STATUS_COLORS[r.status] || "bg-slate-700 border-slate-500")
                        }
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
                        <span>{STATUS_LABELS[r.status] || r.status}</span>
                      </span>
                    </td>
                    <td className="w-[120px] whitespace-nowrap px-4 py-3 align-middle text-center">
                      <div className="flex items-center justify-center gap-2">
                        <select
                          className="rounded-xl border border-white/15 bg-black/30 px-2 py-1.5 text-xs text-slate-100 outline-none transition duration-200 focus:border-white/15"
                          value={r.status}
                          onChange={(e) => updateStatus(r.id, e.target.value)}
                        >
                          <option value="PENDING">Pending</option>
                          <option value="APPROVED">Approved</option>
                          <option value="COMPLETED">Completed</option>
                          <option value="CANCELLED">Cancelled</option>
                        </select>

                        <button
                          onClick={() => deleteItem(r.id)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-red-500/40 bg-red-500/10 text-red-300 transition duration-200 hover:bg-red-500/20"
                          title="Delete"
                          aria-label="Delete"
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </section>
  );
}
