import api from "@/api/axios";

function getAccessToken(): string {
  return (
    localStorage.getItem("auth_token_v1") ||
    localStorage.getItem("access_token") ||
    localStorage.getItem("token") ||
    sessionStorage.getItem("auth_token_v1") ||
    sessionStorage.getItem("access_token") ||
    sessionStorage.getItem("token") ||
    ""
  );
}

function withAuth() {
  const token = getAccessToken();
  if (!token) return {};
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
}

export const ownerChatApi = {
  createSession: (payload: Record<string, unknown> = {}) =>
    api.post("/owner/chat/sessions", payload, withAuth()).then((r) => r.data),
  listSessions: () => api.get("/owner/chat/sessions", withAuth()).then((r) => r.data),
  getSessionMessages: (id: string | number) => api.get(`/owner/chat/sessions/${id}/messages`, withAuth()).then((r) => r.data),
  sendMessage: (id: string | number, payload: Record<string, unknown>) =>
    api.post(`/owner/chat/sessions/${id}/message`, payload, withAuth()).then((r) => r.data),
  applyPriceAction: (payload: Record<string, unknown>) =>
    api.post("/owner/chat/actions/apply-price", payload, withAuth()).then((r) => r.data),
  patchSessionContext: (id: string | number, payload: Record<string, unknown>) =>
    api.patch(`/owner/chat/sessions/${id}/context`, payload, withAuth()).then((r) => r.data),
  archiveSession: (id: string | number, archived = true) =>
    api.patch(`/owner/chat/sessions/${id}/archive`, { archived }, withAuth()).then((r) => r.data),
  deleteSession: (id: string | number) => api.delete(`/owner/chat/sessions/${id}`, withAuth()).then((r) => r.data),
};
