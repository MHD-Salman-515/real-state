import api from "@/api/axios";

export const ownerChatApi = {
  createSession: (payload: Record<string, unknown> = {}) =>
    api.post("/owner/chat/sessions", payload).then((r) => r.data),
  listSessions: () => api.get("/owner/chat/sessions").then((r) => r.data),
  getSessionMessages: (id: string | number) => api.get(`/owner/chat/sessions/${id}/messages`).then((r) => r.data),
  sendMessage: (id: string | number, payload: Record<string, unknown>) => {
    console.debug("[OwnerChat] CHAT_API_ENDPOINT", `/owner/chat/sessions/${id}/message`);
    return api.post(`/owner/chat/sessions/${id}/message`, payload).then((r) => r.data);
  },
  applyPriceAction: (payload: Record<string, unknown>) =>
    api.post("/owner/chat/actions/apply-price", payload).then((r) => r.data),
  patchSessionContext: (id: string | number, payload: Record<string, unknown>) =>
    api.patch(`/owner/chat/sessions/${id}/context`, payload).then((r) => r.data),
  archiveSession: (id: string | number, archived = true) =>
    api.patch(`/owner/chat/sessions/${id}/archive`, { archived }).then((r) => r.data),
  deleteSession: (id: string | number) => api.delete(`/owner/chat/sessions/${id}`).then((r) => r.data),
};
