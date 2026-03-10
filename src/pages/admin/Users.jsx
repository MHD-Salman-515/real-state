import { useEffect, useMemo, useState } from "react";
import PageHeader from "../../components/PageHeader.jsx";
import Toolbar from "../../components/Toolbar.jsx";
import Card from "../../components/Card.jsx";
import api from "../../api/axios";
import { notifyCrudError, notifyCrudSuccess } from "../../utils/notify.js";

const ROLE_FILTERS = [
  { value: "", label: "All roles" },
  { value: "ADMIN", label: "System Admin" },
  { value: "ACCOUNTANT", label: "Accountant" },
  { value: "WORKER", label: "Worker" },
  { value: "SUPPLIER", label: "Supplier" },
  { value: "OWNER", label: "Owner" },
  { value: "CLIENT", label: "Client" },
];

const FALLBACK_ROLES = ["ADMIN", "ACCOUNTANT", "WORKER", "SUPPLIER", "OWNER", "CLIENT"];

const ROLE_LABELS = {
  ADMIN: "System Admin",
  ACCOUNTANT: "Accountant",
  WORKER: "Worker",
  SUPPLIER: "Supplier",
  OWNER: "Property Owner",
  CLIENT: "Client",
};

const ROLE_BADGE = {
  ADMIN: "bg-white/10 text-white/90 border-white/15",
  ACCOUNTANT: "bg-white/10 text-white/80 border-white/15",
  WORKER: "bg-violet-500/15 text-violet-200 border-violet-400/40",
  SUPPLIER: "bg-sky-500/15 text-sky-200 border-sky-400/40",
  OWNER: "bg-white/10 text-white/80 border-white/15",
  CLIENT: "bg-slate-500/15 text-slate-200 border-slate-400/40",
};

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  );
}

