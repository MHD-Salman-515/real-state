import { useEffect, useState } from "react";
import PageHeader from "../../components/PageHeader.jsx";
import Card from "../../components/Card.jsx";
import api from "../../api/axios";
import { useToast } from "../../components/ToastProvider";
import { notifyCrudError, notifyCrudSuccess } from "../../utils/notify.js";

export default function AdminMaintenance() {
  const toast = useToast();

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");

  const [workers, setWorkers] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  const [showWorkerModal, setShowWorkerModal] = useState(false);
  const [showSupplierModal, setShowSupplierModal] = useState(false);

  const [currentTicket, setCurrentTicket] = useState(null);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [selectedSupplier, setSelectedSupplier] = useState(null);

  const selectClass =
    "w-full rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-white/90 " +
    "transition focus:outline-none focus:ring-2 focus:ring-white/30";
  const optionClass = "bg-slate-900 text-white/90";

  const load = async () => {
    try {
      setLoading(true);
      const res = await api.get("/tickets");
      setTickets(res.data);
    } catch (err) {
      console.error("Load tickets error:", err.response?.data || err.message);
      toast.error("Failed to load tickets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = tickets.filter((t) => (filter === "ALL" ? true : t.status === filter));

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/tickets/${id}/status/${status}`);
      notifyCrudSuccess("Ticket status updated", "Operation successful", {
        href: "/admin/maintenance",
      });
      await load();
    } catch (err) {
      console.error("Update status error:", err.response?.data || err.message);
      notifyCrudError("Failed to update ticket status", "Operation failed", {
        href: "/admin/maintenance",
      });
    }
  };

  const deleteTicket = async (id) => {
    if (!confirm("Do you want to delete this ticket?")) return;

    try {
      await api.delete(`/tickets/${id}`);
      notifyCrudSuccess("Ticket deleted", "Operation successful", {
        href: "/admin/maintenance",
      });
      await load();
    } catch (err) {
      console.error("Delete ticket error:", err.response?.data || err.message);
      notifyCrudError("Failed to delete ticket", "Operation failed", {
        href: "/admin/maintenance",
      });
    }
  };

  const openAssignWorker = async (ticket) => {
    try {
      setCurrentTicket(ticket);
      setSelectedWorker(null);
      const res = await api.get("/users/role/WORKER");
      setWorkers(res.data);
      setShowWorkerModal(true);
    } catch (err) {
      console.error("Load workers error:", err.response?.data || err.message);
      toast.error("Failed to load workers");
    }
  };

  const openAssignSupplier = async (ticket) => {
    try {
      setCurrentTicket(ticket);
      setSelectedSupplier(null);
      const res = await api.get("/users/role/SUPPLIER");
      setSuppliers(res.data);
      setShowSupplierModal(true);
    } catch (err) {
      console.error("Load suppliers error:", err.response?.data || err.message);
      toast.error("Failed to load suppliers");
    }
  };

  const assignWorker = async () => {
    if (!currentTicket || !selectedWorker) {
      return toast.error("Select a worker first");
    }

    try {
      await api.put(`/tickets/${currentTicket.id}/assign-worker/${selectedWorker}`);
      notifyCrudSuccess("Worker assigned to ticket", "Operation successful", {
        href: "/admin/maintenance",
      });
      setShowWorkerModal(false);
      setSelectedWorker(null);
      setCurrentTicket(null);
      await load();
    } catch (err) {
      console.error("Assign worker error:", err.response?.data || err.message);
      notifyCrudError("Failed to assign worker", "Operation failed", {
        href: "/admin/maintenance",
      });
    }
  };

  const assignSupplier = async () => {
    if (!currentTicket || !selectedSupplier) {
      return toast.error("Select a supplier first");
    }

    try {
      await api.put(`/tickets/${currentTicket.id}/assign-supplier/${selectedSupplier}`);
      notifyCrudSuccess("Supplier assigned to ticket", "Operation successful", {
        href: "/admin/maintenance",
      });
      setShowSupplierModal(false);
      setSelectedSupplier(null);
      setCurrentTicket(null);
      await load();
    } catch (err) {
      console.error("Assign supplier error:", err.response?.data || err.message);
      notifyCrudError("Failed to assign supplier", "Operation failed", {
        href: "/admin/maintenance",
      });
    }
  };

  return (
    <section className="space-y-6">
      <PageHeader
        title="Maintenance Tickets"
        subtitle="Manage ticket status and assignment workflow."
      />

      <Card className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-white md:text-base">Tickets</h2>
            <p className="mt-1 text-xs text-slate-300">Update status, assign teams, and maintain service records.</p>
          </div>
        </div>

        <div className="mb-3 rounded-xl border border-white/10 bg-black/25 p-3">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-300">Status</label>
              <select value={filter} onChange={(e) => setFilter(e.target.value)} className={selectClass}>
                <option className={optionClass} value="ALL">All</option>
                <option className={optionClass} value="OPEN">Open</option>
                <option className={optionClass} value="IN_PROGRESS">In Progress</option>
                <option className={optionClass} value="COMPLETED">Completed</option>
                <option className={optionClass} value="CANCELLED">Cancelled</option>
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
        </div>

        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl">
          <table className="min-w-[1120px] text-sm leading-5 text-slate-100">
            <thead className="sticky top-0 z-10 border-b border-white/10 bg-black/40 backdrop-blur-xl">
              <tr>
                <th className="min-w-[90px] whitespace-nowrap px-4 py-3 align-middle text-left text-[11px] uppercase tracking-wide text-slate-300 tabular-nums">ID</th>
                <th className="px-4 py-3 align-middle text-left text-[11px] uppercase tracking-wide text-slate-300">Property</th>
                <th className="px-4 py-3 align-middle text-left text-[11px] uppercase tracking-wide text-slate-300">Client</th>
                <th className="px-4 py-3 align-middle text-left text-[11px] uppercase tracking-wide text-slate-300">Worker</th>
                <th className="px-4 py-3 align-middle text-left text-[11px] uppercase tracking-wide text-slate-300">Supplier</th>
                <th className="w-[160px] whitespace-nowrap px-4 py-3 align-middle text-left text-[11px] uppercase tracking-wide text-slate-300">Status</th>
                <th className="whitespace-nowrap px-4 py-3 align-middle text-left text-[11px] uppercase tracking-wide text-slate-300">Created</th>
                <th className="w-[120px] whitespace-nowrap px-4 py-3 align-middle text-center text-[11px] uppercase tracking-wide text-slate-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-4">
                    <div className="animate-pulse space-y-2">
                      <div className="h-10 rounded-lg bg-white/10" />
                      <div className="h-10 rounded-lg bg-white/10" />
                      <div className="h-10 rounded-lg bg-white/10" />
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-slate-400">No tickets found</td>
                </tr>
              ) : (
                filtered.map((t) => (
                  <tr key={t.id} className="transition-colors even:bg-white/[0.02] hover:bg-white/5">
                    <td className="min-w-[90px] whitespace-nowrap px-4 py-3 align-middle tabular-nums">{t.id}</td>
                    <td className="max-w-[220px] truncate px-4 py-3 align-middle" title={t.property?.title || "â€”"}>{t.property?.title || "â€”"}</td>
                    <td className="max-w-[180px] truncate px-4 py-3 align-middle" title={t.client?.fullName || "â€”"}>{t.client?.fullName || "â€”"}</td>
                    <td className="max-w-[180px] truncate px-4 py-3 align-middle" title={t.worker?.fullName || "â€”"}>{t.worker?.fullName || "â€”"}</td>
                    <td className="max-w-[180px] truncate px-4 py-3 align-middle" title={t.supplier?.fullName || "â€”"}>{t.supplier?.fullName || "â€”"}</td>
                    <td className="w-[160px] whitespace-nowrap px-4 py-3 align-middle">
                      <select value={t.status} onChange={(e) => updateStatus(t.id, e.target.value)} className={selectClass}>
                        <option className={optionClass} value="OPEN">Open</option>
                        <option className={optionClass} value="IN_PROGRESS">In Progress</option>
                        <option className={optionClass} value="COMPLETED">Completed</option>
                        <option className={optionClass} value="CANCELLED">Cancelled</option>
                      </select>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 align-middle">{t.createdAt ? new Date(t.createdAt).toLocaleDateString("ar-EG") : "â€”"}</td>
                    <td className="w-[120px] whitespace-nowrap px-4 py-3 align-middle text-center">
                      <div className="flex flex-wrap items-center justify-center gap-2">
                        <button className="rounded-lg border border-blue-400/40 bg-blue-500/10 px-3 py-1 text-xs text-blue-200 transition hover:bg-blue-500/20" onClick={() => openAssignWorker(t)}>
                          Assign Worker
                        </button>
                        <button className="rounded-lg border border-violet-400/40 bg-violet-500/10 px-3 py-1 text-xs text-violet-200 transition hover:bg-violet-500/20" onClick={() => openAssignSupplier(t)}>
                          Assign Supplier
                        </button>
                        <button className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-1 text-xs text-red-300 transition hover:bg-red-500/20" onClick={() => deleteTicket(t.id)}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {showWorkerModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#050912]/95 p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Assign Worker</h3>
              <button
                className="rounded-lg border border-white/15 px-2 py-1 text-xs text-slate-300 transition hover:bg-white/10"
                onClick={() => {
                  setShowWorkerModal(false);
                  setSelectedWorker(null);
                  setCurrentTicket(null);
                }}
              >
                Close
              </button>
            </div>

            <div className="max-h-64 overflow-y-auto">
              <select
                className={selectClass}
                value={selectedWorker ?? ""}
                onChange={(e) => setSelectedWorker(e.target.value ? Number(e.target.value) : null)}
              >
                <option className={optionClass} value="">Select worker...</option>
                {workers.map((w) => (
                  <option key={w.id} className={optionClass} value={w.id}>
                    {w.fullName}
                  </option>
                ))}
              </select>
            </div>

            <button className="mt-4 w-full rounded-xl bg-white/10 px-3 py-2 text-sm font-medium text-black transition hover:bg-white/10" onClick={assignWorker}>
              Save
            </button>
          </div>
        </div>
      ) : null}

      {showSupplierModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#050912]/95 p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Assign Supplier</h3>
              <button
                className="rounded-lg border border-white/15 px-2 py-1 text-xs text-slate-300 transition hover:bg-white/10"
                onClick={() => {
                  setShowSupplierModal(false);
                  setSelectedSupplier(null);
                  setCurrentTicket(null);
                }}
              >
                Close
              </button>
            </div>

            <div className="max-h-64 overflow-y-auto">
              <select
                className={selectClass}
                value={selectedSupplier ?? ""}
                onChange={(e) => setSelectedSupplier(e.target.value ? Number(e.target.value) : null)}
              >
                <option className={optionClass} value="">Select supplier...</option>
                {suppliers.map((s) => (
                  <option key={s.id} className={optionClass} value={s.id}>
                    {s.fullName}
                  </option>
                ))}
              </select>
            </div>

            <button className="mt-4 w-full rounded-xl bg-white/10 px-3 py-2 text-sm font-medium text-black transition hover:bg-white/10" onClick={assignSupplier}>
              Save
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}

