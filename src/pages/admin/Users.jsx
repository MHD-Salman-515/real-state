

import { useEffect, useMemo, useState } from "react";
import PageHeader from "../../components/PageHeader.jsx";
import Toolbar from "../../components/Toolbar.jsx";
import Card from "../../components/Card.jsx";
import Table from "../../components/Table.jsx";
import api from "../../api/axios";

// ⚠ مهم: مطابق لسكيمة Prisma الحالية
// enum Role { ADMIN, ACCOUNTANT, CLIENT, OWNER, SUPPLIER, WORKER }

const ROLE_FILTERS = [
  { value: "", label: "كل الأدوار" },
  { value: "ADMIN", label: "مدير نظام" },
  { value: "ACCOUNTANT", label: "محاسب" },
  { value: "WORKER", label: "فني صيانة" },
  { value: "SUPPLIER", label: "مورد" },
  { value: "OWNER", label: "مالك" },
  { value: "CLIENT", label: "عميل" },
];

const ROLE_LABELS = {
  ADMIN: "مدير نظام",
  ACCOUNTANT: "محاسب",
  WORKER: "فني صيانة",
  SUPPLIER: "مورد",
  OWNER: "مالك عقار",
  CLIENT: "عميل",
};

const ROLE_BADGE = {
  ADMIN: "bg-emerald-500/15 text-emerald-200 border-emerald-400/40",
  ACCOUNTANT: "bg-amber-500/15 text-amber-200 border-amber-400/40",
  WORKER: "bg-violet-500/15 text-violet-200 border-violet-400/40",
  SUPPLIER: "bg-sky-500/15 text-sky-200 border-sky-400/40",
  OWNER: "bg-cyan-500/15 text-cyan-200 border-cyan-400/40",
  CLIENT: "bg-slate-500/15 text-slate-200 border-slate-400/40",
};

