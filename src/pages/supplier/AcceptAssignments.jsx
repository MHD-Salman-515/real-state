import { useEffect, useState } from "react";
import PageHeader from "../../components/PageHeader.jsx";
import Card from "../../components/Card.jsx";
import { useToast } from "../../components/ToastProvider.jsx";
import api from "../../api/axios";
import { notifyCrudError, notifyCrudSuccess } from "../../utils/notify.js";

export default function AcceptAssignments() {
  const toast = useToast();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      const res = await api.get("/tickets/supplier/me");
      const openTickets = (res.data || []).filter((t) => t.status === "OPEN");
      setRows(openTickets);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load assigned tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const accept = async (id) => {
    try {
      await api.put(`/tickets/${id}/status/IN_PROGRESS`);
      await api.post(`/tickets/${id}/logs`, {
        action: "Supplier accepted assignment",
      });
      notifyCrudSuccess("Assignment accepted", "Operation successful", {
        href: "/supplier/tasks",
      });
      load();
    } catch (err) {
      console.error(err);
      notifyCrudError("Failed to accept assignment", "Operation failed", {
        href: "/supplier/tasks",
      });
    }
  };

  const reject = async (id) => {
    try {
      await api.put(`/tickets/${id}/status/CANCELLED`);
      await api.post(`/tickets/${id}/logs`, {
        action: "Supplier rejected assignment",
      });
      notifyCrudSuccess("Assignment rejected", "Operation successful", {
        href: "/supplier/tasks",
      });
      load();
    } catch (err) {
      console.error(err);
      notifyCrudError("Failed to reject assignment", "Operation failed", {
        href: "/supplier/tasks",
      });
    }
  };

  const formatDate = (d) => (d ? new Date(d).toLocaleString() : "Not set");

  return (
    <section className="space-y-4">
      <PageHeader
        title="Tasks"
        subtitle="Assigned maintenance requests that need your response."
      />

      {loading ? (
        <Card className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm backdrop-blur-xl">
          Loading tasks...
        </Card>
      ) : rows.length === 0 ? (
        <Card className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-sm backdrop-blur-xl">
          No tasks currently require your approval.
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {rows.map((t) => (
            <Card
              key={t.id}
              className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl"
            >
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-base font-semibold text-white">Ticket #{t.id}</h3>
                <span className="rounded-full border border-white/15 bg-white/10 px-2 py-1 text-xs text-white/80">
                  {t.priority}
                </span>
              </div>

              <p className="text-sm text-slate-200">
                <span className="font-medium">Property:</span>{" "}
                {t.property?.title || "-"} - {t.property?.city || ""}
              </p>

              <p className="text-xs text-slate-400">Created: {formatDate(t.createdAt)}</p>

              <p className="mt-1 text-sm text-slate-100">{t.description || "No detailed description"}</p>

              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={() => accept(t.id)}
                  className="flex-1 rounded-lg bg-white/10 px-3 py-1.5 text-sm text-white transition hover:bg-white/10"
                >
                  Accept
                </button>
                <button
                  onClick={() => reject(t.id)}
                  className="flex-1 rounded-lg border border-rose-400/50 px-3 py-1.5 text-sm text-rose-300 transition hover:bg-rose-500/10"
                >
                  Reject
                </button>
              </div>

              <p className="mt-2 text-[11px] text-slate-400">
                After accepting, use <span className="font-semibold">Cost Link</span> to add and link expenses.
              </p>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
