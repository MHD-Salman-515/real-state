import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Archive, DatabaseZap, MapPin, MoreVertical, Search, Send, Share2, Sparkles, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useOwnerChatUi } from "@/hooks/chat/useOwnerChatUi";
import { useToast } from "@/components/ToastProvider.jsx";

function formatTime(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function OwnerChatPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { sessionId: sessionIdFromRoute } = useParams();
  const toast = useToast();
  const [composerText, setComposerText] = useState("");
  const [locationPrefilled, setLocationPrefilled] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const isRtl = i18n.dir() === "rtl";

  const {
    sessions,
    activeSession,
    activeSessionId,
    setActiveSessionId,
    messages,
    loadingSessions,
    sending,
    error,
    createSession,
    sendMessage,
    archiveActive,
    patchContext,
    deleteSession,
  } = useOwnerChatUi(sessionIdFromRoute);

  useEffect(() => {
    if (sessionIdFromRoute && activeSessionId && sessionIdFromRoute !== activeSessionId) {
      navigate(`/owner/chat/${activeSessionId}`, { replace: true });
    }
  }, [activeSessionId, navigate, sessionIdFromRoute]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  useEffect(() => {
    const syncPickedLocation = () => {
      try {
        const raw = localStorage.getItem("creos_chat_map_pick");
        if (!raw) return;
        const picked = JSON.parse(raw);
        const lat = picked?.lat ?? picked?.latitude;
        const lng = picked?.lng ?? picked?.lon ?? picked?.longitude;
        if (lat == null || lng == null) return;
        const address = picked?.address || picked?.text || t("Pinned map location");
        const nextMessage = t("Selected location: {{address}}. Coordinates: {{lat}}, {{lng}}", {
          address,
          lat: Number(lat).toFixed(6),
          lng: Number(lng).toFixed(6),
        });
        setComposerText((prev) => {
          if (!prev.trim()) return nextMessage;
          if (prev.includes(nextMessage)) return prev;
          return `${prev}\n${nextMessage}`;
        });
        setLocationPrefilled(true);
        localStorage.removeItem("creos_chat_map_pick");
      } catch {
        // ignore storage parse issues
      }
    };

    syncPickedLocation();
    window.addEventListener("focus", syncPickedLocation);
    return () => window.removeEventListener("focus", syncPickedLocation);
  }, [t]);

  const openSession = (id: string) => {
    setActiveSessionId(id);
    navigate(`/owner/chat/${id}`);
  };

  const onNewSession = async () => {
    try {
      const created = await createSession();
      if (created?.id && sessionIdFromRoute) navigate("/owner/chat", { replace: true });
      if (!created?.id) toast.warning(t("Session created, but no session id was returned."));
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || t("Failed to start a new session."));
    }
  };

  const onDeleteSession = async (id: string) => {
    try {
      await deleteSession(id);
      toast.success(t("Session deleted."));
      if (activeSessionId === id) navigate("/owner/chat", { replace: true });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || t("Delete failed."));
    }
  };

  const onArchive = async () => {
    try {
      await archiveActive();
      toast.success(t("Session archived."));
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || t("Archive failed."));
    }
  };

  const onPatchContext = async () => {
    try {
      await patchContext({ uiUpdatedAt: new Date().toISOString() });
      toast.success(t("Context patched."));
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || t("Patch context failed."));
    }
  };

  const onSend = async () => {
    if (!composerText.trim() || sending) return;
    const value = composerText;
    setComposerText("");
    setLocationPrefilled(false);
    await sendMessage(value);
  };

  return (
    <div dir={i18n.dir()} className="stitch-ref-chat-shell h-[calc(100dvh-2rem)] min-h-[38rem] overflow-hidden lg:h-[calc(100dvh-3.5rem)]">
      <div className="mx-auto flex h-full max-w-[1440px] min-h-0 gap-6 px-4 py-4 lg:px-6">
        <section className="stitch-ref-chat-panel flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl">
          <div className="flex items-center justify-between border-b border-[rgba(154,143,128,0.1)] px-6 py-5">
            <div className={`flex items-center gap-4 ${isRtl ? "flex-row-reverse" : ""}`}>
              <button type="button" className="text-[rgba(154,143,128,0.85)]">
                <MoreVertical className="h-5 w-5" />
              </button>
              <button type="button" className="text-[rgba(154,143,128,0.85)]">
                <Share2 className="h-5 w-5" />
              </button>
            </div>

            <div className={`flex items-center gap-3 ${isRtl ? "flex-row" : "flex-row-reverse"}`}>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[rgba(233,193,118,0.2)] bg-[rgba(233,193,118,0.08)] text-[var(--stitch-ref-gold)]">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="text-lg text-[var(--stitch-ref-gold)]">{t("CREOS AI Assistant")}</p>
                <p className="text-sm text-[rgba(226,226,231,0.76)]">
                  {activeSession?.title || t("Connected now")} <span className="text-[var(--stitch-ref-gold)]">●</span>
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 border-b border-[rgba(154,143,128,0.08)] px-6 py-4">
            <button
              type="button"
              onClick={() => navigate(`/owner/map-picker?returnTo=${encodeURIComponent("/owner/chat")}&mode=chat`)}
              className="stitch-ref-button-secondary !min-h-0 !px-4 !py-2 !text-sm"
            >
              <MapPin className="h-4 w-4" />
              {t("Pick location from map")}
            </button>
            <button type="button" onClick={onPatchContext} className="stitch-ref-button-secondary !min-h-0 !px-4 !py-2 !text-sm">
              <DatabaseZap className="h-4 w-4" />
              {t("Patch Context")}
            </button>
            <button type="button" onClick={onArchive} className="stitch-ref-button-secondary !min-h-0 !px-4 !py-2 !text-sm">
              <Archive className="h-4 w-4" />
              {t("Archive Session")}
            </button>
            {activeSessionId ? (
              <button
                type="button"
                onClick={() => onDeleteSession(activeSessionId)}
                className="inline-flex min-h-0 items-center gap-2 border border-[rgba(255,180,171,0.32)] px-4 py-2 text-sm text-[#ffdad6]"
              >
                <Trash2 className="h-4 w-4" />
                {t("Delete")}
              </button>
            ) : null}
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto bg-[rgba(18,24,42,0.45)] px-6 py-8">
            <div className="mx-auto flex max-w-4xl flex-col gap-7">
              {!messages.length ? (
                <div className="mx-auto rounded-md bg-[rgba(30,32,35,0.82)] px-6 py-3 text-sm text-[rgba(226,226,231,0.68)]">
                  {t("Conversation started today")}
                </div>
              ) : null}

              {messages.map((message) => {
                const user = message.role === "user";
                return (
                  <div key={message.id} className={`flex ${user ? "justify-end" : "justify-start"}`}>
                    <article className={`max-w-[82%] rounded-2xl px-6 py-5 ${user ? "stitch-ref-chat-message-sent" : "stitch-ref-chat-message-received"}`}>
                      <div className="mb-3 text-xs text-[rgba(154,143,128,0.78)]">
                        {user ? t("You") : t("CREOS AI Assistant")} {formatTime(message.createdAt)}
                      </div>
                      <p className="whitespace-pre-wrap text-lg leading-9">{message.content}</p>
                    </article>
                  </div>
                );
              })}

              {sending ? (
                <div className="text-sm text-[rgba(233,193,118,0.86)]">{t("Assistant is typing...")}</div>
              ) : null}

              {error ? (
                <div className="rounded-md border border-[rgba(255,180,171,0.3)] bg-[rgba(147,0,10,0.15)] px-4 py-3 text-sm text-[#ffdad6]">
                  {error}
                </div>
              ) : null}

              <div ref={bottomRef} />
            </div>
          </div>

          <div className="shrink-0 border-t border-[rgba(154,143,128,0.1)] bg-[rgba(23,27,39,0.95)] p-5">
            {locationPrefilled ? (
              <div className="mb-4 rounded-xl border border-[rgba(233,193,118,0.24)] bg-[rgba(233,193,118,0.08)] px-4 py-3 text-sm text-[rgba(226,226,231,0.88)]">
                {t("Location details were added to your draft message. Review and press Send when ready.")}
              </div>
            ) : null}
            <div className="rounded-xl border border-[rgba(154,143,128,0.18)] bg-[rgba(26,31,57,0.9)] px-4 py-4">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onSend}
                  disabled={!composerText.trim() || sending}
                  className="flex h-12 w-12 items-center justify-center bg-[var(--stitch-ref-gold)] text-[#261900] disabled:opacity-40"
                >
                  <Send className={`h-5 w-5 ${isRtl ? "rotate-180" : ""}`} />
                </button>
                <textarea
                  value={composerText}
                  onChange={(e) => setComposerText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      onSend();
                    }
                  }}
                  placeholder={t("Write your inquiry here...")}
                  rows={2}
                  className="min-h-[64px] max-h-40 flex-1 resize-none bg-transparent px-3 py-2 text-lg text-[var(--stitch-ref-text)] outline-none placeholder:text-[rgba(154,143,128,0.64)]"
                />
              </div>
            </div>
          </div>
        </section>

        <aside className="stitch-ref-chat-panel hidden min-h-0 w-[390px] shrink-0 rounded-xl p-6 xl:flex xl:flex-col">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="stitch-ref-title text-2xl text-[var(--stitch-ref-gold)]">{t("Smart Conversations")}</h2>
            <Search className="h-5 w-5 text-[rgba(154,143,128,0.82)]" />
          </div>

          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">
            {loadingSessions ? (
              Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="h-28 animate-pulse bg-[rgba(30,32,35,0.45)]" />
              ))
            ) : null}

            {sessions.map((session) => {
              const active = activeSessionId === session.id;
              return (
                <button
                  key={session.id}
                  type="button"
                  onClick={() => openSession(session.id)}
                  className={`w-full border p-5 text-right transition ${
                    active
                      ? "border-[rgba(233,193,118,0.34)] bg-[rgba(30,32,35,0.45)]"
                      : "border-[rgba(154,143,128,0.12)] bg-[rgba(30,32,35,0.35)] hover:border-[rgba(233,193,118,0.24)]"
                  }`}
                >
                  <div className={`flex items-start gap-4 ${isRtl ? "flex-row" : "flex-row-reverse"}`}>
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${active ? "border border-[rgba(233,193,118,0.3)] bg-[rgba(233,193,118,0.08)] text-[var(--stitch-ref-gold)]" : "bg-[rgba(255,255,255,0.06)] text-[rgba(226,226,231,0.74)]"}`}>
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className={`flex items-center justify-between gap-4 ${isRtl ? "flex-row" : "flex-row-reverse"}`}>
                        <span className={`stitch-ref-mono text-sm ${active ? "text-[var(--stitch-ref-gold)]" : "text-[rgba(226,226,231,0.86)]"}`}>
                          {session.title || t("Session")}
                        </span>
                        <span className="text-xs text-[rgba(154,143,128,0.76)]">
                          {formatTime(session.updatedAt || session.createdAt) || t("Now")}
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
              onClick={onNewSession}
              className="w-full border border-dashed border-[rgba(233,193,118,0.28)] px-5 py-4 text-sm text-[var(--stitch-ref-gold)]"
            >
              {t("Start New Conversation")}
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
