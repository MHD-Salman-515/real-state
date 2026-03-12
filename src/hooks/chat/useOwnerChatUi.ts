import { useCallback, useEffect, useMemo, useState } from "react";
import { ownerChatApi } from "@/services/ownerChat.api";
import type { ChatMessage, ChatSession } from "@/types/chat";

function asArray(value: any): any[] {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.items)) return value.items;
  if (Array.isArray(value?.sessions)) return value.sessions;
  if (Array.isArray(value?.messages)) return value.messages;
  if (Array.isArray(value?.data)) return value.data;
  return [];
}

function mapSession(raw: any): ChatSession {
  return {
    id: String(raw?.id ?? raw?._id ?? raw?.sessionId ?? ""),
    title: String(raw?.title ?? raw?.name ?? raw?.topic ?? "New Session"),
    status: raw?.status ? String(raw.status) : undefined,
    createdAt: raw?.createdAt ? String(raw.createdAt) : undefined,
    updatedAt: raw?.updatedAt ? String(raw.updatedAt) : undefined,
    preview: raw?.preview || raw?.lastMessage || undefined,
    messageCount: Number(raw?.messageCount || 0),
  };
}

function mapMessage(raw: any, sessionId?: string): ChatMessage {
  const role = String(raw?.role ?? raw?.sender ?? "assistant").toLowerCase();
  return {
    id: String(raw?.id ?? raw?._id ?? `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`),
    sessionId: String(raw?.sessionId ?? sessionId ?? ""),
    role: role.includes("user") || role.includes("owner") ? "user" : role.includes("tool") ? "tool" : role.includes("system") ? "system" : "assistant",
    content: String(raw?.content ?? raw?.message ?? raw?.text ?? raw?.reply ?? ""),
    createdAt: raw?.createdAt ? String(raw.createdAt) : new Date().toISOString(),
    meta: raw?.meta && typeof raw.meta === "object" ? raw.meta : undefined,
  };
}

export function useOwnerChatUi(initialSessionId?: string) {
  const backendOfflineError = "تعذر الاتصال بالخادم. تأكد من تشغيل الباك.";
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(initialSessionId || null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const activeSession = useMemo(
    () => sessions.find((s) => s.id === activeSessionId) || null,
    [sessions, activeSessionId]
  );

  const loadSessions = useCallback(async () => {
    setLoadingSessions(true);
    setError("");
    try {
      const data = await ownerChatApi.listSessions();
      const list = asArray(data).map(mapSession).filter((s) => s.id);
      setSessions(list);
      if (!activeSessionId && list[0]?.id) setActiveSessionId(list[0].id);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to load sessions.");
    } finally {
      setLoadingSessions(false);
    }
  }, [activeSessionId]);

  const loadMessages = useCallback(async (sessionId: string) => {
    if (!sessionId) return;
    setLoadingMessages(true);
    setError("");
    try {
      const data = await ownerChatApi.getSessionMessages(sessionId);
      const list = asArray(data).map((m) => mapMessage(m, sessionId)).filter((m) => m.content);
      setMessages(list);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to load messages.");
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  const createSession = useCallback(async (title?: string) => {
    const token =
      localStorage.getItem("auth_token_v1") ||
      localStorage.getItem("access_token") ||
      localStorage.getItem("token") ||
      sessionStorage.getItem("auth_token_v1") ||
      sessionStorage.getItem("access_token") ||
      sessionStorage.getItem("token");
    if (!token) {
      const msg = "Authentication required. Please sign in again.";
      setError(msg);
      throw new Error(msg);
    }

    const payload = title?.trim() ? { title: title.trim() } : {};
    const data = await ownerChatApi.createSession(payload);
    const raw = data?.session || data?.item || data?.data || data;
    const session = mapSession(raw);
    if (!session.id) {
      await loadSessions();
      return null;
    }
    setSessions((prev) => [session, ...prev.filter((s) => s.id !== session.id)]);
    setActiveSessionId(session.id);
    setMessages([]);
    return session;
  }, [loadSessions]);

  const sendMessage = useCallback(async (text: string) => {
    const content = String(text || "").trim();
    if (!content || sending) return;

    let sid = activeSessionId;
    if (!sid) {
      const created = await createSession();
      sid = created?.id || null;
    }
    if (!sid) return;

    const optimistic = mapMessage({ role: "user", content, createdAt: new Date().toISOString() }, sid);
    setMessages((prev) => [...prev, optimistic]);
    setSending(true);
    setError("");

    try {
      console.debug("[OwnerChat] CHAT_REQUEST_START", { sessionId: sid, message: content });
      const data = await ownerChatApi.sendMessage(sid, { message: content, content });
      console.debug("[OwnerChat] CHAT_REQUEST_SUCCESS", { sessionId: sid });
      console.debug("[OwnerChat] CHAT_RESPONSE_SOURCE=backend_only", { sessionId: sid });
      const maybeMessages = asArray(data);
      if (maybeMessages.length) {
        const parsed = maybeMessages.map((m) => mapMessage(m, sid)).filter((m) => m.content);
        setMessages((prev) => [...prev.filter((m) => m.id !== optimistic.id), ...parsed.filter((m) => m.role !== "user")]);
      } else {
        setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
      }
      await loadMessages(sid);
    } catch (err: any) {
      console.error("[OwnerChat] CHAT_REQUEST_FAILED", { sessionId: sid, error: err?.response?.data || err?.message || err });
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
      setError(err?.response?.data?.message || backendOfflineError);
    } finally {
      setSending(false);
    }
  }, [activeSessionId, createSession, loadMessages, sending]);

  const archiveActive = useCallback(async () => {
    if (!activeSessionId) return;
    await ownerChatApi.archiveSession(activeSessionId, true);
    await loadSessions();
  }, [activeSessionId, loadSessions]);

  const deleteSession = useCallback(async (sessionId: string) => {
    await ownerChatApi.deleteSession(sessionId);
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    if (activeSessionId === sessionId) {
      setActiveSessionId(null);
      setMessages([]);
    }
  }, [activeSessionId]);

  const patchContext = useCallback(async (payload: Record<string, unknown>) => {
    if (!activeSessionId) return;
    await ownerChatApi.patchSessionContext(activeSessionId, payload);
  }, [activeSessionId]);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  useEffect(() => {
    if (!activeSessionId) return;
    loadMessages(activeSessionId);
  }, [activeSessionId, loadMessages]);

  useEffect(() => {
    if (initialSessionId && initialSessionId !== activeSessionId) {
      setActiveSessionId(initialSessionId);
    }
  }, [initialSessionId, activeSessionId]);

  return {
    sessions,
    activeSession,
    activeSessionId,
    setActiveSessionId,
    messages,
    loadingSessions,
    loadingMessages,
    sending,
    error,
    loadSessions,
    loadMessages,
    createSession,
    sendMessage,
    archiveActive,
    deleteSession,
    patchContext,
  };
}
