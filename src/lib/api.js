 import api, { AUTH_LOGIN_PATH, AUTH_ME_PATH, AUTH_REGISTER_PATH } from "../api/axios";

/* ==========================================
   🟦 AUTH — تسجيل / دخول / معلومات المستخدم
   ========================================== */

export const register = async (data) => {
  const res = await api.post(AUTH_REGISTER_PATH, data);
  return res.data;
};

export const login = async (data) => {
  const email = String(data?.email || "").trim();
  const password = String(data?.password || "");
  if (!email || password.length < 1) {
    throw new Error("Email and password are required");
  }
  const res = await api.post(AUTH_LOGIN_PATH, { email, password });
  return res.data;
};

export const me = async () => {
  const res = await api.get(AUTH_ME_PATH);
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