export default function AdminUsers({
  pageTitle = "Users",
  pageSubtitle = "Manage users, roles, and permissions for operations",
}) {
  const [rows, setRows] = useState([]);
  const [roleFilter, setRoleFilter] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [showNewModal, setShowNewModal] = useState(false);
  const [newUser, setNewUser] = useState({
    fullName: "",
    email: "",
    phone: "",
    role: "WORKER",
  });

  const loadUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/users", {
        params: roleFilter ? { role: roleFilter } : {},
      });
      const payload = res.data;
      const nextRows = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload?.items)
            ? payload.items
            : [];
      setRows(nextRows);
    } catch (err) {
      const status = err?.response?.status;
      console.error(err);
      const message =
        err?.response?.data?.message ||
        (status ? `Failed to load users (HTTP ${status})` : "Failed to load users");
      setError(String(message));
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
        password: newUser.password,
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
      notifyCrudSuccess("User created successfully", "Operation successful", {
        href: "/admin/users",
      });
    } catch (err) {
      console.error(err);
      const message = err.response?.data?.message || "Failed to create user";
      notifyCrudError(message, "Operation failed", {
        href: "/admin/users",
      });
    }
  };

  const deleteUser = async (row) => {
    const id = row?.id;
    const role = String(row?.role || "").toUpperCase();
    const name = row?.fullName || row?.email || `#${id}`;
    const strongNotice =
      role === "ADMIN"
        ? `\n\nHigh-impact action: this account has ADMIN privileges.`
        : "";
    if (!confirm(`Delete user ${name}? This action cannot be undone.${strongNotice}`)) return;

    try {
      await api.delete(`/users/${id}`);
      notifyCrudSuccess("User deleted", "Operation successful", {
        href: "/admin/users",
      });
      await loadUsers();
    } catch (err) {
      console.error(err);
      const message = err.response?.data?.message || "Error: cannot delete user";
      notifyCrudError(message, "Operation failed", {
        href: "/admin/users",
      });
    }
  };

  const updateRole = async (id, role) => {
    try {
      await api.put(`/users/${id}`, { role });
      await loadUsers();
      notifyCrudSuccess("User role updated", "Operation successful", {
        href: "/admin/users",
      });
    } catch (err) {
      console.error(err);
      const message = err.response?.data?.message || "Role update failed";
      notifyCrudError(message, "Operation failed", {
        href: "/admin/users",
      });
    }
  };

  return (
    <section className="space-y-4">
      <PageHeader title={pageTitle} subtitle={pageSubtitle} />
      <p className="text-xs text-slate-400">Workforce & Suppliers</p>

      <Toolbar className="rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-xl">
        <div className="flex w-full flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-300">Role filter:</label>
            <select
              className="rounded-xl border border-white/10 bg-slate-900/60 px-3 py-2 text-xs text-slate-100"
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
            className="self-start rounded-xl bg-white/10 px-3 py-2 text-xs font-medium text-black transition hover:bg-white/10 md:self-auto"
          >
            Create User
          </button>
        </div>
      </Toolbar>

      <Card className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl">
        <div className="border-b border-white/10 px-4 py-3 md:px-5">
          <h3 className="text-sm font-semibold text-white md:text-base">All Users</h3>
          <p className="mt-1 text-xs text-slate-300 md:text-sm">Manage roles and access.</p>
        </div>

        {loading ? (
          <div className="p-4">
            <div className="animate-pulse space-y-2">
              <div className="h-10 rounded-xl bg-white/10" />
              <div className="h-10 rounded-xl bg-white/10" />
              <div className="h-10 rounded-xl bg-white/10" />
              <div className="h-10 rounded-xl bg-white/10" />
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[980px] text-sm leading-5 text-slate-100">
              <thead className="sticky top-0 z-10 bg-black/40 backdrop-blur-xl">
                <tr className="border-b border-white/10">
                  <th className="min-w-[90px] whitespace-nowrap px-4 py-3 align-middle text-left text-[11px] font-semibold uppercase tracking-wide text-slate-300 tabular-nums">ID</th>
                  <th className="px-4 py-3 align-middle text-left text-[11px] font-semibold uppercase tracking-wide text-slate-300">Name</th>
                  <th className="px-4 py-3 align-middle text-left text-[11px] font-semibold uppercase tracking-wide text-slate-300">Role</th>
                  <th className="px-4 py-3 align-middle text-left text-[11px] font-semibold uppercase tracking-wide text-slate-300">Email</th>
                  <th className="whitespace-nowrap px-4 py-3 align-middle text-left text-[11px] font-semibold uppercase tracking-wide text-slate-300">Phone</th>
                  <th className="whitespace-nowrap px-4 py-3 align-middle text-left text-[11px] font-semibold uppercase tracking-wide text-slate-300">Created At</th>
                  <th className="w-[120px] whitespace-nowrap px-4 py-3 align-middle text-center text-[11px] font-semibold uppercase tracking-wide text-slate-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {error ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-6 text-center text-sm text-red-300">{error}</td>
                  </tr>
                ) : filteredRows.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-6 text-center text-sm text-slate-400">No data available</td>
                  </tr>
                ) : (
                  filteredRows.map((row) => {
                    const label = ROLE_LABELS[row.role] || row.role || "Unspecified";
                    const cls = ROLE_BADGE[row.role] || "bg-slate-500/10 text-slate-200 border-slate-400/30";
                    return (
                      <tr key={row.id} className="transition-colors even:bg-white/[0.02] hover:bg-white/5">
                        <td className="min-w-[90px] whitespace-nowrap px-4 py-3 align-middle tabular-nums">{row.id}</td>
                        <td className="max-w-[170px] truncate px-4 py-3 align-middle" title={row.fullName}>{row.fullName}</td>
                        <td className="px-4 py-3 align-middle">
                          <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs ${cls}`}>
                            {label}
                          </span>
                        </td>
                        <td className="max-w-[220px] truncate px-4 py-3 align-middle" title={row.email}>{row.email}</td>
                        <td className="whitespace-nowrap px-4 py-3 align-middle">{row.phone}</td>
                        <td className="whitespace-nowrap px-4 py-3 align-middle">
                          {row.createdAt ? new Date(row.createdAt).toLocaleDateString("ar-SY") : "-"}
                        </td>
                        <td className="w-[120px] whitespace-nowrap px-4 py-3 align-middle text-center">
                          <div className="flex items-center justify-center gap-2">
                            <select
                              className="rounded-lg border border-white/10 bg-slate-900/60 px-2 py-1 text-xs"
                              value={row.role || ""}
                              onChange={(e) => updateRole(row.id, e.target.value)}
                            >
                              {ROLE_FILTERS.filter((r) => r.value !== "").map((r) => (
                                <option key={r.value} value={r.value}>{r.label}</option>
                              ))}
                            </select>

                            <button
                              onClick={() => deleteUser(row)}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-red-500/40 bg-red-500/10 text-red-300 transition duration-200 hover:bg-red-500/20"
                              title="Delete user"
                              aria-label="Delete user"
                            >
                              <TrashIcon />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {showNewModal ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#050912]/95 p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">Create User</h2>
                <p className="mt-1 text-xs text-slate-400">Enter user details and assign role.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowNewModal(false)}
                className="rounded-lg border border-white/20 px-2 py-1 text-xs text-slate-300 transition hover:bg-white/10"
              >
                Close
              </button>
            </div>

            <form className="space-y-3" onSubmit={createUser}>
              <div className="space-y-1">
                <label className="text-xs text-slate-300">Full name</label>
                <input
                  className="w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-white/15"
                  value={newUser.fullName}
                  onChange={(e) => setNewUser((prev) => ({ ...prev, fullName: e.target.value }))}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-300">Email</label>
                <input
                  type="email"
                  className="w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-white/15"
                  value={newUser.email}
                  onChange={(e) => setNewUser((prev) => ({ ...prev, email: e.target.value }))}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-300">Phone</label>
                <input
                  className="w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-white/15"
                  value={newUser.phone}
                  onChange={(e) => setNewUser((prev) => ({ ...prev, phone: e.target.value }))}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-300">Password</label>
                <input
                  type="password"
                  required
                  className="w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-white/15"
                  value={newUser.password || ""}
                  onChange={(e) => setNewUser((prev) => ({ ...prev, password: e.target.value }))}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-300">Role</label>
                <select
                  className="w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-white/15"
                  value={newUser.role}
                  onChange={(e) => setNewUser((prev) => ({ ...prev, role: e.target.value }))}
                >
                  {ROLE_FILTERS.filter((r) => r.value !== "").map((r) => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="rounded-xl border border-white/20 px-3 py-1.5 text-xs text-slate-200 transition hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-white/10 px-3 py-1.5 text-xs font-medium text-black transition hover:bg-white/10"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </section>
  );
}
