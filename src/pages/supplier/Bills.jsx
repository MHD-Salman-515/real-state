import { useEffect, useMemo, useState } from "react";
import { useTranslation } from 'react-i18next';
import PageHeader from "../../components/PageHeader.jsx";
import Card from "../../components/Card.jsx";
import Table from "../../components/Table.jsx";
import { useToast } from "../../components/ToastProvider.jsx";
import api from "../../api/axios";

export default function Bills() {
  const toast = useToast();
  const { t } = useTranslation();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      const res = await api.get("/expenses/my");
      setRows(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error(t("Failed to load your expenses"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const data = useMemo(
    () =>
      (rows || []).map((e) => {
        const propertyTitle = e.ticket?.property?.title || "-";
        const propertyCity = e.ticket?.property?.city || "";
        const ticketLabel = `#${e.ticketId || e.ticket?.id || "?"}`;
        const invoiceStatus = e.invoice
          ? `#${e.invoice.id} - ${e.invoice.status}`
          : t("Awaiting accountant invoice creation");

        return {
          id: e.id,
          ticket: `${ticketLabel} - ${propertyTitle} ${propertyCity}`,
          amount: e.amount,
          expenseDate: e.expenseDate ? new Date(e.expenseDate).toLocaleDateString() : "",
          description: e.description || "",
          invoiceInfo: invoiceStatus,
        };
      }),
    [rows]
  );

  const columns = [
    { key: "id", header: "ID" },
    { key: "ticket", header: t("Ticket / Property") },
    {
      key: "amount",
      header: t("Amount"),
      render: (r) => Number(r.amount || 0).toLocaleString(),
    },
    { key: "expenseDate", header: t("Expense Date") },
    { key: "description", header: t("Description") },
    { key: "invoiceInfo", header: t("Invoice Status") },
  ];

  return (
    <section className="space-y-4">
      <PageHeader
        title={t("Bills")}
        subtitle={t("All logged supplier expenses and invoice status tracking.")}
      />

      {loading ? (
        <Card className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm backdrop-blur-xl">
          {t("Loading data...")}
        </Card>
      ) : data.length === 0 ? (
        <Card className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-sm backdrop-blur-xl">
          {t("No expenses have been added yet.")}
          <div className="mt-2 text-xs text-slate-400">
            {t("Start from Cost Link to add expenses for assigned tickets.")}
          </div>
        </Card>
      ) : (
        <Card className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
          <div className="mb-3">
            <h3 className="text-sm font-semibold text-white md:text-base">{t("Supplier Expense Records")}</h3>
            <p className="mt-1 text-xs text-slate-300">
              {t("Review your expense entries and related invoice status.")}
            </p>
          </div>
          <Table columns={columns} rows={data} />
        </Card>
      )}
    </section>
  );
}
