import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../../components/PageHeader.jsx";
import Card from "../../components/Card.jsx";
import Table from "../../components/Table.jsx";
import StatusDot from "../../components/StatusDot.jsx";
import api from "../../api/axios.js";

export default function Tickets() {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api
            .get("/tickets/my")
            .then((res) => setTickets(res.data))
            .finally(() => setLoading(false));
    }, []);

    const columns = [
        { key: "id", header: "رقم التذكرة" },
        {
            key: "property",
            header: "العقار",
            render: (row) => row.property?.title || "—",
        },
        { key: "category", header: "نوع العطل" },
        {
            key: "priority",
            header: "الأولوية",
            render: (r) => {
                const map = {
                    HIGH: ["red", "عالية"],
                    MEDIUM: ["yellow", "متوسطة"],
                    LOW: ["green", "منخفضة"],
                };
                const [c, label] = map[r.priority] || ["gray", r.priority];
                return <StatusDot color={c} label={label} />;
            },
        },
        {
            key: "status",
            header: "الحالة",
            render: (r) => {
                const map = {
                    OPEN: ["blue", "مفتوحة"],
                    IN_PROGRESS: ["yellow", "قيد التنفيذ"],
                    COMPLETED: ["green", "مكتملة"],
                    CANCELLED: ["red", "ملغاة"],
                };
                const [c, label] = map[r.status] || ["gray", r.status];
                return <StatusDot color={c} label={label} />;
            },
        },
        {
            key: "createdAt",
            header: "تاريخ الإنشاء",
            render: (r) =>
                r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "—",
        },
        {
            key: "actions",
            header: "إجراءات",
            render: (r) => (
                <Link
                    to={`/client/tickets/${r.id}`}
                    className="text-xs text-white/80 hover:underline"
                >
                    عرض التفاصيل
                </Link>
            ),
        },
    ];

    return (
        <section className="space-y-4">
            <PageHeader
                title="تذاكر الصيانة الخاصة بي"
                subtitle="تابع حالة طلبات الصيانة التي قمت بإرسالها."
            />

            <Card className="bg-white/5 border-white/10 backdrop-blur-xl text-white">
                <Table
                    columns={columns}
                    rows={tickets}
                    loading={loading}
                    emptyText="لا توجد تذاكر صيانة حتى الآن."
                />
            </Card>
        </section>
    );
}
