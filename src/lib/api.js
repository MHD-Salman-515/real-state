// // src/lib/api.js
// import {
//   // client
//   dummyListProperties,
//   dummyGetProperty,
//   dummyToggleFavorite,
//   dummyCreateVisit,
//   dummyListAppointments,
//   // owner
//   dummyOwnerListProperties,
//   dummyOwnerGetProperty,
//   dummyOwnerUpsertProperty,
//   dummyOwnerDeleteProperty,
//   dummyOwnerListAppointments,
//   dummyOwnerUpdateAppointmentStatus,
// } from "./dummy";
// import api from "../api/axios";

// const USE_DUMMY = import.meta.env.VITE_USE_DUMMY === "1";
// const BASE = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

// // دالة عامة لطلبات fetch
// const nodeFetch = async (path, opt = {}) => {
//   const r = await fetch(BASE + path, {
//     headers: { "Content-Type": "application/json", ...(opt.headers || {}) },
//     ...opt,
//   });
//   if (!r.ok) {
//     const err = await r.json().catch(() => ({ message: "حدث خطأ في الاتصال" }));
//     throw err;
//   }
//   return r.json();
// };

// /* ===========================
//    🏠 Client APIs
//    =========================== */
// export const listProperties = async (q = {}) => {
//   if (USE_DUMMY) return dummyListProperties(q);
//   const url = new URL(BASE + "/properties");
//   Object.entries(q).forEach(([k, v]) => v && url.searchParams.set(k, v));
//   const r = await fetch(url);
//   return r.ok ? r.json() : [];
// };

// export const getProperty = async (id) => {
//   if (USE_DUMMY) return dummyGetProperty(id);
//   return nodeFetch(`/properties/${id}`);
// };

// export const toggleFavorite = async (propertyId) => {
//   if (USE_DUMMY) return dummyToggleFavorite(propertyId);
//   return nodeFetch(`/favorites/${propertyId}`, { method: "POST" });
// };

// export const createVisit = async (payload) => {
//   if (USE_DUMMY) return dummyCreateVisit(payload);
//   return nodeFetch(`/visits`, {
//     method: "POST",
//     body: JSON.stringify(payload),
//   });
// };

// export const listAppointments = async () => {
//   if (USE_DUMMY) return dummyListAppointments();
//   const r = await fetch(`${BASE}/visits?mine=1`);
//   return r.ok ? r.json() : [];
// };

// /* ===========================
//    🧑‍💼 Owner APIs
//    =========================== */
// export const ownerListProperties = async () => {
//   if (USE_DUMMY) return dummyOwnerListProperties();
//   return nodeFetch(`/owner/properties`);
// };



// export const ownerGetProperty = async (id) => {
//   if (USE_DUMMY) return dummyOwnerGetProperty(id);
//   return nodeFetch(`/owner/properties/${id}`);
// };

// export const ownerUpsertProperty = async (id, payload) => {
//   if (USE_DUMMY) return dummyOwnerUpsertProperty(id, payload);
//   const method = id ? "PUT" : "POST";
//   const path = id ? `/owner/properties/${id}` : `/owner/properties`;
//   return nodeFetch(path, { method, body: JSON.stringify(payload) });
// };

// export const ownerDeleteProperty = async (id) => {
//   if (USE_DUMMY) return dummyOwnerDeleteProperty(id);
//   return nodeFetch(`/owner/properties/${id}`, { method: "DELETE" });
// };

// // export const ownerListAppointments = async () => {
// //   if (USE_DUMMY) return dummyOwnerListAppointments();
// //   return nodeFetch(`/owner/appointments`);
// // };



// // 🟩 جلب مواعيد المالك من الباك
// export async function ownerListAppointments(ownerId) {
//   const res = await api.get("/appointments");
//   const arr = Array.isArray(res.data) ? res.data : [];

//   // فلترة المواعيد حسب المالك
//   return arr.filter((a) => a.ownerId === ownerId);
// }


// // export const ownerUpdateAppointmentStatus = async (id, status) => {
// //   if (USE_DUMMY) return dummyOwnerUpdateAppointmentStatus(id, status);
// //   return nodeFetch(`/owner/appointments/${id}`, {
// //     method: "PATCH",
// //     body: JSON.stringify({ status }),
// //   });
// // };

// export async function ownerUpdateAppointmentStatus(id, status) {
//   return api.put(`/appointments/${id}`, { status });
// }



import api from "../api/axios";

/* ==========================================
   🟦 AUTH — تسجيل / دخول / معلومات المستخدم
   ========================================== */

export const register = async (data) => {
  const res = await api.post("/auth/register", data);
  return res.data;
};

export const login = async (data) => {
  const res = await api.post("/auth/login", data);
  return res.data;
};

export const me = async () => {
  const res = await api.get("/auth/me");
  return res.data;
};

/* ==========================================
   🟩 PROPERTY — CRUD عقارات
   ========================================== */

// كل العقارات

export const listProperties = async () => {
  const res = await api.get("/properties");
  return res.data;
};

export const getProperty = async (id) => {
  const res = await api.get(`/properties/${id}`);
  return res.data;
};

