import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import PageHeader from "../../components/PageHeader.jsx";
import Card from "../../components/Card.jsx";
import StatusDot from "../../components/StatusDot.jsx";
import api from "../../api/axios.js";

export default function TicketDetails() {
    const { id } = useParams();
    const ticketId = Number(id);

    const [ticket, setTicket] = useState(null);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!ticketId) return;

        Promise.all([
            api.get(`/tickets/${ticketId}`),
            api.get(`/ticket-logs/${ticketId}`),
        ])
            .then(([tRes, lRes]) => {
                setTicket(tRes.data);
                setLogs(lRes.data || []);
            })
            .finally(() => setLoading(false));
    }, [ticketId]);

    if (!ticketId) {
        return <div className="p-4">رقم تذكرة غير صالح.</div>;
    }

    if (loading) {
        return <div className="p-4">جاري تحميل تفاصيل التذكرة…</div>;
    }

    if (!ticket) {
        return <div className="p-4">لم يتم العثور على التذكرة.</div>;
    }

    const priorityMap = {
        HIGH: ["red", "عالية"],
        MEDIUM: ["yellow", "متوسطة"],
        LOW: ["green", "منخفضة"],
    };

    const statusMap = {
        OPEN: ["blue", "مفتوحة"],
        IN_PROGRESS: ["yellow", "قيد التنفيذ"],
        COMPLETED: ["green", "مكتملة"],
        CANCELLED: ["red", "ملغاة"],
    };

    const [pColor, pLabel] = priorityMap[ticket.priority] || ["gray", ticket.priority];
    const [sColor, sLabel] = statusMap[ticket.status] || ["gray", ticket.status];

    return (
        <section className="space-y-4">
            <PageHeader
                title={`تذكرة صيانة رقم T-${ticket.id}`}
                subtitle={ticket.property?.title || "عقار غير معروف"}
                extra={
                    <Link
                        to="/client/tickets"
                        className="text-xs text-white/80 hover:underline"
                    >
                        ← العودة لقائمة التذاكر
                    </Link>
                }
            />

            {/* معلومات أساسية */}
            <Card className="p-4 bg-white/5 border-white/10 backdrop-blur-xl text-white space-y-3">
                <div className="grid gap-3 md:grid-cols-2">
                    <div>
                        <div className="text-xs text-slate-300">الحالة</div>
                        <StatusDot color={sColor} label={sLabel} />
                    </div>
                    <div>
                        <div className="text-xs text-slate-300">الأولوية</div>
                        <StatusDot color={pColor} label={pLabel} />
                    </div>
                    <div>
                        <div className="text-xs text-slate-300">نوع العطل</div>
                        <div className="text-sm">{ticket.category}</div>
                    </div>
                    <div>
                        <div className="text-xs text-slate-300">تاريخ الإنشاء</div>
                        <div className="text-sm">
                            {ticket.createdAt
                                ? new Date(ticket.createdAt).toLocaleString()
                                : "—"}
                        </div>
                    </div>
                </div>

                <div>
                    <div className="text-xs text-slate-300 mb-1">وصف المشكلة</div>
                    <p className="text-sm leading-relaxed">{ticket.description}</p>
                </div>
            </Card>

            {/* الخط الزمني للسجلات */}
            <Card className="p-4 bg-white/5 border-white/10 backdrop-blur-xl text-white">
                <h2 className="text-sm font-semibold mb-3">سجل التذكرة</h2>

                {logs.length === 0 ? (
                    <p className="text-xs text-slate-300">لا توجد سجلات بعد لهذه التذكرة.</p>
                ) : (
                    <ul className="space-y-3">
                        {logs.map((log) => (
                            <li key={log.id} className="flex gap-3">
                                <div className="mt-1">
                                    <span className="block w-2 h-2 rounded-full bg-white/10" />
                                </div>
                                <div className="flex-1 space-y-1">
                                    <div className="flex flex-wrap justify-between gap-2 text-xs text-slate-300">
                                        <span>
                                            {log.actionDate
                                                ? new Date(log.actionDate).toLocaleString()
                                                : ""}
                                        </span>
                                        <span>{log.user?.fullName || "نظام"}</span>
                                    </div>
                                    <div className="text-sm">{log.action}</div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </Card>
        </section>
    );
}
