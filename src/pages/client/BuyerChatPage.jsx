import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowUpRight, MessageSquareDashed, Plus, Send } from "lucide-react";
import api from "../../api/axios";

export default function BuyerChatPage() {
  const { sessionId } = useParams();
  const nav = useNavigate();
  const { t, i18n } = useTranslation();
  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);
  const isRtl = i18n.dir() === "rtl";

  useEffect(() => {
    api.get("/buyer/chat/sessions").then((r) => {
      const list = r.data || [];
      setSessions(list);
      if (!activeSession && list.length > 0) {
        const s = sessionId
          ? list.find((x) => String(x.id) === String(sessionId)) || list[0]
          : list[0];
        setActiveSession(s);
        loadMessages(s.id);
      }
    }).catch(() => {});
  }, []);

  const loadMessages = (id) => {
    api.get(`/buyer/chat/sessions/${id}/messages`)
      .then((r) => setMessages(r.data || []))
      .catch(() => setMessages([]));
  };

  const createSession = async () => {
    try {
      const r = await api.post("/buyer/chat/sessions", { title: t("New Search") });
      setSessions((prev) => [r.data, ...prev]);
      setActiveSession(r.data);
      setMessages([]);
      nav(`/client/chat/${r.data.id}`);
    } catch {}
  };

  const sendMessage = async () => {
    if (!input.trim() || !activeSession || sending) return;
    const text = input;
    setInput("");
    setSending(true);
    setMessages((prev) => [...prev, { id: Date.now(), role: "USER", content: text }]);
    try {
      const r = await api.post(`/buyer/chat/sessions/${activeSession.id}/message`, { message: text });
      const reply = r.data?.assistantMessage || r.data?.text_ar || r.data?.message || "";
      const props = r.data?.payloadJson?.recommended_properties || [];
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, role: "ASSISTANT", content: reply, properties: props },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, role: "ASSISTANT", content: t("Something went wrong. Please try again.") },
      ]);
    }
    setSending(false);
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div dir={i18n.dir()} className="chat-shell flex min-h-screen flex-col gap-4 px-4 py-4 lg:flex-row lg:px-6">
      <aside className="chat-sidebar flex w-full flex-col lg:h-[calc(100vh-2rem)] lg:w-80">
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
          <button onClick={createSession} className="btn-gold mt-4 w-full justify-center py-3 text-sm">
            <Plus className="h-4 w-4" />
            {t("New Search")}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {sessions.map((s) => (
            <button
              key={s.id}
              onClick={() => {
                setActiveSession(s);
                loadMessages(s.id);
                nav(`/client/chat/${s.id}`);
              }}
              className={`dashboard-nav-link mb-2 w-full px-3 py-2 text-sm ${activeSession?.id === s.id ? "dashboard-nav-link-active" : ""}`}
              style={{ textAlign: isRtl ? "right" : "left" }}
            >
              {s.title || t("Conversation")}
            </button>
          ))}
          {!sessions.length ? (
            <div className="dashboard-empty mt-2">
              {t("No sessions yet. Start a new conversation.")}
            </div>
          ) : null}
        </div>
      </aside>

      <section className="chat-panel flex min-h-[70vh] flex-1 flex-col overflow-hidden lg:h-[calc(100vh-2rem)]">
        <div className="border-b border-[var(--creos-border-soft)] px-5 py-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h1 className="text-lg font-semibold text-[color:var(--creos-text)]">{t("AI Property Search Assistant")}</h1>
              <p className="mt-1 text-sm text-[color:rgb(var(--creos-text-rgb)/0.64)]">{t("Tell me about the property you are looking for")}</p>
            </div>
            <div className="badge-creos hidden sm:inline-flex">{t("Conversation")}</div>
          </div>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          {messages.length === 0 && (
            <div className="mx-auto mt-16 max-w-2xl text-center text-[color:rgb(var(--creos-text-rgb)/0.62)]">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-[rgb(var(--creos-accent-rgb)/0.22)] bg-[rgb(var(--creos-accent-rgb)/0.12)] text-[color:var(--creos-accent-bright)]">
                <MessageSquareDashed className="h-7 w-7" />
              </div>
              <p className="text-lg font-medium text-[color:var(--creos-text)]">{t("Tell me about the property you are looking for")}</p>
              <p className="mt-2 text-sm">{t("Ask about neighborhood price range, unit type, or investment fit.")}</p>
              <div className="mt-6 space-y-2">
                {[
                  t("I need an apartment in Mazzeh with a 500 million budget"),
                  t("I am looking for a house in Rural Damascus"),
                  t("What is the price per meter in Malki?"),
                ].map((hint) => (
                  <button
                    key={hint}
                    onClick={() => setInput(hint)}
                    className="btn-glass mx-auto block w-full max-w-sm px-4 py-2 text-sm"
                    style={{ textAlign: isRtl ? "right" : "left" }}
                  >
                    {hint}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === "USER" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] rounded-[1.4rem] px-4 py-3 text-sm leading-relaxed shadow-glass ${
                  msg.role === "USER" ? "chat-message-user" : "chat-message-assistant"
                }`}
              >
                {msg.content}
                {msg.properties?.map((p) => (
                  <a
                    key={p.id}
                    href={`/property/${p.id}`}
                    className="mt-3 block rounded-2xl border border-[rgb(var(--creos-accent-rgb)/0.22)] bg-[rgb(var(--creos-accent-rgb)/0.1)] p-3 text-xs text-[#3c2f00]"
                  >
                    <span className="flex items-center gap-2 font-semibold">
                      <ArrowUpRight className="h-3.5 w-3.5" />
                      {t("Open Property")}
                    </span>
                    <span className="mt-1 block">
                      {p.title} — {p.price?.toLocaleString(i18n.language === "ar" ? "ar-SY" : "en-US")} {t("SYP")}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          ))}

          {sending ? (
            <div className="flex justify-start">
              <div className="px-4 py-2 text-sm text-[color:rgb(var(--creos-accent-rgb)/0.76)]">
                {t("Assistant is typing...")}
              </div>
            </div>
          ) : null}
          <div ref={bottomRef} />
        </div>

        <div className="border-t border-[var(--creos-border-soft)] p-4">
          <div className="flex gap-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
              placeholder={t("Type your property request here...")}
              className="input-creos flex-1 px-4 py-3 text-sm"
            />
            <button onClick={sendMessage} disabled={!input.trim() || sending} className="btn-gold shrink-0 px-5 py-3 text-sm disabled:opacity-40">
              <Send className="h-4 w-4" />
              {t("Send")}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
