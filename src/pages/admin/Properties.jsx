import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import PageHeader from "../../components/PageHeader.jsx";
import Toolbar from "../../components/Toolbar.jsx";
import Card from "../../components/Card.jsx";
import { notifyCrudError, notifyCrudSuccess } from "../../utils/notify.js";
import { extractApiErrorMessage, resolveApiAssetUrl } from "../../api/axios";
import {
  createAdminProperty,
  deleteAdminProperty,
  listAdminProperties,
  updateAdminProperty,
} from "../../services/adminProperties.api.ts";

const PAGE_SIZE = 50;
const PLACEHOLDER_SRC = "/placeholder-property.svg";
const EMPTY_FORM = {
  ownerId: "",
  title: "",
  description: "",
  address: "",
  city: "",
  type: "APARTMENT",
  price: "",
  area: "",
  imageFile: null,
};

const PROPERTY_TYPES = [
  { value: "APARTMENT", label: "Apartment" },
  { value: "HOUSE", label: "House" },
  { value: "VILLA", label: "Villa" },
  { value: "STUDIO", label: "Studio" },
  { value: "LAND", label: "Land" },
];

function EditIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 1 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

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

function toFormState(property) {
  if (!property) return { ...EMPTY_FORM };
  return {
    ownerId: property.ownerId != null ? String(property.ownerId) : "",
    title: property.title || "",
    description: property.description || "",
    address: property.address || "",
    city: property.city || "",
    type: property.type || "APARTMENT",
    price: property.price != null ? String(property.price) : "",
    area: property.area != null ? String(property.area) : "",
    imageFile: null,
  };
}

function resolveOwnerLabel(property) {
  const owner = property?.owner;
  return (
    owner?.fullName ||
    owner?.name ||
    owner?.email ||
    property?.ownerId ||
    owner?.id ||
    "—"
  );
}

function resolveImageSrc(property) {
  if (!property?.image) return PLACEHOLDER_SRC;
  return resolveApiAssetUrl(property.image);
}

function onlyNumbers(value) {
  return String(value || "").replace(/[^\d]/g, "");
}

