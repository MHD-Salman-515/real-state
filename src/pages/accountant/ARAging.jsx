import { useEffect, useState } from "react";
import { useTranslation } from 'react-i18next';
import api from "../../api/axios";
import PageHeader from "../../components/PageHeader";
import Card from "../../components/Card";
import Table from "../../components/Table";
import { useToast } from "../../components/ToastProvider";

const BUCKETS = ["0-30 days", "31-60 days", "61-90 days", "90+ days"];

export default function ARAging() {
  const toast = useToast();
  const { t } = useTranslation();
  const [rows, setRows] = useState([]);

  const load = async () => {
    try {
      const res = await api.get("/invoices");
      const unpaid = res.data.filter((i) => i.status === "PENDING" || i.status === "OVERDUE");
      const today = new Date();

      const enriched = unpaid.map((inv) => {
        let days = 0;
        if (inv.dueDate) {
          const due = new Date(inv.dueDate);
          const diff = today - due;
          days = Math.floor(diff / (1000 * 60 * 60 * 24));
        }

        let bucket = "";
        if (days <= 30) bucket = "0-30 days";
        else if (days <= 60) bucket = "31-60 days";
        else if (days <= 90) bucket = "61-90 days";
        else bucket = "90+ days";

        return {
          ...inv,
          daysLate: days < 0 ? 0 : days,
          bucket,
        };
      });

      setRows(enriched);
    } catch (err) {
      toast.error(t("Failed to load aging data"));
    }
  };

  useEffect(() => {
    load();
  }, []);

  const columns = [
    { key: "id", header: "#" },
    { key: "client", header: t("Client"), render: (i) => i.client?.fullName || "-" },
    { key: "property", header: t("Property"), render: (i) => i.property?.title || "-" },
    { key: "amount", header: t("Amount"), render: (i) => `${Number(i.totalAmount || 0).toFixed(2)} $` },
    {
      key: "dueDate",
      header: t("Due Date"),
      render: (i) => (i.dueDate ? new Date(i.dueDate).toLocaleDateString() : "-"),
    },
    {
      key: "daysLate",
      header: t("Days Late"),
      render: (i) => (
        <span className={i.daysLate > 0 ? "text-rose-300" : "text-white/80"}>{i.daysLate}</span>
      ),
    },
    { key: "bucket", header: t("Bucket") },
  ];

  return (
    <section className="space-y-4">
      <PageHeader
        title={t("A/R Aging")}
        subtitle={t("Analyze unpaid invoices by aging buckets.")}
        actions={
          <button
            onClick={load}
            className="rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white/90 transition hover:bg-white/10"
          >
            {t("Refresh")}
          </button>
        }
      />

      <Card className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
        <div className="mb-3">
          <h3 className="text-sm font-semibold text-white md:text-base">{t("A/R Aging List")}</h3>
          <p className="mt-1 text-xs text-slate-300">{t("Open receivables and aging status by invoice.")}</p>
        </div>
        <Table columns={columns} rows={rows} emptyText={t("No unpaid invoices found")} />
      </Card>

      <div className="grid gap-3 md:grid-cols-4">
        {BUCKETS.map((b) => (
          <Card
            key={b}
            className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center backdrop-blur-xl"
          >
            <h3 className="text-sm font-semibold text-white">{t(b)}</h3>
            <p className="mt-2 text-3xl font-semibold text-white/90">
              {rows.filter((r) => r.bucket === b).length}
            </p>
          </Card>
        ))}
      </div>
    </section>
  );
}
