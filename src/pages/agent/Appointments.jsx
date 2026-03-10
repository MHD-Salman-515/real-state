import { useEffect, useState } from "react";
import api, { AUTH_ME_PATH } from "../../api/axios";
import { useToast } from "../../components/ToastProvider";
import { notifyCrudError, notifyCrudSuccess } from "../../utils/notify.js";

export default function AgentLayout() {
  const toast = useToast();
  const [user, setUser] = useState(null);

  // بيانات العقارات
  const [properties, setProperties] = useState([]);

  // بيانات المواعيد
  const [appointments, setAppointments] = useState([]);

  // فورم إضافة عقار
  const [showAddForm, setShowAddForm] = useState(false);
  const [showTrackList, setShowTrackList] = useState(false);

  const [newProperty, setNewProperty] = useState({
    title: "",
    city: "",
    price: "",
    type: "بيع",
    area: "",
  });

  // ============================
  // 1) جلب بيانات المستخدم الحالي
  // ============================
  useEffect(() => {
    api.get(AUTH_ME_PATH)
      .then((res) => setUser(res.data))
      .catch(() => toast.error("لم يتم التحقق من المستخدم"));
  }, []);

  // ============================
  // 2) جلب عقارات الوكيل
  // ============================
  const loadProperties = () => {
    if (!user) return;
    api.get(`/properties/agent/${user.sub}`)
      .then((res) => setProperties(res.data))
      .catch(() => toast.error("فشل تحميل العقارات"));
  };

  // ============================
  // 3) جلب مواعيد الوكيل
  // ============================
  const loadAppointments = () => {
    if (!user) return;
    api.get(`/appointments?agentId=${user.sub}`)
      .then((res) => setAppointments(res.data))
      .catch(() => toast.error("فشل تحميل المواعيد"));
  };

  // تحميل العقارات والمواعيد بعد تحميل المستخدم
  useEffect(() => {
    if (user) {
      loadProperties();
      loadAppointments();
    }
  }, [user]);

  // ============================
  // 4) إضافة عقار جديد
  // ============================
  const submitNewProperty = (e) => {
    e.preventDefault();

    api.post("/properties", newProperty)
      .then(() => {
        notifyCrudSuccess("Property added successfully");
        loadProperties();
        setShowAddForm(false);
        setNewProperty({
          title: "",
          city: "",
          price: "",
          type: "بيع",
          area: "",
        });
      })
      .catch(() => notifyCrudError("Failed to add property"));
  };

  // ============================
  // 5) حذف عقار
  // ============================
  const removeProperty = (id) => {
    api.delete(`/properties/${id}`)
      .then(() => {
        notifyCrudSuccess("Property deleted");
        loadProperties();
      })
      .catch(() => notifyCrudError("Failed to delete property"));
  };

  // ============================
  // 6) تحديث حالة الموعد
  // ============================
  const updateAppointment = (id, status) => {
    api.patch(`/appointments/${id}`, { status })
      .then(() => {
        notifyCrudSuccess("Appointment status updated");
        loadAppointments();
      })
      .catch(() => notifyCrudError("Failed to update appointment"));
  };

  return (
    <div className="min-h-screen bg-luxury text-white p-4 lg:p-6">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* العنوان */}
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold">مواعيد الوكيل العقاري</h1>
          <p className="text-slate-300">
            إدارة المواعيد والعقارات الخاصة بالوكيل.
          </p>
        </header>

        {/* أزرار القائمة */}
        <section className="grid gap-3 md:grid-cols-2">
          <button
            onClick={() => {
              setShowAddForm(!showAddForm);
              setShowTrackList(false);
            }}
            className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 shadow-md hover:bg-white/10"
          >
            <div className="text-sm font-semibold">إضافة عقار للبيع</div>
            <div className="text-xs text-white/90 mt-1">
              تسجيل عقار جديد وعرضه للمتابعة.
            </div>
          </button>

          <button
            onClick={() => {
              setShowTrackList(!showTrackList);
              setShowAddForm(false);
            }}
            className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 shadow-md hover:bg-white/10"
          >
            <div className="text-sm font-semibold">
              متابعة حالة العقارات
            </div>
            <div className="text-xs text-white/80 mt-1">
              عرض العقارات المرتبطة بالوكيل.
            </div>
          </button>
        </section>

        {/* إضافة عقار */}
        {showAddForm && (
          <section className="rounded-2xl border border-white/15 bg-black/40 p-5 space-y-4">
            <h2 className="text-lg font-semibold">إضافة عقار</h2>

            <form onSubmit={submitNewProperty} className="grid gap-3 md:grid-cols-2">

              <input
                className="input"
                placeholder="عنوان العقار"
                value={newProperty.title}
                onChange={(e) =>
                  setNewProperty({ ...newProperty, title: e.target.value })
                }
              />

              <input
                className="input"
                placeholder="المدينة"
                value={newProperty.city}
                onChange={(e) =>
                  setNewProperty({ ...newProperty, city: e.target.value })
                }
              />

              <input
                type="number"
                className="input"
                placeholder="السعر"
                value={newProperty.price}
                onChange={(e) =>
                  setNewProperty({ ...newProperty, price: e.target.value })
                }
              />

              <select
                className="input"
                value={newProperty.type}
                onChange={(e) =>
                  setNewProperty({ ...newProperty, type: e.target.value })
                }
              >
                <option value="بيع">بيع</option>
                <option value="إيجار">إيجار</option>
              </select>

              <input
                type="number"
                className="input md:col-span-2"
                placeholder="المساحة (م²)"
                value={newProperty.area}
                onChange={(e) =>
                  setNewProperty({ ...newProperty, area: e.target.value })
                }
              />

              <div className="md:col-span-2 flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowAddForm(false)}
                >
                  إلغاء
                </button>

                <button type="submit" className="btn-primary">
                  إضافة
                </button>
              </div>
            </form>
          </section>
        )}

        {/* عرض العقارات */}
        {showTrackList && (
          <section className="rounded-2xl border border-white/15 bg-black/40 p-5 space-y-4">
            <h2 className="text-lg font-semibold">عقارات الوكيل</h2>

            {properties.length === 0 ? (
              <p className="text-slate-400 text-sm">لا توجد عقارات.</p>
            ) : (
              <div className="space-y-3">
                {properties.map((p) => (
                  <div
                    key={p.id}
                    className="bg-white/5 rounded-xl p-4 flex justify-between items-center"
                  >
                    <div>
                      <div className="text-white font-semibold">{p.title}</div>
                      <div className="text-slate-400 text-xs">
                        رقم العقار: {p.id}
                      </div>
                    </div>

                    <button
                      onClick={() => removeProperty(p.id)}
                      className="text-red-400 hover:text-red-300 text-sm"
                    >
                      حذف
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* جدول المواعيد */}
        <section className="rounded-2xl border border-white/10 bg-black/30 p-4">
          <h2 className="text-lg font-semibold mb-3">مواعيد المعاينة</h2>

          {appointments.length === 0 ? (
            <p className="text-slate-400 text-sm">لا توجد مواعيد.</p>
          ) : (
            appointments.map((a) => (
              <div
                key={a.id}
                className="bg-white/5 rounded-xl p-4 mb-2 flex justify-between items-center"
              >
                <div>
                  <div className="text-white font-semibold">
                    {a.property?.title || "—"}
                  </div>
                  <div className="text-slate-400 text-xs">
                    الموعد: {a.date} — {a.time}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    className="btn-small bg-white/10"
                    onClick={() => updateAppointment(a.id, "تم التأكيد")}
                  >
                    تأكيد
                  </button>

                  <button
                    className="btn-small bg-red-600"
                    onClick={() => updateAppointment(a.id, "ملغاة")}
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            ))
          )}
        </section>
      </div>
    </div>
  );
}