function PropertyModal({ open, mode, form, previewSrc, saving, error, onClose, onSubmit, onChange, onFileChange }) {
  if (!open) return null;

  const modalTitle = mode === "edit" ? "Edit Property" : "Add Property";
  const actionLabel = saving ? "Saving..." : mode === "edit" ? "Update" : "Create";
  const inputClass =
    "w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-white/15";

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-3xl rounded-2xl border border-white/10 bg-[#050912]/95 p-5 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">{modalTitle}</h2>
            <p className="mt-1 text-xs text-slate-400">Manage admin property records using the existing dashboard workflow.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-white/20 px-2 py-1 text-xs text-slate-300 transition hover:bg-white/10"
          >
            Close
          </button>
        </div>

        <form className="space-y-4" onSubmit={onSubmit}>
          {error ? (
            <div className="rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {error}
            </div>
          ) : null}

          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs text-slate-300">Owner ID</label>
              <input
                className={inputClass}
                value={form.ownerId}
                onChange={(e) => onChange("ownerId", onlyNumbers(e.target.value))}
                inputMode="numeric"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-300">Type</label>
              <select
                className={inputClass}
                value={form.type}
                onChange={(e) => onChange("type", e.target.value)}
              >
                {PROPERTY_TYPES.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1 md:col-span-2">
              <label className="text-xs text-slate-300">Title</label>
              <input
                className={inputClass}
                value={form.title}
                onChange={(e) => onChange("title", e.target.value)}
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-300">City</label>
              <input
                className={inputClass}
                value={form.city}
                onChange={(e) => onChange("city", e.target.value)}
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-300">Address</label>
              <input
                className={inputClass}
                value={form.address}
                onChange={(e) => onChange("address", e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-300">Area</label>
              <input
                className={inputClass}
                value={form.area}
                onChange={(e) => onChange("area", onlyNumbers(e.target.value))}
                inputMode="numeric"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-300">Price</label>
              <input
                className={inputClass}
                value={form.price}
                onChange={(e) => onChange("price", onlyNumbers(e.target.value))}
                inputMode="numeric"
              />
            </div>

            <div className="space-y-1 md:col-span-2">
              <label className="text-xs text-slate-300">Description</label>
              <textarea
                className={inputClass}
                rows={4}
                value={form.description}
                onChange={(e) => onChange("description", e.target.value)}
              />
            </div>

            <div className="space-y-1 md:col-span-2">
              <label className="text-xs text-slate-300">Image</label>
              <input
                type="file"
                accept="image/*"
                className="block w-full cursor-pointer rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 file:mr-3 file:rounded-lg file:border-0 file:bg-white/10 file:px-3 file:py-1.5 file:text-white/90"
                onChange={(e) => onFileChange(e.target.files?.[0] || null)}
              />
            </div>

            <div className="md:col-span-2">
              {previewSrc ? (
                <div className="overflow-hidden rounded-xl border border-white/10 bg-black/25">
                  <img src={previewSrc} alt="Property preview" className="h-48 w-full object-cover" />
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-white/15 bg-black/20 p-4 text-sm text-slate-400">
                  No image selected.
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-white/20 px-3 py-1.5 text-xs text-slate-200 transition hover:bg-white/10"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-white/10 px-3 py-1.5 text-xs font-medium text-black transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {actionLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminProperties() {
  const [searchParams, setSearchParams] = useSearchParams();
  const pageFromUrl = Number(searchParams.get("page") || "1");
  const page = Number.isFinite(pageFromUrl) && pageFromUrl > 0 ? pageFromUrl : 1;

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pageMeta, setPageMeta] = useState({
    page: 1,
    limit: PAGE_SIZE,
    total: null,
    totalPages: null,
  });

  const [modalMode, setModalMode] = useState("create");
  const [editingRow, setEditingRow] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async (nextPage = page) => {
    setLoading(true);
    setError("");
    try {
      const result = await listAdminProperties(nextPage, PAGE_SIZE);
      setRows(result.items);
      setPageMeta({
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      });
    } catch (err) {
      setError(extractApiErrorMessage(err, "Failed to load properties"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(page);
  }, [page]);

  const previewSrc = useMemo(() => {
    if (form.imageFile instanceof File) return URL.createObjectURL(form.imageFile);
    if (editingRow?.image) return resolveImageSrc(editingRow);
    return "";
  }, [editingRow, form.imageFile]);

  useEffect(() => {
    return () => {
      if (previewSrc.startsWith("blob:")) URL.revokeObjectURL(previewSrc);
    };
  }, [previewSrc]);

  const setPage = (nextPage) => {
    const safePage = Math.max(1, Number(nextPage) || 1);
    const next = new URLSearchParams(searchParams);
    next.set("page", String(safePage));
    setSearchParams(next);
  };

  const openCreate = () => {
    setModalMode("create");
    setEditingRow(null);
    setForm({ ...EMPTY_FORM });
    setFormError("");
    setShowModal(true);
  };

  const openEdit = (row) => {
    setModalMode("edit");
    setEditingRow(row);
    setForm(toFormState(row));
    setFormError("");
    setShowModal(true);
  };

  const closeModal = (force = false) => {
    if (saving && !force) return;
    setShowModal(false);
    setEditingRow(null);
    setForm({ ...EMPTY_FORM });
    setFormError("");
  };

  const onFieldChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!String(form.title || "").trim()) {
      setFormError("Title is required.");
      return;
    }
    if (!String(form.city || "").trim()) {
      setFormError("City is required.");
      return;
    }

    setSaving(true);
    setFormError("");
    try {
      if (modalMode === "edit" && editingRow?.id != null) {
        await updateAdminProperty(editingRow.id, form);
        notifyCrudSuccess("Property updated successfully", "Operation successful", {
          href: "/admin/properties",
        });
      } else {
        await createAdminProperty(form);
        notifyCrudSuccess("Property created successfully", "Operation successful", {
          href: "/admin/properties",
        });
      }

      closeModal(true);
      await load(page);
    } catch (err) {
      const message = extractApiErrorMessage(err, "Failed to save property");
      setFormError(message);
      notifyCrudError(message, "Operation failed", {
        href: "/admin/properties",
      });
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (row) => {
    if (!confirm(`Delete property ${row?.title || `#${row?.id}`}? This action cannot be undone.`)) return;

    try {
      await deleteAdminProperty(row.id);
      notifyCrudSuccess("Property deleted", "Operation successful", {
        href: "/admin/properties",
      });

      const shouldGoBack = rows.length === 1 && page > 1;
      const nextPage = shouldGoBack ? page - 1 : page;
      if (shouldGoBack) {
        setPage(nextPage);
      } else {
        await load(nextPage);
      }
    } catch (err) {
      const status = err?.response?.status;
      const message =
        status === 404
          ? "Property no longer exists on the server."
          : extractApiErrorMessage(err, "Failed to delete property");
      notifyCrudError(message, "Operation failed", {
        href: "/admin/properties",
      });
    }
  };

  const canGoPrev = page > 1;
  const canGoNext = pageMeta.totalPages ? page < pageMeta.totalPages : rows.length >= PAGE_SIZE;

  return (
    <section className="space-y-4">
      <PageHeader
        title="Properties"
        subtitle="Manage all property records from the admin dashboard."
      />

      <Toolbar className="rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-xl">
        <div className="flex w-full flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="text-xs text-slate-300">
            Page {pageMeta.page}
            {pageMeta.totalPages ? ` of ${pageMeta.totalPages}` : ""}
            {pageMeta.total != null ? ` • ${pageMeta.total} total` : ""}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => load(page)}
              className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs text-slate-300 transition duration-200 hover:border-white/15 hover:text-white/90"
            >
              Refresh
            </button>
            <button
              type="button"
              onClick={openCreate}
              className="rounded-xl bg-white/10 px-3 py-2 text-xs font-medium text-black transition hover:bg-white/10"
            >
              Add Property
            </button>
          </div>
        </div>
      </Toolbar>

      <Card className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl">
        <div className="border-b border-white/10 px-4 py-3 md:px-5">
          <h3 className="text-sm font-semibold text-white md:text-base">All Properties</h3>
          <p className="mt-1 text-xs text-slate-300 md:text-sm">Create, update, and remove listings using admin endpoints.</p>
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
        ) : error ? (
          <div className="p-8 text-center">
            <h4 className="text-base font-semibold text-white">Unable to load properties</h4>
            <p className="mt-2 text-sm text-red-300">{error}</p>
          </div>
        ) : rows.length === 0 ? (
          <div className="p-8 text-center">
            <h4 className="text-base font-semibold text-white">No properties found</h4>
            <p className="mt-2 text-sm text-slate-300">Use the add action to create the first admin-managed property.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[1280px] text-sm leading-5 text-slate-100">
              <thead className="sticky top-0 z-10 bg-black/40 backdrop-blur-xl">
                <tr className="border-b border-white/10">
                  <th className="whitespace-nowrap px-4 py-3 align-middle text-left text-[11px] font-semibold uppercase tracking-wide text-slate-300">Image</th>
                  <th className="min-w-[90px] whitespace-nowrap px-4 py-3 align-middle text-left text-[11px] font-semibold uppercase tracking-wide text-slate-300 tabular-nums">ID</th>
                  <th className="px-4 py-3 align-middle text-left text-[11px] font-semibold uppercase tracking-wide text-slate-300">Title</th>
                  <th className="px-4 py-3 align-middle text-left text-[11px] font-semibold uppercase tracking-wide text-slate-300">City</th>
                  <th className="px-4 py-3 align-middle text-left text-[11px] font-semibold uppercase tracking-wide text-slate-300">Type</th>
                  <th className="whitespace-nowrap px-4 py-3 align-middle text-left text-[11px] font-semibold uppercase tracking-wide text-slate-300">Price</th>
                  <th className="whitespace-nowrap px-4 py-3 align-middle text-left text-[11px] font-semibold uppercase tracking-wide text-slate-300">Area</th>
                  <th className="px-4 py-3 align-middle text-left text-[11px] font-semibold uppercase tracking-wide text-slate-300">Owner</th>
                  <th className="whitespace-nowrap px-4 py-3 align-middle text-left text-[11px] font-semibold uppercase tracking-wide text-slate-300">Created</th>
                  <th className="w-[140px] whitespace-nowrap px-4 py-3 align-middle text-center text-[11px] font-semibold uppercase tracking-wide text-slate-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {rows.map((row) => (
                  <tr key={row.id} className="transition-colors even:bg-white/[0.02] hover:bg-white/5">
                    <td className="px-4 py-3 align-middle">
                      <img
                        src={resolveImageSrc(row)}
                        alt={row.title || "Property"}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = PLACEHOLDER_SRC;
                        }}
                        className="h-14 w-20 rounded-lg border border-white/10 object-cover"
                      />
                    </td>
                    <td className="min-w-[90px] whitespace-nowrap px-4 py-3 align-middle tabular-nums">{row.id}</td>
                    <td className="max-w-[220px] truncate px-4 py-3 align-middle" title={row.title || "—"}>
                      {row.title || "—"}
                    </td>
                    <td className="max-w-[160px] truncate px-4 py-3 align-middle" title={row.city || "—"}>
                      {row.city || "—"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 align-middle">{row.type || "—"}</td>
                    <td className="whitespace-nowrap px-4 py-3 align-middle">
                      {row.price != null && row.price !== ""
                        ? Number(row.price).toLocaleString("en-US", { maximumFractionDigits: 0 })
                        : "—"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 align-middle">
                      {row.area != null && row.area !== "" ? `${row.area}` : "—"}
                    </td>
                    <td className="max-w-[220px] truncate px-4 py-3 align-middle" title={String(resolveOwnerLabel(row))}>
                      {resolveOwnerLabel(row)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 align-middle">
                      {row.createdAt ? new Date(row.createdAt).toLocaleDateString("en-US") : "—"}
                    </td>
                    <td className="w-[140px] whitespace-nowrap px-4 py-3 align-middle text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(row)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/15 bg-white/5 text-slate-200 transition duration-200 hover:border-white/15 hover:bg-white/10 hover:text-white/90"
                          title="Edit property"
                          aria-label="Edit property"
                        >
                          <EditIcon />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(row)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-red-500/40 bg-red-500/10 text-red-300 transition duration-200 hover:bg-red-500/20"
                          title="Delete property"
                          aria-label="Delete property"
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Toolbar className="justify-end rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={!canGoPrev}
            onClick={() => setPage(page - 1)}
            className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs text-slate-300 transition duration-200 hover:border-white/15 hover:text-white/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-xs text-slate-300">Page {page}</span>
          <button
            type="button"
            disabled={!canGoNext}
            onClick={() => setPage(page + 1)}
            className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs text-slate-300 transition duration-200 hover:border-white/15 hover:text-white/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </Toolbar>

      <PropertyModal
        open={showModal}
        mode={modalMode}
        form={form}
        previewSrc={previewSrc}
        saving={saving}
        error={formError}
        onClose={closeModal}
        onSubmit={onSubmit}
        onChange={onFieldChange}
        onFileChange={(file) => onFieldChange("imageFile", file)}
      />
    </section>
  );
}
