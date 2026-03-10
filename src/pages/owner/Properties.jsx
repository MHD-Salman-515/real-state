import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import PageHeader from "../../components/PageHeader.jsx";
import Toolbar from "../../components/Toolbar.jsx";
import Card from "../../components/Card.jsx";
import { useToast } from "../../components/ToastProvider.jsx";
import { notifyCrudError, notifyCrudSuccess } from "../../utils/notify.js";

import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext.jsx";
import { resolveApiAssetUrl } from "../../api/axios";

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

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

export default function OwnerProperties() {
  const toast = useToast();
  const nav = useNavigate();
  const { user } = useAuth();
  const placeholderSrc = "/placeholder-property.svg";

  const [rows, setRows] = useState([]);
  const [allRows, setAllRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    const fetchProps = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await api.get("/properties");
        const all = res.data || [];

        const owned = user?.id ? all.filter((p) => p.ownerId === user.id) : all;

        const mapped = owned.map((p) => ({
          id: p.id,
          title: p.title || "بدون عنوان",
          city: p.city || "",
          address: p.address || "",
          type: p.type || "",
          area: p.area ?? "",
          price: p.price ?? 0,
          listed: p.createdAt ? String(p.createdAt).slice(0, 10) : "",
        }));

        setAllRows(mapped);
        setRows(mapped);
      } catch (err) {
        console.error(err);
        setError("فشل تحميل العقارات من الخادم");
        toast.error("تعذر تحميل عقاراتك");
      } finally {
        setLoading(false);
      }
    };

    fetchProps();
  }, [user?.id]);

  const handleAdd = () => nav("/owner/properties/new");

  const handleEdit = (id) => {
    nav(`/owner/properties/${id}/edit`);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا العقار؟")) {
      return;
    }

    try {
      await api.delete(`/properties/${id}`);
      setRows((prev) => prev.filter((r) => r.id !== id));
      setAllRows((prev) => prev.filter((r) => r.id !== id));
      notifyCrudSuccess(`Property deleted (${id})`, "Operation successful", {
        href: "/owner/properties",
      });
    } catch (err) {
      console.error(err);
      notifyCrudError("Failed to delete property", "Operation failed", {
        href: "/owner/properties",
      });
    }
  };

  const columns = [
    { key: "id", header: "المعرّف" },
    { key: "title", header: "العنوان" },
    { key: "city", header: "المدينة" },
    { key: "address", header: "العنوان التفصيلي" },
    { key: "type", header: "النوع" },
    { key: "area", header: "المساحة (م²)" },
    {
      key: "price",
      header: "السعر ($)",
      render: (r) => Number(r.price || 0).toLocaleString(),
    },
    { key: "listed", header: "مضاف بتاريخ" },
    {
      key: "image",
      header: "الصورة",
      render: (r) => (
        <img
          src={r.image ? resolveApiAssetUrl(r.image) : placeholderSrc}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = placeholderSrc;
          }}
          className="h-14 w-20 rounded-lg border border-white/10 object-cover"
          alt="Property"
        />
      ),
    },
    {
      key: "act",
      header: "إجراء",
      render: (r) => (
        <div className="flex items-center gap-2">
          <button
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/15 bg-white/5 text-slate-200 transition duration-200 hover:border-white/15 hover:bg-white/10 hover:text-white/90"
            onClick={() => handleEdit(r.id)}
            title="Edit property"
            aria-label="Edit property"
          >
            <EditIcon />
          </button>
          <button
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/15 bg-white/5 text-rose-300 transition duration-200 hover:border-rose-300/40 hover:bg-rose-500/10 hover:text-rose-200"
            onClick={() => handleDelete(r.id)}
            title="Delete property"
            aria-label="Delete property"
          >
            <TrashIcon />
          </button>
        </div>
      ),
    },
  ];

  const handleSearch = (q) => {
    const query = q.toLowerCase().trim();
    if (!query) return setRows(allRows);

    setRows(
      allRows.filter(
        (r) =>
          r.title.toLowerCase().includes(query) ||
          r.city.toLowerCase().includes(query) ||
          (r.address || "").toLowerCase().includes(query)
      )
    );
  };

  const handleClearSearch = () => {
    setSearchValue("");
    setRows(allRows);
  };

  if (loading)
    return (
      <>
        <PageHeader
          title="عقاراتي"
          subtitle="جاري تحميل العقارات..."
        />
        <Card className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
          <div className="animate-pulse space-y-3">
            <div className="h-4 w-56 rounded bg-white/10" />
            <div className="h-12 rounded-xl bg-white/10" />
            <div className="h-12 rounded-xl bg-white/10" />
            <div className="h-12 rounded-xl bg-white/10" />
            <div className="h-12 rounded-xl bg-white/10" />
          </div>
        </Card>
      </>
    );

  if (error)
    return (
      <>
        <PageHeader
          title="عقاراتي"
          subtitle="حدث خطأ أثناء تحميل العقارات"
        />
        <Card className="mt-4 rounded-2xl border border-rose-400/20 bg-rose-500/10 p-4 text-sm text-rose-200">
          {error}
        </Card>
      </>
    );

  return (
    <>
      <PageHeader
        title="عقاراتي"
        subtitle="إدارة العقارات المسجلة بملكيتك"
        actions={
          <button
            className="rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-sm font-medium text-white/90 transition duration-200 hover:bg-white/10"
            onClick={handleAdd}
          >
            Add Property
          </button>
        }
      />

      <Toolbar className="mb-4 rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-xl">
        <div className="flex w-full flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <label className="group relative block w-full md:max-w-md">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
              <SearchIcon />
            </span>
            <input
              className="w-full rounded-xl border border-white/10 bg-black/20 py-2.5 pl-10 pr-3 text-sm text-slate-100 outline-none transition duration-200 placeholder:text-slate-400 focus:border-white/15 focus:bg-black/30"
              placeholder="ابحث بالعنوان أو المدينة"
              value={searchValue}
              onChange={(e) => {
                const value = e.target.value;
                setSearchValue(value);
                handleSearch(value);
              }}
            />
          </label>

          <div className="flex items-center gap-2 md:justify-end">
            <button
              type="button"
              className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-slate-200 transition duration-200 hover:border-white/15 hover:bg-white/10 hover:text-white/90"
              onClick={handleClearSearch}
            >
              Clear
            </button>
            <button
              type="button"
              className="rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-sm text-white/90 transition duration-200 hover:bg-white/10"
              onClick={handleAdd}
            >
              Add Property
            </button>
          </div>
        </div>
      </Toolbar>

      {rows.length === 0 ? (
        <Card className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-xl">
          <h3 className="text-lg font-semibold text-white">No properties found</h3>
          <p className="mt-2 text-sm text-slate-300">
            Try adjusting your search or add a new property.
          </p>
          <div className="mt-5">
            <button
              type="button"
              onClick={handleAdd}
              className="rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white/90 transition duration-200 hover:bg-white/10"
            >
              Add Property
            </button>
          </div>
        </Card>
      ) : (
        <Card className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl">
          <div className="flex items-start justify-between gap-3 border-b border-white/10 px-4 py-3 md:px-5">
            <div>
              <h3 className="text-sm font-semibold text-white md:text-base">Your Properties</h3>
              <p className="mt-1 text-xs text-slate-300 md:text-sm">
                Manage, edit, and track your listings.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="sticky top-0 z-10 bg-[#0a1322]/95 backdrop-blur">
                <tr className="border-b border-white/10">
                  {columns.map((c) => (
                    <th key={c.key} className="px-4 py-3 text-right text-xs font-semibold tracking-wide text-slate-300">
                      {c.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-b border-white/5 transition duration-200 hover:bg-white/5">
                    {columns.map((c) => (
                      <td key={c.key} className="px-4 py-3 align-middle text-slate-100">
                        {typeof c.render === "function" ? c.render(r) : r[c.key]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </>
  );
}
