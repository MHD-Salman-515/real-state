import { useEffect, useState } from "react";
import { useTranslation } from 'react-i18next';
import PageHeader from "../../components/PageHeader.jsx";
import Card from "../../components/Card.jsx";
import { useToast } from "../../components/ToastProvider.jsx";
import api from "../../api/axios";
import { notifyCrudError, notifyCrudSuccess } from "../../utils/notify.js";

export default function AcceptAssignments() {
  const toast = useToast();
  const { t } = useTranslation();
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
      toast.error(t("Failed to load your related tickets"));
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
      notifyCrudSuccess(t("Assignment accepted"), t("Operation successful"), {
        href: "/supplier/tasks",
      });
      load();
    } catch (err) {
      console.error(err);
      notifyCrudError(t("Failed to accept assignment"), t("Operation failed"), {
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
      notifyCrudSuccess(t("Assignment rejected"), t("Operation successful"), {
        href: "/supplier/tasks",
      });
      load();
    } catch (err) {
      console.error(err);
      notifyCrudError(t("Failed to reject assignment"), t("Operation failed"), {
        href: "/supplier/tasks",
      });
    }
  };

  const formatDate = (d) => (d ? new Date(d).toLocaleString() : t("Not set"));

  return (
    <section className="space-y-4">
      <PageHeader
        title={t("Tasks")}
        subtitle={t("Assigned maintenance requests that need your response.")}
      />

      {loading ? (
        <Card className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm backdrop-blur-xl">
          {t("Loading...")}
        </Card>
      ) : rows.length === 0 ? (
        <Card className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-sm backdrop-blur-xl">
          {t("No data")}
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {rows.map((ticket) => (
            <Card
              key={ticket.id}
              className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl"
            >
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-base font-semibold text-white">{t("Ticket #{{id}}", { id: ticket.id })}</h3>
                <span className="rounded-full border border-white/15 bg-white/10 px-2 py-1 text-xs text-white/80">
                  {ticket.priority}
                </span>
              </div>

              <p className="text-sm text-slate-200">
                <span className="font-medium">{t("Property:")}</span>{" "}
                {ticket.property?.title || "-"} - {ticket.property?.city || ""}
              </p>

              <p className="text-xs text-slate-400">{t("Created:")} {formatDate(ticket.createdAt)}</p>

              <p className="mt-1 text-sm text-slate-100">{ticket.description || t("No detailed description")}</p>

              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={() => accept(ticket.id)}
                  className="flex-1 rounded-lg bg-white/10 px-3 py-1.5 text-sm text-white transition hover:bg-white/10"
                >
                  {t("Approved")}
                </button>
                <button
                  onClick={() => reject(ticket.id)}
                  className="flex-1 rounded-lg border border-rose-400/50 px-3 py-1.5 text-sm text-rose-300 transition hover:bg-rose-500/10"
                >
                  {t("Cancelled")}
                </button>
              </div>

              <p className="mt-2 text-[11px] text-slate-400">
                {t("After accepting, use Cost Link to add and link expenses.")}
              </p>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
