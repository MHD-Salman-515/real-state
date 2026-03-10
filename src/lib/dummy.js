// src/lib/dummy.js

/** ==============================
 *  Dummy data with persistence
 *  - Favorites & Visits saved in localStorage
 *  - Owner APIs for Properties & Appointments
 *  ============================== */

const LS_FAV = "exs_favorites_v1";
const LS_VIS = "exs_visits_v1";

// --- helpers: load/save from localStorage (safe) ---
const loadLS = (k, fallback) => {
  try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fallback; }
  catch { return fallback; }
};
const saveLS = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };

// ================= Base Data =================
let _favorites = new Set(loadLS(LS_FAV, [])); // stored as array, used as Set
let visits = loadLS(LS_VIS, [
  // نموذج (فارغ مبدئيًا)
  // { id: 1, property_id: 1, property_title: "شقة فاخرة – مشروع الحدائق", date: "2025-11-10", time: "11:30", status: "pending", tracking_code: "VIS-20251104-1234", notes:"" }
]);

const properties = [
  { id: 1, title: "شقة فاخرة – مشروع الحدائق", city: "دمشق", area: 165, type: "apartment", type_label: "شقة", price: 150000, description: "شقة 3 غرف بإطلالة." },
  { id: 2, title: "فيلا مستقلة – تلال المدينة", city: "حلب", area: 320, type: "villa",     type_label: "فيلا", price: 420000, description: "فيلا مع حديقة ومسبح." },
  { id: 3, title: "مكتب حديث – مركز الأعمال",   city: "دمشق", area: 90,  type: "office",    type_label: "مكتب", price: 90000,  description: "مكتب مجهز بالكامل." },
];

const delay = (ms = 400) => new Promise(r => setTimeout(r, ms));

const num = (v) => (isNaN(+v) ? 0 : +v);
const toTypeLabel = (t) => t === "apartment" ? "شقة" : t === "villa" ? "فيلا" : t === "office" ? "مكتب" : t;

// ================= Client APIs =================

export const dummyListProperties = async (q = {}) => {
  await delay();
  let list = properties.slice();

  const city = (q.city || "").toString().trim().toLowerCase();
  if (city)      list = list.filter(p => (p.city || "").toLowerCase().includes(city));
  if (q.type)    list = list.filter(p => p.type === q.type);
  if (q.minPrice) list = list.filter(p => num(p.price) >= num(q.minPrice));
  if (q.maxPrice) list = list.filter(p => num(p.price) <= num(q.maxPrice));
  if (q.minArea)  list = list.filter(p => num(p.area)  >= num(q.minArea));

  return list.map(p => ({ ...p, is_favorite: _favorites.has(p.id) }));
};

export const dummyGetProperty = async (id) => {
  await delay();
  const p = properties.find(x => x.id == id);
  return p
    ? { ...p, is_favorite: _favorites.has(p.id), ref: `REF-${String(p.id).padStart(4, "0")}` }
    : null;
};

export const dummyToggleFavorite = async (propertyId) => {
  await delay(200);
  const pid = +propertyId;
  if (_favorites.has(pid)) _favorites.delete(pid);
  else _favorites.add(pid);
  // persist
  saveLS(LS_FAV, Array.from(_favorites));
  const p = properties.find(x => x.id == pid);
  return { ok: true, is_favorite: _favorites.has(pid), property: p };
};

export const dummyCreateVisit = async ({ tracking_code, customer, items }) => {
  await delay(500);
  // تحقق بسيط
  if (!customer?.full_name || !customer?.phone || !Array.isArray(items) || !items.length) {
    return Promise.reject({ message: "بيانات غير مكتملة" });
  }

  // تحقق الصفوف
  const invalid = items.some(it => !it.property_id || !it.date || !it.time);
  if (invalid) return Promise.reject({ message: "أكمل كل صف: (العقار، التاريخ، الوقت)." });

  // خزّن كل عنصر كزيارة مستقلة
  items.forEach((it) => {
    const prop = properties.find(p => p.id == it.property_id);
    visits.push({
      id: (visits.at(-1)?.id || 0) + 1,
      property_id: +it.property_id,
      property_title: prop?.title || `عقار #${it.property_id}`,
      date: it.date,
      time: it.time,
      status: "pending",
      tracking_code,
      notes: it.notes || "",
      customer_name: customer.full_name,
      customer_phone: customer.phone,
    });
  });

  // persist
  saveLS(LS_VIS, visits);

  return { tracking_code };
};

export const dummyListAppointments = async () => {
  await delay();
  // في التطبيق الحقيقي: mine=1 حسب المستخدم؛ هنا بنرجّع الكل (أحدث أوّلًا)
  return visits.slice().reverse().map(v => ({
    ...v,
    status_label:
      v.status === "pending"   ? "قيد المراجعة" :
      v.status === "confirmed" ? "تم التأكيد"  :
      v.status === "done"      ? "منتهٍ"       :
      v.status === "canceled"  ? "ملغى"        :
      v.status
  }));
};

// ================= Owner APIs =================

// قائمة عقارات المالك (هنا نفس القائمة العامة)
export const dummyOwnerListProperties = async () => {
  await delay();
  // في الواقع: فلترة حسب مالك العقار
  return properties.slice();
};

// جلب عقار واحد
export const dummyOwnerGetProperty = async (id) => {
  await delay();
  return properties.find(p => p.id == id) || null;
};

// إضافة/تعديل عقار
export const dummyOwnerUpsertProperty = async (id, payload) => {
  await delay(400);

  const cleaned = {
    title: (payload.title || "").trim(),
    city: (payload.city || "").trim(),
    type: payload.type || "apartment",
    area: num(payload.area),
    price: num(payload.price),
    description: (payload.description || "").trim(),
    type_label: toTypeLabel(payload.type || "apartment"),
  };

  // تحقق بسيط
  if (!cleaned.title || !cleaned.city) {
    throw new Error("العنوان والمدينة مطلوبان.");
  }

  if (!id) {
    const newId = Math.max(0, ...properties.map(p => p.id)) + 1;
    properties.push({ id: newId, ...cleaned });
    return { id: newId, ok: true };
  }

  const i = properties.findIndex(p => p.id == id);
  if (i < 0) throw new Error("لم يتم العثور على العقار.");
  properties[i] = { ...properties[i], ...cleaned };
  return { id, ok: true };
};

// حذف عقار
export const dummyOwnerDeleteProperty = async (id) => {
  await delay(300);
  const idx = properties.findIndex(p => p.id == id);
  if (idx >= 0) properties.splice(idx, 1);

  // احذف أي مواعيد مرتبطة (اختياري هنا)
  for (let k = visits.length - 1; k >= 0; k--) {
    if (visits[k].property_id == id) visits.splice(k, 1);
  }
  // persist visits بعد التغيير
  saveLS(LS_VIS, visits);
  return { ok: true };
};

// كل مواعيد المالك (في الواقع: فقط لعقاراته)
export const dummyOwnerListAppointments = async () => {
  // هنا نعيد نفس القائمة (كل المواعيد)
  return dummyListAppointments();
};

// تحديث حالة موعد
export const dummyOwnerUpdateAppointmentStatus = async (id, status) => {
  await delay(250);
  const allowed = new Set(["pending", "confirmed", "done", "canceled"]);
  if (!allowed.has(status)) throw new Error("حالة غير صالحة.");

  const v = visits.find(x => x.id == id);
  if (!v) throw new Error("لم يتم العثور على الموعد.");

  v.status = status;
  // persist
  saveLS(LS_VIS, visits);

  return { ok: true, status };
};
