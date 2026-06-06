import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { MessageSquareDashed, Plus, Send } from "lucide-react";

import api from "../../api/axios";

export default function BuyerChatPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";

  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const bottomRef = useRef(null);

  const loadMessages = useCallback((id) => {
    api.get(`/buyer/chat/sessions/${id}/messages`)
      .then((r) => setMessages(r.data || []))
      .catch(() => setMessages([]));
  }, []);

  const syncActiveSession = useCallback((list) => {
    if (!Array.isArray(list) || list.length === 0) {
      setActiveSession(null);
      setMessages([]);
      return null;
    }

    const selected = sessionId
      ? list.find((item) => String(item.id) === String(sessionId)) || null
      : null;
    const nextSession = selected || list[0];
    setActiveSession(nextSession);
    loadMessages(nextSession.id);
    return nextSession;
  }, [loadMessages, sessionId]);

  const loadSessions = useCallback(async () => {
    setLoadingSessions(true);
    try {
      const response = await api.get("/buyer/chat/sessions");
      const list = response.data || [];
      setSessions(list);
      syncActiveSession(list);
    } catch {
      setSessions([]);
      setActiveSession(null);
      setMessages([]);
    } finally {
      setLoadingSessions(false);
    }
  }, [syncActiveSession]);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  useEffect(() => {
    if (!sessions.length) {
      if (!sessionId) return;
      loadSessions();
      return;
    }

    const selected = sessionId
      ? sessions.find((item) => String(item.id) === String(sessionId)) || null
      : sessions[0];

    if (!selected) return;
    if (activeSession?.id !== selected.id) {
      setActiveSession(selected);
      loadMessages(selected.id);
    }
  }, [activeSession?.id, loadMessages, loadSessions, sessionId, sessions]);

  const createSession = async () => {
    try {
      const response = await api.post("/buyer/chat/sessions", { title: t("New Search") });
      setSessions((prev) => [response.data, ...prev.filter((item) => item.id !== response.data?.id)]);
      setActiveSession(response.data);
      setMessages([]);
      navigate(`/client/chat/${response.data.id}`);
      return response.data;
    } catch {
      return null;
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || sending) return;
    const text = input.trim();
    let session = activeSession;

    if (!session) {
      session = await createSession();
    }
    if (!session?.id) return;

    setInput("");
    setSending(true);
    setMessages((prev) => [...prev, { id: Date.now(), role: "USER", content: text }]);

    try {
      const response = await api.post(`/buyer/chat/sessions/${session.id}/message`, { message: text });
      const reply = response.data?.assistantMessage || response.data?.text_ar || response.data?.message || "";
      const properties = response.data?.payloadJson?.recommended_properties || [];
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, role: "ASSISTANT", content: reply, properties },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, role: "ASSISTANT", content: t("Something went wrong. Please try again.") },
      ]);
    } finally {
      setSending(false);
      loadSessions();
    }
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div dir={i18n.dir()} className="chat-shell flex min-h-[calc(100vh-4rem)] flex-col gap-4 px-4 py-4 lg:flex-row lg:px-6">
      <aside className="chat-sidebar flex w-full flex-col lg:h-[calc(100vh-6rem)] lg:w-80">
        <div className="border-b border-[var(--creos-border-soft)] p-4">
          <div className="mb-4 flex items-center gap-3">
            <div className="badge-creos">
              <MessageSquareDashed className="h-4 w-4" />
              {t("AI Search")}
            </div>
          </div>

          <h2 className="text-lg font-semibold text-[color:var(--creos-text)]">
            {t("Search Assistant")}
          </h2>
          <p className="mt-2 text-sm text-[color:rgb(var(--creos-text-rgb)/0.68)]">
            {t("Start a conversation for area, budget, and unit type guidance.")}
          </p>

          <button type="button" onClick={createSession} className="btn-gold mt-4 w-full justify-center py-3 text-sm">
            <Plus className="h-4 w-4" />
            {t("New Search")}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {sessions.map((session) => (
            <button
              key={session.id}
              type="button"
              onClick={() => {
                setActiveSession(session);
                loadMessages(session.id);
                navigate(`/client/chat/${session.id}`);
              }}
              className={`dashboard-nav-link mb-2 w-full px-3 py-2 text-sm ${activeSession?.id === session.id ? "dashboard-nav-link-active" : ""}`}
              style={{ textAlign: isRtl ? "right" : "left" }}
            >
              {session.title || t("Conversation")}
            </button>
          ))}

          {!sessions.length ? (
            <div className="dashboard-empty mt-2">
              {t("No sessions yet. Start a new conversation.")}
            </div>
          ) : null}
        </div>
      </aside>

      <div className="card-glass flex min-h-[70vh] flex-1 flex-col overflow-hidden">
        <div className="border-b border-[var(--creos-border-soft)] px-4 py-4 sm:px-6">
          <h1 className="text-base font-semibold text-[color:var(--creos-text)] sm:text-lg">
            {t("AI Property Search Assistant")}
          </h1>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="dashboard-empty mt-10">
                {loadingSessions
                  ? t("Loading conversations...")
                  : t("Start a conversation for area, budget, and unit type guidance.")}
              </div>
            ) : null}

            {messages.map((message) => {
              const isUser = String(message.role).toUpperCase() === "USER";
              return (
                <div key={message.id} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-7 sm:max-w-[75%] ${
                      isUser
                        ? "bg-[color:var(--creos-accent)] text-[#1b1c1c]"
                        : "border border-[var(--creos-border-soft)] bg-[rgb(var(--creos-surface-rgb)/0.58)] text-[color:var(--creos-text)]"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>

                    {message.properties?.map((property) => (
                      <Link
                        key={property.id}
                        to={`/property/${property.id}`}
                        className="mt-3 block rounded-xl border border-[rgb(var(--creos-accent-rgb)/0.22)] bg-[rgb(var(--creos-accent-rgb)/0.10)] px-3 py-2 text-xs text-[color:var(--creos-text)]"
                      >
                        {property.title}
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}

            {sending ? (
              <div className="text-sm text-[color:var(--creos-accent-bright)]">
                {t("Assistant is typing...")}
              </div>
            ) : null}

            <div ref={bottomRef} />
          </div>
        </div>

        <div className="border-t border-[var(--creos-border-soft)] bg-[rgb(var(--creos-surface-rgb)/0.55)] p-4 sm:p-5">
          <div className="flex gap-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
              placeholder={t("Write your inquiry here...")}
              className="input-creos flex-1"
            />

            <button
              type="button"
              onClick={sendMessage}
              disabled={!input.trim() || sending}
              className="btn-gold px-4 py-2.5 disabled:opacity-40"
            >
              <Send className={`h-4 w-4 ${isRtl ? "rotate-180" : ""}`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
