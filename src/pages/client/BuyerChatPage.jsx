import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  BedDouble,
  CircleUserRound,
  Image as ImageIcon,
  MapPin,
  MoreVertical,
  Paperclip,
  Search,
  Send,
  Share2,
  Sparkles,
} from "lucide-react";
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
    } catch {}
    return null;
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
    <div dir={i18n.dir()} className="stitch-ref-chat-shell min-h-screen">
      <header className="stitch-ref-chat-topbar sticky top-0 z-30">
        <div className="mx-auto flex h-20 w-full max-w-[1440px] items-center justify-between px-5 lg:px-16">
          <div className={`flex items-center gap-6 ${isRtl ? "lg:flex-row-reverse" : ""}`}>
            <Link to="/" className="stitch-ref-brand text-[2rem]">
              Creos
            </Link>
            <nav className="hidden items-center gap-8 lg:flex">
              <Link to="/properties" className="text-[rgba(226,226,231,0.78)] transition hover:text-[var(--stitch-ref-gold)]">
                {t("Properties")}
              </Link>
              <Link to="/services" className="text-[rgba(226,226,231,0.78)] transition hover:text-[var(--stitch-ref-gold)]">
                {t("Services")}
              </Link>
              <Link to="/about" className="border-b-2 border-[var(--stitch-ref-gold)] pb-1 text-[var(--stitch-ref-gold)]">
                {t("Insights")}
              </Link>
              <Link to="/client/profile" className="text-[rgba(226,226,231,0.78)] transition hover:text-[var(--stitch-ref-gold)]">
                {t("Profile")}
              </Link>
            </nav>
          </div>

          <div className={`flex items-center gap-4 ${isRtl ? "lg:flex-row-reverse" : ""}`}>
            <Link to="/client/profile" className="text-[var(--stitch-ref-gold)]">
              <CircleUserRound className="h-7 w-7" />
            </Link>
            <Link to="/client/profile" className="stitch-ref-button-primary !min-h-0 !px-6 !py-3 !text-sm">
              {t("Connect Wallet")}
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-[1440px] gap-8 px-5 py-6 lg:px-16">
        <section className="stitch-ref-chat-panel flex min-h-[calc(100vh-8rem)] flex-1 flex-col overflow-hidden rounded-xl">
          <div className="flex items-center justify-between border-b border-[rgba(154,143,128,0.1)] px-6 py-5">
            <div className={`flex items-center gap-4 ${isRtl ? "flex-row-reverse" : ""}`}>
              <button type="button" className="text-[rgba(154,143,128,0.85)]">
                <MoreVertical className="h-5 w-5" />
              </button>
              <button type="button" className="text-[rgba(154,143,128,0.85)]">
                <Share2 className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={createSession}
                className="rounded-full border border-[rgba(233,193,118,0.28)] px-3 py-1 text-xs text-[var(--stitch-ref-gold)] transition hover:bg-[rgba(233,193,118,0.08)]"
              >
                {t("New Search")}
              </button>
            </div>
            <div className="text-right">
              <div className={`flex items-center gap-3 ${isRtl ? "flex-row" : "flex-row-reverse"}`}>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[rgba(233,193,118,0.2)] bg-[rgba(233,193,118,0.08)] text-[var(--stitch-ref-gold)]">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-lg text-[var(--stitch-ref-gold)]">{t("CREOS AI Assistant")}</p>
                  <p className="text-sm text-[rgba(226,226,231,0.76)]">
                    {t("Connected now")} <span className="text-[var(--stitch-ref-gold)]">●</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto bg-[rgba(18,24,42,0.45)] px-6 py-8">
            <div className="mx-auto flex max-w-4xl flex-col gap-7">
              {messages.length === 0 ? (
                <div className="mx-auto rounded-md bg-[rgba(30,32,35,0.82)] px-6 py-3 text-sm text-[rgba(226,226,231,0.68)]">
                  {loadingSessions ? t("Loading conversations...") : t("Conversation started today")}
                </div>
              ) : null}

              {messages.map((message, index) => {
                const assistant = String(message.role).toUpperCase() !== "USER";
                return (
                  <div key={message.id || index} className={`flex ${assistant ? "justify-start" : "justify-end"}`}>
                    <div className={`max-w-[82%] rounded-2xl px-6 py-5 ${assistant ? "stitch-ref-chat-message-received" : "stitch-ref-chat-message-sent"}`}>
                      <p className="whitespace-pre-wrap text-lg leading-9">{message.content}</p>

                      {message.properties?.length ? (
                        <div className="mt-6 rounded-md border border-[rgba(233,193,118,0.2)] bg-[rgba(17,19,23,0.22)] p-4">
                          {message.properties.map((property) => (
                            <Link
                              key={property.id}
                              to={`/property/${property.id}`}
                              className="grid gap-4 md:grid-cols-[1.2fr_220px]"
                            >
                              <div className="space-y-3">
                                <span className="inline-flex bg-[rgba(233,193,118,0.2)] px-3 py-1 text-xs text-[var(--stitch-ref-gold)]">
                                  {t("Under Construction")}
                                </span>
                                <h3 className="stitch-ref-title text-2xl text-[var(--stitch-ref-gold)]">{property.title}</h3>
                                <p className="text-base text-[rgba(226,226,231,0.8)]">
                                  {property.description || t("Smart residential units with premium finishes and strong investment potential.")}
                                </p>
                                <div className={`flex flex-wrap gap-4 text-sm text-[rgba(226,226,231,0.7)] ${isRtl ? "" : ""}`}>
                                  <span className="inline-flex items-center gap-1"><BedDouble className="h-4 w-4" />3</span>
                                  <span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4" />{t("North Riyadh")}</span>
                                </div>
                                <span className="inline-flex border border-[rgba(233,193,118,0.35)] px-4 py-2 text-sm text-[var(--stitch-ref-gold)]">
                                  {t("View Technical File")} PDF
                                </span>
                              </div>
                              <img
                                src={property.image || "https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=900&q=80"}
                                alt={property.title}
                                className="h-full min-h-[180px] w-full object-cover"
                              />
                            </Link>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </div>
                );
              })}

              {sending ? (
                <div className="text-sm text-[rgba(233,193,118,0.86)]">{t("Assistant is typing...")}</div>
              ) : null}
              <div ref={bottomRef} />
            </div>
          </div>

          <div className="border-t border-[rgba(154,143,128,0.1)] bg-[rgba(23,27,39,0.95)] p-5">
            <div className="rounded-xl border border-[rgba(154,143,128,0.18)] bg-[rgba(26,31,57,0.9)] px-4 py-4">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={sendMessage}
                  disabled={!input.trim() || sending}
                  className="flex h-12 w-12 items-center justify-center bg-[var(--stitch-ref-gold)] text-[#261900] disabled:opacity-40"
                >
                  <Send className={`h-5 w-5 ${isRtl ? "rotate-180" : ""}`} />
                </button>
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                  placeholder={t("Write your inquiry here...")}
                  className="min-h-[64px] flex-1 bg-transparent px-3 text-lg text-[var(--stitch-ref-text)] outline-none placeholder:text-[rgba(154,143,128,0.64)]"
                />
              </div>

              <div className={`mt-4 flex items-center gap-4 text-[rgba(154,143,128,0.88)] ${isRtl ? "justify-end" : "justify-start"}`}>
                <MapPin className="h-5 w-5" />
                <ImageIcon className="h-5 w-5" />
                <Paperclip className="h-5 w-5" />
              </div>
            </div>
          </div>
        </section>

        <aside className="stitch-ref-chat-panel hidden w-[410px] shrink-0 rounded-xl p-6 lg:block">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="stitch-ref-title text-2xl text-[var(--stitch-ref-gold)]">{t("Smart Conversations")}</h2>
            <Search className="h-5 w-5 text-[rgba(154,143,128,0.82)]" />
          </div>

          <div className="space-y-4 overflow-y-auto">
            {sessions.map((session) => {
              const active = activeSession?.id === session.id;
              return (
                <button
                  key={session.id}
                  type="button"
                  onClick={() => {
                    setActiveSession(session);
                    loadMessages(session.id);
                    navigate(`/client/chat/${session.id}`);
                  }}
                  className={`w-full border p-5 text-right transition ${
                    active
                      ? "border-[rgba(233,193,118,0.34)] bg-[rgba(30,32,35,0.45)]"
                      : "border-[rgba(154,143,128,0.12)] bg-[rgba(30,32,35,0.35)] hover:border-[rgba(233,193,118,0.24)]"
                  }`}
                >
                  <div className={`flex items-start gap-4 ${isRtl ? "flex-row" : "flex-row-reverse"}`}>
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${active ? "border border-[rgba(233,193,118,0.3)] bg-[rgba(233,193,118,0.08)] text-[var(--stitch-ref-gold)]" : "bg-[rgba(255,255,255,0.06)] text-[rgba(226,226,231,0.74)]"}`}>
                      {active ? <Sparkles className="h-5 w-5" /> : <CircleUserRound className="h-5 w-5" />}
                    </div>
                    <div className="flex-1">
                      <div className={`flex items-center justify-between gap-4 ${isRtl ? "flex-row" : "flex-row-reverse"}`}>
                        <span className={`stitch-ref-mono text-sm ${active ? "text-[var(--stitch-ref-gold)]" : "text-[rgba(226,226,231,0.86)]"}`}>
                          {session.title || t("Conversation")}
                        </span>
                        <span className="text-xs text-[rgba(154,143,128,0.76)]">
                          {active ? t("Now") : t("Previous")}
                        </span>
                      </div>
                      <p className="mt-2 line-clamp-2 text-sm leading-7 text-[rgba(226,226,231,0.72)]">
                        {session.preview || t("Open this conversation to continue your property discussion.")}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}

            <button
              type="button"
              onClick={createSession}
              className="w-full border border-dashed border-[rgba(233,193,118,0.28)] px-5 py-4 text-sm text-[var(--stitch-ref-gold)]"
            >
              {t("Start New Conversation")}
            </button>
          </div>
        </aside>
      </main>
    </div>
  );
}
