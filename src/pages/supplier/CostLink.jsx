import { useEffect, useMemo, useState } from "react";
import PageHeader from "../../components/PageHeader.jsx";
import Card from "../../components/Card.jsx";
import { useToast } from "../../components/ToastProvider.jsx";
import api from "../../api/axios";
import { notifyCrudError, notifyCrudSuccess } from "../../utils/notify.js";

export default function CostLink() {
  const toast = useToast();
  const [tickets, setTickets] = useState([]);
  const [loadingTickets, setLoadingTickets] = useState(true);

  const [form, setForm] = useState({
    ticketId: "",
    amount: "",
    description: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [saveError, setSaveError] = useState("");

  const baseFieldClass =
    "w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 " +
    "outline-none transition focus:border-white/15 focus:ring-2 focus:ring-white/30";

  const selectClass = baseFieldClass;
  const inputClass = baseFieldClass;
  const textareaClass = baseFieldClass + " resize-none";
  const optionClass = "bg-[#050912] text-slate-100";

  const loadTickets = async () => {
    try {
      setLoadingTickets(true);
      const res = await api.get("/tickets/supplier/me");
      const data = res.data || [];
      const valid = data.filter((t) => ["IN_PROGRESS", "COMPLETED"].includes(t.status));
      setTickets(valid);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load your related tickets");
    } finally {
      setLoadingTickets(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaveError("");

    if (!form.ticketId) {
      toast.error("Please choose a ticket");
      return;
    }
    if (!form.amount || isNaN(form.amount)) {
      toast.error("Please enter a valid amount");
      return;
    }

    const payload = {
      ticketId: Number(form.ticketId),
      amount: Number(form.amount),
      description: form.description?.trim() || "",
    };

    try {
      setSubmitting(true);
      await api.post("/expenses", payload);
      notifyCrudSuccess("Expense linked to ticket successfully", "Operation successful", {
        href: "/supplier/cost-link",
      });

      setForm({
        ticketId: "",
        amount: "",
        description: "",
      });
      setSaveError("");
    } catch (err) {
      const status = err?.response?.status;
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to save expense";
      console.error("[supplier/cost-link] save failed", { status, message, err });
      setSaveError(`Save failed: ${message}`);
      notifyCrudError("Failed to save expense", "Operation failed", {
        href: "/supplier/cost-link",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const ticketOptions = useMemo(
    () =>
      tickets.map((t) => ({
        id: t.id,
        label: `#${t.id} - ${t.property?.title || "Property"} - ${t.category}`,
      })),
    [tickets]
  );

  return (
    <section className="space-y-4">
      <PageHeader
        title="Cost Link"
        subtitle="Log your expenses and link each cost to a maintenance ticket."
      />

      <Card className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-100">
              Linked Ticket
            </label>
            {loadingTickets ? (
              <p className="text-xs text-slate-400">Loading tickets...</p>
            ) : ticketOptions.length === 0 ? (
              <p className="text-xs text-slate-400">
                No accepted or in-progress tickets are assigned to you.
              </p>
            ) : (
              <select
                name="ticketId"
                value={form.ticketId}
                onChange={handleChange}
                className={selectClass}
              >
                <option className={optionClass} value="">
                  Select ticket...
                </option>
                {ticketOptions.map((t) => (
                  <option key={t.id} className={optionClass} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-100">
              Expense Amount
            </label>
            <input
              type="number"
              name="amount"
              value={form.amount}
              onChange={handleChange}
              className={inputClass}
              min="0"
              step="0.01"
              placeholder="Example: 150"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-100">
              Expense Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              className={textareaClass}
              rows={3}
              placeholder="Example: materials and helper labor"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={submitting || loadingTickets}
              className="rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-slate-950 shadow-md shadow-white/10 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Saving..." : "Save Expense"}
            </button>
          </div>
          {saveError ? (
            <p className="text-sm text-rose-300">{saveError}</p>
          ) : null}
        </form>

        <p className="mt-3 text-[11px] text-slate-400">
          After saving expenses, accounting can review and link them to supplier invoices.
        </p>
      </Card>
    </section>
  );
}
