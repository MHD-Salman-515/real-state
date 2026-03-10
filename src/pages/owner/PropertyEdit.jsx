import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getProperty } from "../../lib/api";
import { notifyCrudError, notifyCrudSuccess } from "../../utils/notify.js";
import api, { resolveApiAssetUrl, extractApiErrorMessage } from "../../api/axios";

const empty = {
  title: "",
  city: "",
  type: "APARTMENT",
  area: "",
  price: "",
  description: "",
  address: "",
};

function Field({ label, hint, children }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-200">{label}</label>
      {children}
      {hint ? <p className="mt-1 text-xs text-slate-400">{hint}</p> : null}
    </div>
  );
}

function Section({ title, subtitle, children, className = "" }) {
  return (
    <section className={`rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl md:p-5 ${className}`}>
      <div className="mb-4">
        <h2 className="text-base font-semibold text-white">{title}</h2>
        {subtitle ? <p className="mt-1 text-xs text-slate-400">{subtitle}</p> : null}
      </div>
      {children}
    </section>
  );
}

export default function OwnerPropertyEdit() {
  const { id } = useParams();
  const nav = useNavigate();
  const [model, setModel] = useState(empty);
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [existingImage, setExistingImage] = useState("");

  useEffect(() => {
    if (!id) return;
    (async () => {
      const data = await getProperty(id);
      setModel({
        title: data?.title || "",
        city: data?.city || "",
        type: data?.type || "APARTMENT",
        area: data?.area || "",
        price: data?.price || "",
        description: data?.description || "",
        address: data?.address || "",
      });
      setExistingImage(data?.image || "");
      setLoading(false);
    })();
  }, [id]);

  const onlyNum = (v) => v.replace(/[^\d]/g, "");

  const inputClass =
    "w-full rounded-xl border border-white/10 bg-black/25 px-3 py-2.5 text-sm text-slate-100 outline-none transition duration-200 placeholder:text-slate-500 focus:border-white/15 focus:bg-black/35";

  const previewSrc = useMemo(() => {
    if (model.imageFile) return URL.createObjectURL(model.imageFile);
    if (existingImage) return resolveApiAssetUrl(existingImage);
    return "";
  }, [model.imageFile, existingImage]);

  useEffect(() => {
    return () => {
      if (model.imageFile && previewSrc.startsWith("blob:")) {
        URL.revokeObjectURL(previewSrc);
      }
    };
  }, [model.imageFile, previewSrc]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const fd = new FormData();

      Object.entries(model).forEach(([k, v]) => {
        if (k !== "imageFile") fd.append(k, v);
      });

      if (model.imageFile) {
        fd.append("image", model.imageFile);
      }

      const method = id ? "PUT" : "POST";
      const url = id ? `/properties/${id}` : "/properties";
      await api.request({
        url,
        method,
        data: fd,
      });

      setMsg("تم الحفظ بنجاح.");
      notifyCrudSuccess(
        id ? "Property updated successfully" : "Property added successfully",
        "Operation successful",
        {
          href: id ? `/owner/properties/${id}/edit` : "/owner/properties",
        }
      );
      setTimeout(() => nav("/owner/properties"), 600);
    } catch (err) {
      const message = extractApiErrorMessage(err, "خطأ أثناء الحفظ");
      setMsg(message);
      notifyCrudError("Failed to save property", "Operation failed", {
        href: id ? `/owner/properties/${id}/edit` : "/owner/properties",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
        <div className="animate-pulse space-y-3">
          <div className="h-5 w-44 rounded bg-white/10" />
          <div className="grid gap-3 md:grid-cols-2">
            <div className="h-24 rounded-xl bg-white/10" />
            <div className="h-24 rounded-xl bg-white/10" />
            <div className="h-24 rounded-xl bg-white/10" />
            <div className="h-24 rounded-xl bg-white/10" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 pb-24">
      <header className="rounded-2xl border border-white/10 bg-black/30 p-5 backdrop-blur-xl">
        <h1 className="text-xl font-bold text-white md:text-2xl">
          {id ? "تعديل عقار" : "إضافة عقار"}
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          أدخل بيانات العقار الأساسية بدقة ثم قم بالحفظ.
        </p>

        {msg && (
          <div
            className={`mt-4 rounded-xl border px-4 py-2 text-sm ${
              msg.includes("خطأ")
                ? "border-rose-400/25 bg-rose-500/10 text-rose-200"
                : "border-white/15 bg-white/10 text-white/90"
            }`}
          >
            {msg}
          </div>
        )}
      </header>

      <div className="grid gap-4 lg:grid-cols-2">
        <Section title="Basic Info" subtitle="Title and property category.">
          <div className="space-y-4">
            <Field label="العنوان" hint="اسم واضح يميز العقار في القوائم.">
              <input
                className={inputClass}
                value={model.title}
                onChange={(e) => setModel({ ...model, title: e.target.value })}
              />
            </Field>

            <Field label="النوع" hint="اختر نوع العقار المناسب.">
              <select
                className={inputClass}
                value={model.type}
                onChange={(e) => setModel({ ...model, type: e.target.value })}
              >
                <option value="APARTMENT">شقة</option>
                <option value="HOUSE">منزل</option>
                <option value="VILLA">فيلا</option>
                <option value="STUDIO">ستوديو</option>
                <option value="LAND">أرض</option>
              </select>
            </Field>
          </div>
        </Section>

        <Section title="Location" subtitle="City and full address details.">
          <div className="space-y-4">
            <Field label="المدينة" hint="المدينة التي يقع بها العقار.">
              <input
                className={inputClass}
                value={model.city}
                onChange={(e) => setModel({ ...model, city: e.target.value })}
              />
            </Field>

            <Field label="العنوان التفصيلي" hint="أضف وصفا دقيقا للموقع.">
              <input
                className={inputClass}
                value={model.address}
                onChange={(e) => setModel({ ...model, address: e.target.value })}
              />
            </Field>
          </div>
        </Section>

        <Section title="Specs" subtitle="Area and pricing details.">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="المساحة (م²)" hint="أرقام فقط.">
              <input
                className={inputClass}
                inputMode="numeric"
                value={model.area}
                onChange={(e) => setModel({ ...model, area: onlyNum(e.target.value) })}
              />
            </Field>

            <Field label="السعر (USD)" hint="أرقام فقط.">
              <input
                className={inputClass}
                inputMode="numeric"
                value={model.price}
                onChange={(e) => setModel({ ...model, price: onlyNum(e.target.value) })}
              />
            </Field>
          </div>
        </Section>

        <Section title="Media" subtitle="Upload a primary listing image.">
          <div className="space-y-4">
            <Field label="صورة العقار" hint="أفضل حجم عرض 16:9.">
              <input
                type="file"
                accept="image/*"
                className="block w-full cursor-pointer rounded-xl border border-white/10 bg-black/25 px-3 py-2 text-sm text-slate-200 file:mr-3 file:rounded-lg file:border-0 file:bg-white/10 file:px-3 file:py-1.5 file:text-white/90 hover:file:bg-white/10"
                onChange={(e) => setModel({ ...model, imageFile: e.target.files[0] })}
              />
            </Field>

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
        </Section>
      </div>

      <Section title="Description" subtitle="Add key details and highlights.">
        <Field label="الوصف" hint="وصف مختصر يوضح المميزات الأساسية.">
          <textarea
            className={inputClass}
            rows={5}
            value={model.description}
            onChange={(e) => setModel({ ...model, description: e.target.value })}
          />
        </Field>
      </Section>

      <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-white/10 bg-[#030712]/90 px-4 py-3 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-end gap-2">
          <button
            type="button"
            className="rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-sm text-slate-100 transition duration-200 hover:bg-white/10"
            onClick={() => nav("/owner/properties")}
          >
            إلغاء
          </button>
          <button
            className="rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white/90 transition duration-200 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-70"
            disabled={saving}
          >
            {saving ? "جارٍ الحفظ..." : id ? "Update" : "Save"}
          </button>
        </div>
      </div>
    </form>
  );
}
