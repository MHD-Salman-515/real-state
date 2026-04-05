import api from "@/api/axios";

function logOwnerToken() {
  console.log("OWNER TOKEN:", localStorage.getItem("access_token"));
}

export const ownerChatApi = {
  createSession: (payload: Record<string, unknown> = {}) =>
    (logOwnerToken(), api.post("/owner/chat/sessions", payload).then((r) => r.data)),
  listSessions: () => (logOwnerToken(), api.get("/owner/chat/sessions").then((r) => r.data)),
  getSessionMessages: (id: string | number) =>
    (logOwnerToken(), api.get(`/owner/chat/sessions/${id}/messages`).then((r) => r.data)),
  sendMessage: (id: string | number, payload: Record<string, unknown>) => {
    logOwnerToken();
    console.debug("[OwnerChat] CHAT_API_ENDPOINT", `/owner/chat/sessions/${id}/message`);
    return api.post(`/owner/chat/sessions/${id}/message`, payload).then((r) => r.data);
  },
  applyPriceAction: (payload: Record<string, unknown>) =>
    (logOwnerToken(), api.post("/owner/chat/actions/apply-price", payload).then((r) => r.data)),
  patchSessionContext: (id: string | number, payload: Record<string, unknown>) =>
    (logOwnerToken(), api.patch(`/owner/chat/sessions/${id}/context`, payload).then((r) => r.data)),
  archiveSession: (id: string | number, archived = true) =>
    (logOwnerToken(), api.patch(`/owner/chat/sessions/${id}/archive`, { archived }).then((r) => r.data)),
  deleteSession: (id: string | number) =>
    (logOwnerToken(), api.delete(`/owner/chat/sessions/${id}`).then((r) => r.data)),
};
