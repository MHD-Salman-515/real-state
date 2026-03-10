import { useState, useEffect } from "react";
import api, { AUTH_ME_PATH } from "../../api/axios";
import Card from "../../components/Card";
import PageHeader from "../../components/PageHeader";
import { useToast } from "../../components/ToastProvider";

export default function AgentLinkOps() {
  const toast = useToast();

  const [tab, setTab] = useState("properties");
  const [user, setUser] = useState(null);

  const [properties, setProperties] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [commissions, setCommissions] = useState([]);
  const [tickets, setTickets] = useState([]);

  // ============================
  //  تحميل بيانات المستخدم
  // ============================
  useEffect(() => {
    api.get(AUTH_ME_PATH).then((res) => setUser(res.data));
  }, []);

  // ============================
  // تحميل البيانات حسب التبويب
  // ============================
  useEffect(() => {
    if (!user) return;

    if (tab === "properties") loadProperties();
    if (tab === "appointments") loadAppointments();
    if (tab === "commissions") loadCommissions();
    if (tab === "tickets") loadTickets();
  }, [tab, user]);

  const loadProperties = () => {
    api.get(`/properties/agent/${user.sub}`).then((res) => {
      setProperties(res.data);
    });
  };

  const loadAppointments = () => {
    api.get(`/appointments?agentId=${user.sub}`).then((res) => {
      setAppointments(res.data);
    });
  };

  const loadCommissions = () => {
    api.get(`/commissions?agentId=${user.sub}`).then((res) => {
      setCommissions(res.data);
    });
  };

  const loadTickets = () => {
    api.get(`/tickets?agentId=${user.sub}`).then((res) => {
      setTickets(res.data);
    });
  };

  // ============================
  // واجهة التبويبات
  // ============================
  const TabButton = ({ id, label }) => (
    <button
      className={`px-4 py-2 rounded-xl text-sm ${tab === id
          ? "bg-white/10 text-white"
          : "bg-white/10 text-slate-300 hover:bg-white/20"
        }`}
      onClick={() => setTab(id)}
    >
      {label}
    </button>
  );

  return (
    <>
      <PageHeader
        title="ربط العمليات"
        subtitle="ربط الوكيل بالعقارات، المواعيد، العمولات، والتذاكر"
      />

      <Card className="p-6 bg-white/5 border-white/10 rounded-2xl text-white shadow-soft">

        {/* التبويبات */}
        <div className="flex gap-2 mb-6">
          <TabButton id="properties" label="العقارات" />
          <TabButton id="appointments" label="المواعيد" />
          <TabButton id="commissions" label="العمولات" />
          <TabButton id="tickets" label="التذاكر" />
        </div>

        {/* ##############################
            #  محتوى تبويب العقارات
            ############################## */}
        {tab === "properties" && (
          <div className="space-y-3">
            {properties.map((p) => (
              <div
                key={p.id}
                className="bg-white/10 p-4 rounded-xl flex justify-between"
              >
                <div>
                  <div className="font-semibold">{p.title}</div>
                  <div className="text-slate-400 text-xs">ID: {p.id}</div>
                </div>
                <div className="text-white/90 text-sm">{p.city}</div>
              </div>
            ))}

            {properties.length === 0 && (
              <p className="text-slate-400 text-sm">لا توجد عقارات مرتبطة.</p>
            )}
          </div>
        )}

        {/* ##############################
            #  محتوى تبويب المواعيد
            ############################## */}
        {tab === "appointments" && (
          <div className="space-y-3">
            {appointments.map((a) => (
              <div
                key={a.id}
                className="bg-white/10 p-4 rounded-xl flex justify-between"
              >
                <div>
                  <div className="font-semibold">
                    {a.property?.title || "—"}
                  </div>
                  <div className="text-slate-400 text-xs">
                    {a.date} — {a.time}
                  </div>
                </div>
                <div className="text-white/80">{a.status}</div>
              </div>
            ))}

            {appointments.length === 0 && (
              <p className="text-slate-400 text-sm">لا توجد مواعيد.</p>
            )}
          </div>
        )}

        {/* ##############################
            #  محتوى تبويب العمولات
            ############################## */}
        {tab === "commissions" && (
          <div className="space-y-3">
            {commissions.map((c) => (
              <div
                key={c.id}
                className="bg-white/10 p-4 rounded-xl flex justify-between"
              >
                <div>
                  <div className="font-semibold">{c.property?.title}</div>
                  <div className="text-slate-400 text-xs">
                    {c.amount} — {c.status}
                  </div>
                </div>
              </div>
            ))}

            {commissions.length === 0 && (
              <p className="text-slate-400 text-sm">لا توجد عمولات.</p>
            )}
          </div>
        )}

        {/* ##############################
            #  محتوى تبويب التذاكر
            ############################## */}
        {tab === "tickets" && (
          <div className="space-y-3">
            {tickets.map((t) => (
              <div
                key={t.id}
                className="bg-white/10 p-4 rounded-xl rounded-xl flex justify-between"
              >
                <div>
                  <div className="font-semibold">{t.title}</div>
                  <div className="text-slate-400 text-xs">
                    الحالة: {t.status}
                  </div>
                </div>

                <div className="text-white/80 text-sm">
                  {t.priority}
                </div>
              </div>
            ))}

            {tickets.length === 0 && (
              <p className="text-slate-400 text-sm">لا توجد تذاكر.</p>
            )}
          </div>
        )}
      </Card>
    </>
  );
}