export const upsertProperty = async (id, data) => {
  if (id) {
    const res = await api.put(`/properties/${id}`, data);
    return res.data;
  } else {
    const res = await api.post("/properties", data);
    return res.data;
  }
};

export const deleteProperty = async (id) => {
  const res = await api.delete(`/properties/${id}`);
  return res.data;
};

/* ==========================================
   🟧 APPOINTMENTS — المواعيد
   ========================================== */

// كل المواعيد
export const listAppointments = async () => {
  const res = await api.get("/appointments");
  return res.data;
};

// موعد واحد
export const getAppointment = async (id) => {
  const res = await api.get(`/appointments/${id}`);
  return res.data;
};

// إنشاء موعد (CLIENT)
export const createAppointment = async (data) => {
  const res = await api.post("/appointments", data);
  return res.data;
};

// تحديث موعد
export const updateAppointment = async (id, data) => {
  const res = await api.put(`/appointments/${id}`, data);
  return res.data;
};

// حذف موعد
export const deleteAppointment = async (id) => {
  const res = await api.delete(`/appointments/${id}`);
  return res.data;
};

/* ==========================================
   🟪 TICKETS — نظام التذاكر (صيانة)
   ========================================== */

// كل التذاكر
export const listTickets = async () => {
  const res = await api.get("/tickets");
  return res.data;
};

// تذكرة واحدة
export const getTicket = async (id) => {
  const res = await api.get(`/tickets/${id}`);
  return res.data;
};

// إنشاء تذكرة (CLIENT)
export const createTicket = async (data) => {
  const res = await api.post("/tickets", data);
  return res.data;
};

// تحديث تذكرة
export const updateTicket = async (id, data) => {
  const res = await api.put(`/tickets/${id}`, data);
  return res.data;
};

// حذف تذكرة
export const deleteTicket = async (id) => {
  const res = await api.delete(`/tickets/${id}`);
  return res.data;
};

// تعيين عامل
export const assignWorker = async (ticketId, workerId) => {
  const res = await api.put(`/tickets/${ticketId}/assign-worker`, {
    workerId,
  });
  return res.data;
};

// تعيين مقاول (Supplier)
export const assignSupplier = async (ticketId, supplierId) => {
  const res = await api.put(`/tickets/${ticketId}/assign-supplier`, {
    supplierId,
  });
  return res.data;
};

// تحديث حالة التذكرة
export const updateTicketStatus = async (ticketId, status) => {
  const res = await api.put(`/tickets/${ticketId}/status`, { status });
  return res.data;
};

/* ==========================================
   🟫 COMMISSIONS — العمولات
   ========================================== */

export const listCommissions = async () => {
  const res = await api.get("/commissions");
  return res.data;
};

export const getCommission = async (id) => {
  const res = await api.get(`/commissions/${id}`);
  return res.data;
};

export const createCommission = async (data) => {
  const res = await api.post("/commissions", data);
  return res.data;
};

export const updateCommission = async (id, data) => {
  const res = await api.put(`/commissions/${id}`, data);
  return res.data;
};

export const deleteCommission = async (id) => {
  const res = await api.delete(`/commissions/${id}`);
  return res.data;
};

/* ==========================================
   🟨 EXPENSES — المصاريف
   ========================================== */

export const listExpenses = async () => {
  const res = await api.get("/expenses");
  return res.data;
};

export const getExpense = async (id) => {
  const res = await api.get(`/expenses/${id}`);
  return res.data;
};

export const createExpense = async (data) => {
  const res = await api.post("/expenses", data);
  return res.data;
};

export const updateExpense = async (id, data) => {
  const res = await api.put(`/expenses/${id}`, data);
  return res.data;
};

export const deleteExpense = async (id) => {
  const res = await api.delete(`/expenses/${id}`);
  return res.data;
};

/* ==========================================
   🟦 INVOICES — الفواتير
   ========================================== */

export const listInvoices = async () => {
  const res = await api.get("/invoices");
  return res.data;
};

export const getInvoice = async (id) => {
  const res = await api.get(`/invoices/${id}`);
  return res.data;
};

export const createInvoice = async (data) => {
  const res = await api.post("/invoices", data);
  return res.data;
};

export const updateInvoice = async (id, data) => {
  const res = await api.put(`/invoices/${id}`, data);
  return res.data;
};

export const deleteInvoice = async (id) => {
  const res = await api.delete(`/invoices/${id}`);
  return res.data;
};


// ===========================
// 🧑‍💼 Owner APIs
// ===========================

// عقارات المالك
export const ownerListProperties = async () => {
  const res = await api.get("/properties");
  return Array.isArray(res.data) ? res.data : [];
};

// موعد المالك (كل المواعيد المرتبطة بالمالك أو النظام)
export const ownerListAppointments = async () => {
  const res = await api.get("/appointments");
  return Array.isArray(res.data) ? res.data : [];
};

export const ownerUpdateAppointmentStatus = async (id, status) => {
  const res = await api.put(`/appointments/${id}`, { status });
  return res.data;
};
