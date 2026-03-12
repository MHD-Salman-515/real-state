import { useCallback, useEffect, useMemo, useState } from "react";
import type { ChatMessage, ChatSession } from "@/types/chat";
import {
  createOwnerChatSession,
  listOwnerChatMessages,
  listOwnerChatSessions,
  sendOwnerChatMessage,
} from "@/services/chatService";

export function useOwnerChat(initialSessionId?: string) {
  const backendOfflineError = "تعذر الاتصال بالخادم. تأكد من تشغيل الباك.";
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(initialSessionId || null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const [loadingSessions, setLoadingSessions] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string>("");

  const activeSession = useMemo(
    () => sessions.find((s) => s.id === activeSessionId) || null,
    [sessions, activeSessionId]
  );

  const loadSessions = useCallback(async () => {
    setLoadingSessions(true);
    setError("");
    try {
      const result = await listOwnerChatSessions();
      setSessions(result);
      if (!activeSessionId && result[0]?.id) {
        setActiveSessionId(result[0].id);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Could not load chat sessions.");
    } finally {
      setLoadingSessions(false);
    }
  }, [activeSessionId]);

  const loadMessages = useCallback(async (sessionId: string) => {
    if (!sessionId) return;
    setLoadingMessages(true);
    setError("");
    try {
      const result = await listOwnerChatMessages(sessionId);
      setMessages(result);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Could not load messages.");
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  const startNewSession = useCallback(async () => {
    setError("");
    try {
      const session = await createOwnerChatSession();
      setSessions((prev) => [session, ...prev.filter((s) => s.id !== session.id)]);
      setActiveSessionId(session.id);
      setMessages([]);
      return session;
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Could not create a new session.");
      return null;
    }
  }, []);

  const sendMessage = useCallback(
    async (content: string) => {
      const text = String(content || "").trim();
      if (!text || sending) return;

      let targetSessionId = activeSessionId;
      if (!targetSessionId) {
        const newSession = await startNewSession();
        targetSessionId = newSession?.id || null;
      }
      if (!targetSessionId) return;

      const optimistic: ChatMessage = {
        id: `tmp-${Date.now()}`,
        sessionId: targetSessionId,
        role: "user",
        content: text,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, optimistic]);
      setSending(true);
      setError("");

      try {
        console.debug("[OwnerChat] CHAT_REQUEST_START", { sessionId: targetSessionId, message: text });
        const result = await sendOwnerChatMessage(targetSessionId, text);
        console.debug("[OwnerChat] CHAT_REQUEST_SUCCESS", { sessionId: targetSessionId });
        console.debug("[OwnerChat] CHAT_RESPONSE_SOURCE=backend_only", { sessionId: targetSessionId });

        // Use backend data as source of truth when possible.
        if (result.messages.length) {
          setMessages((prev) => {
            const withoutTemp = prev.filter((m) => m.id !== optimistic.id);
            const assistantAndSystem = result.messages.filter((m) => m.role !== "user");
            return [...withoutTemp, ...assistantAndSystem];
          });
        }

        // Refresh to preserve tool/system ordering and server timestamps.
        await loadMessages(result.sessionId || targetSessionId);
      } catch (err: any) {
        console.error("[OwnerChat] CHAT_REQUEST_FAILED", {
          sessionId: targetSessionId,
          error: err?.response?.data || err?.message || err,
        });
        setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
        setError(err?.response?.data?.message || backendOfflineError);
      } finally {
        setSending(false);
      }
    },
    [activeSessionId, loadMessages, sending, startNewSession]
  );

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
    startNewSession,
    sendMessage,
  };
}