export default function AdminUsers() {
  const [rows, setRows] = useState([]);
  const [roleFilter, setRoleFilter] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // مودال إنشاء مستخدم جديد
  const [showNewModal, setShowNewModal] = useState(false);
  const [newUser, setNewUser] = useState({
    fullName: "",
    email: "",
    phone: "",
    role: "WORKER", // افتراضياً موظف
  });

  // تحميل المستخدمين
  const loadUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/users", {
        params: roleFilter ? { role: roleFilter } : {},
      });
      setRows(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      setError("فشل في تحميل المستخدمين");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [roleFilter]);

  const filteredRows = useMemo(
    () => (roleFilter ? rows.filter((r) => r.role === roleFilter) : rows),
    [rows, roleFilter]
  );

  const createUser = async (e) => {
    e.preventDefault();
    if (!newUser.fullName.trim() || !newUser.email.trim()) return;

    try {
      await api.post("/users", {
        fullName: newUser.fullName,
        email: newUser.email,
        phone: newUser.phone,
        password: newUser.password,   // ⭐ تمت الإضافة
        role: newUser.role,
      });

      setShowNewModal(false);
      setNewUser({
        fullName: "",
        email: "",
        phone: "",
        password: "",
        role: "WORKER",
      });
      await loadUsers();
      alert("تم إنشاء المستخدم بنجاح");
    } catch (err) {
      console.error(err);
      const message =
        err.response?.data?.message || "فشل في إنشاء المستخدم";
      alert(message);
    }
  };

  const deleteUser = async (id) => {
    if (!confirm("هل أنت متأكد من الحذف؟")) return;

    try {
      await api.delete(`/users/${id}`);
      alert("تم حذف المستخدم بنجاح");
      await loadUsers();
    } catch (err) {
      console.error(err);
      const message =
        err.response?.data?.message || "حدث خطأ — لا يمكن حذف المستخدم";
      alert(message);
    }
  };

  const updateRole = async (id, role) => {
    try {
      await api.put(`/users/${id}`, { role });
      await loadUsers();
    } catch (err) {
      console.error(err);
      const message =
        err.response?.data?.message || "لم يتم تحديث الدور";
      alert(message);
    }
  };

  const columns = [
    { key: "id", header: "المعرّف" },
    { key: "fullName", header: "الاسم" },
    {
      key: "role",
      header: "الدور / الصلاحية",
      render: (row) => {
        const label = ROLE_LABELS[row.role] || row.role || "غير محدد";
        const cls =
          ROLE_BADGE[row.role] ||
          "bg-slate-500/10 text-slate-200 border-slate-400/30";
        return (
          <span
            className={`inline-flex items-center px-2 py-0.5 text-xs rounded-full border ${cls}`}
          >
            {label}
          </span>
        );
      },
    },
    { key: "email", header: "البريد" },
    { key: "phone", header: "الهاتف" },
    {
      key: "createdAt",
      header: "تاريخ الإنشاء",
      render: (row) =>
        row.createdAt
          ? new Date(row.createdAt).toLocaleDateString("ar-SY")
          : "-",
    },
    {
      key: "actions",
      header: "إجراءات",
      render: (row) => (
        <div className="flex items-center gap-2 justify-end">
          {/* تغيير الدور مباشرة من الجدول */}
          <select
            className="bg-slate-900/60 border border-white/10 rounded-lg px-2 py-1 text-xs"
            value={row.role || ""}
            onChange={(e) => updateRole(row.id, e.target.value)}
          >
            {ROLE_FILTERS.filter((r) => r.value !== "").map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>

          <button
            onClick={() => deleteUser(row.id)}
            className="px-2 py-1 text-xs rounded-lg bg-red-500/15 text-red-200 border border-red-500/40 hover:bg-red-500/25 transition"
          >
            حذف
          </button>
        </div>
      ),
    },
  ];

  return (
    <section className="space-y-4">
      <PageHeader
        title="المستخدمون والصلاحيات"
        subtitle="إدارة الموظفين، العملاء، والموردين مع تحديد أدوارهم وصلاحياتهم."
      />

      <Toolbar>
        {/* فلتر الأدوار */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-300">تصفية حسب الدور:</label>
          <select
            className="bg-slate-900/60 border border-white/10 rounded-lg px-3 py-1 text-xs text-slate-100"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            {ROLE_FILTERS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={() => setShowNewModal(true)}
          className="px-3 py-1.5 rounded-xl text-xs font-medium bg-emerald-500/90 text-black hover:bg-emerald-400 transition"
        >
          + مستخدم جديد
        </button>
      </Toolbar>

      <Card className="bg-slate-900/60 border-white/10">
        {loading && (
          <div className="text-xs text-slate-300 mb-2">جارٍ التحميل…</div>
        )}
        {error && (
          <div className="text-xs text-red-300 mb-2">
            {error}
          </div>
        )}

        <Table columns={columns} rows={filteredRows} />

        <p className="mt-3 text-[11px] text-slate-400">
          ملاحظة: الأدوار (Roles) هي طبقة الصلاحيات الحالية. لاحقًا يمكنك
          توسيعها إلى Permission Matrix أدق لو حبيتِ.
        </p>
      </Card>

      {/* مودال إنشاء مستخدم جديد */}
      {showNewModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-40">
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-5 w-full max-w-md space-y-4">
            <h2 className="text-lg font-semibold text-white">
              مستخدم جديد
            </h2>

            <form className="space-y-3" onSubmit={createUser}>
              <div className="space-y-1">
                <label className="text-xs text-slate-300">الاسم الكامل</label>
                <input
                  className="w-full bg-slate-950/60 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-slate-100"
                  value={newUser.fullName}
                  onChange={(e) =>
                    setNewUser((prev) => ({ ...prev, fullName: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-300">البريد الإلكتروني</label>
                <input
                  type="email"
                  className="w-full bg-slate-950/60 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-slate-100"
                  value={newUser.email}
                  onChange={(e) =>
                    setNewUser((prev) => ({ ...prev, email: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-300">الهاتف</label>
                <input
                  className="w-full bg-slate-950/60 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-slate-100"
                  value={newUser.phone}
                  onChange={(e) =>
                    setNewUser((prev) => ({ ...prev, phone: e.target.value }))
                  }
                />
              </div>

              {/* ⭐ تمت إضافته — حقل كلمة المرور */}
              <div className="space-y-1">
                <label className="text-xs text-slate-300">كلمة المرور</label>
                <input
                  type="password"
                  required
                  className="w-full bg-slate-950/60 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-slate-100"
                  value={newUser.password || ""}
                  onChange={(e) =>
                    setNewUser((prev) => ({ ...prev, password: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-300">الدور / الصلاحية</label>
                <select
                  className="w-full bg-slate-950/60 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-slate-100"
                  value={newUser.role}
                  onChange={(e) =>
                    setNewUser((prev) => ({ ...prev, role: e.target.value }))
                  }
                >
                  {ROLE_FILTERS.filter((r) => r.value !== "").map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-3 py-1.5 text-xs rounded-xl border border-white/20 text-slate-200 hover:bg-white/5"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs rounded-xl bg-emerald-500 text-black font-medium hover:bg-emerald-400"
                >
                  حفظ
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </section>
  );
}
