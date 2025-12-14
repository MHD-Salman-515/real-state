import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getProperty, upsertProperty } from "../../lib/api";

const empty = {
  title: "",
  city: "",
  type: "APARTMENT",
  area: "",
  price: "",
  description: "",
  address: ""
};

export default function OwnerPropertyEdit() {
  const { id } = useParams();
  const nav = useNavigate();
  const [model, setModel] = useState(empty);
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

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
        address: data?.address || ""
      });
      setLoading(false);
    })();
  }, [id]);

  const input = "input";
  const onlyNum = (v) => v.replace(/[^\d]/g, "");

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
      const url = id
        ? `http://localhost:3000/properties/${id}`
        : `http://localhost:3000/properties`;

      await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token_v1")}`,
        },
        body: fd,
      });

      setMsg("تم الحفظ بنجاح.");
      setTimeout(() => nav("/owner/properties"), 600);

    } catch (err) {
      console.error(err);
      setMsg("خطأ أثناء الحفظ");
    } finally {
      setSaving(false);
    }
  };


  if (loading) return <div className="card p-6">جاري التحميل…</div>;

  return (
    <form onSubmit={onSubmit} className="card p-6 max-w-3xl">
      <h1 className="text-xl font-bold mb-4">
        {id ? "تعديل عقار" : "إضافة عقار"}
      </h1>

      {msg && (
        <div className="mb-3 rounded-xl bg-emerald-50 border border-emerald-200 text-greenDark px-4 py-2 text-sm">
          {msg}
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-3">

        <div>
          <label className="block text-sm mb-1 text-ink/70">العنوان</label>
          <input
            className={input}
            value={model.title}
            onChange={(e) => setModel({ ...model, title: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm mb-1 text-ink/70">المدينة</label>
          <input
            className={input}
            value={model.city}
            onChange={(e) => setModel({ ...model, city: e.target.value })}
          />
        </div>

        {/* العنوان التفصيلي */}
        <div className="sm:col-span-2">
          <label className="block text-sm mb-1 text-ink/70">العنوان التفصيلي</label>
          <input
            className={input}
            value={model.address}
            onChange={(e) => setModel({ ...model, address: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm mb-1 text-ink/70">النوع</label>
          <select
            className={input}
            value={model.type}
            onChange={(e) => setModel({ ...model, type: e.target.value })}
          >
            <option value="APARTMENT">شقة</option>
            <option value="HOUSE">منزل</option>
            <option value="VILLA">فيلا</option>
            <option value="STUDIO">ستوديو</option>
            <option value="LAND">أرض</option>
          </select>
        </div>

        <div>
          <label className="block text-sm mb-1 text-ink/70">المساحة (م²)</label>
          <input
            className={input}
            inputMode="numeric"
            value={model.area}
            onChange={(e) =>
              setModel({ ...model, area: onlyNum(e.target.value) })
            }
          />
        </div>

        <div>
          <label className="block text-sm mb-1 text-ink/70">السعر (USD)</label>
          <input
            className={input}
            inputMode="numeric"
            value={model.price}
            onChange={(e) =>
              setModel({ ...model, price: onlyNum(e.target.value) })
            }
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm mb-1 text-ink/70">صورة العقار</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setModel({ ...model, imageFile: e.target.files[0] })}
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm mb-1 text-ink/70">الوصف</label>
          <textarea
            className={input}
            rows={4}
            value={model.description}
            onChange={(e) =>
              setModel({ ...model, description: e.target.value })
            }
          />
        </div>
      </div>

      <div className="mt-4 flex gap-2 justify-end">
        <button type="button" className="btn-ghost" onClick={() => history.back()}>
          إلغاء
        </button>
        <button className="btn-primary" disabled={saving}>
          {saving ? "جارٍ الحفظ…" : "حفظ"}
        </button>
      </div>
    </form>
  );
}
