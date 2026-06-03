import { useState, useEffect } from "react";
import api from "../../api/axios";

const EMPTY_FORM = { description: "", amount: "", category: "", date: "" };

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get("/expenses")
      .then(r => setExpenses(Array.isArray(r.data) ? r.data : r.data?.items || []))
      .catch(() => setExpenses([]))
      .finally(() => setLoading(false));
  }, []);

  const openModal = () => { setForm(EMPTY_FORM); setModalOpen(true); };
  const closeModal = () => setModalOpen(false);

  const setField = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const submit = async () => {
    if (!form.description.trim() || !form.amount) return;
    setSubmitting(true);
    try {
      const payload = {
        description: form.description.trim(),
        amount: parseFloat(form.amount),
        category: form.category.trim() || undefined,
        date: form.date || undefined,
      };
      const r = await api.post("/expenses", payload);
      setExpenses(prev => [r.data, ...prev]);
      closeModal();
    } catch {
      alert("Failed to save expense. Please try again.");
    }
    setSubmitting(false);
  };

  const total = expenses.reduce((acc, e) => acc + (Number(e.amount) || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">Expenses</h1>
        <button
          onClick={openModal}
          className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
        >
          + Add Expense
        </button>
      </div>

      {/* Total card */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <p className="text-xs uppercase tracking-wider text-white/40">Total Expenses</p>
        <p className="mt-1 text-2xl font-bold text-white">
          {total.toLocaleString()}{" "}
          <span className="text-sm font-normal text-white/40">SYP</span>
        </p>
      </div>

      {loading && <p className="py-10 text-center text-white/40">Loading...</p>}

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-white/10">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/5 text-xs uppercase tracking-wider text-white/40">
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-4 py-3 text-left">Category</th>
              <th className="px-4 py-3 text-left">Description</th>
              <th className="px-4 py-3 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {!loading && expenses.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-white/30">
                  No expenses recorded yet
                </td>
              </tr>
            )}
            {expenses.map((e, i) => {
              const dateStr = e.date || e.createdAt;
              return (
                <tr key={e.id || i} className="border-b border-white/5 transition hover:bg-white/5">
                  <td className="px-4 py-3 text-white/60">
                    {dateStr ? new Date(dateStr).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-4 py-3 text-white/60">{e.category || "—"}</td>
                  <td className="px-4 py-3 text-white">{e.description}</td>
                  <td className="px-4 py-3 text-right font-mono text-white">
                    {Number(e.amount || 0).toLocaleString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={e => e.target === e.currentTarget && closeModal()}
        >
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#050912] p-6 shadow-2xl">
            <h2 className="mb-5 text-lg font-bold text-white">New Expense</h2>

            <div className="space-y-4">
              <Field label="Description *" placeholder="e.g. Office supplies">
                <input
                  type="text"
                  value={form.description}
                  onChange={e => setField("description", e.target.value)}
                  placeholder="e.g. Office supplies"
                  className="field"
                />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs text-white/50">Amount (SYP) *</label>
                  <input
                    type="number"
                    min="0"
                    value={form.amount}
                    onChange={e => setField("amount", e.target.value)}
                    placeholder="0"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-white/20"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-white/50">Date</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={e => setField("date", e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-white/20"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs text-white/50">Category</label>
                <input
                  type="text"
                  value={form.category}
                  onChange={e => setField("category", e.target.value)}
                  placeholder="e.g. Maintenance"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-white/20"
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={closeModal}
                className="flex-1 rounded-xl border border-white/15 py-2 text-sm text-white/60 transition hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                onClick={submit}
                disabled={submitting || !form.description.trim() || !form.amount}
                className="flex-1 rounded-xl border border-white/15 bg-white/10 py-2 text-sm font-medium text-white transition hover:bg-white/15 disabled:opacity-40"
              >
                {submitting ? "Saving..." : "Save Expense"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="mb-1 block text-xs text-white/50">{label}</label>
      {children}
    </div>
  );
}
