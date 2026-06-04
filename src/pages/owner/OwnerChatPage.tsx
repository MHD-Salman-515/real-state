import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Command, MessageSquareDashed, Sparkles, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

import ChatMessageList from "@/components/owner-chat/ChatMessageList";
import ChatComposer from "@/components/owner-chat/ChatComposer";
import ChatActionBar from "@/components/owner-chat/ChatActionBar";
import { useOwnerChatUi } from "@/hooks/chat/useOwnerChatUi";
import { useToast } from "@/components/ToastProvider.jsx";

export default function OwnerChatPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams();
  const sessionIdFromRoute = params.sessionId;
  const toast = useToast();
  const [inputFocused, setInputFocused] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const {
    sessions,
    activeSession,
    activeSessionId,
    setActiveSessionId,
    messages,
    loadingSessions,
    loadingMessages,
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
    const onMouseMove = (e: MouseEvent) => setMousePosition({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", onMouseMove);
    return () => window.removeEventListener("mousemove", onMouseMove);
  }, []);

  const selectSession = (id: string) => {
    setActiveSessionId(id);
    navigate(`/owner/chat/${id}`);
  };

  const onNewSession = async () => {
    try {
      const created = await createSession();
      if (created?.id) {
        const target = "/owner/chat";
        if (sessionIdFromRoute) navigate(target, { replace: true });
        return;
      }
      toast.warning(t("Session created, but no session id was returned."));
    } catch (err: any) {
      console.error("[OwnerChat] createSession failed", err?.response?.data || err);
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

  return (
    <div className="chat-shell relative min-h-[calc(100vh-2rem)] w-full overflow-hidden px-4 py-6 md:px-6">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute left-1/4 top-0 h-96 w-96 rounded-full bg-[rgb(var(--creos-accent-rgb)/0.08)] blur-[128px]" />
        <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-[rgb(var(--creos-navy-rgb)/0.26)] blur-[128px]" />
        <div className="absolute right-1/3 top-1/4 h-64 w-64 rounded-full bg-[rgb(var(--creos-text-rgb)/0.06)] blur-[96px]" />
      </div>

      <motion.div
        className="relative z-10 mx-auto w-full max-w-4xl space-y-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="text-center">
          <div className="badge-creos text-xs backdrop-blur-xl">
            <MessageSquareDashed className="h-3.5 w-3.5" />
            {t("Owner Workspace")}
          </div>
          <h1 className="mt-4 bg-gradient-to-r from-[color:var(--creos-text)] to-[color:rgb(var(--creos-text-rgb)/0.48)] bg-clip-text pb-1 text-3xl font-medium tracking-tight text-transparent">
            {t("How can I help today?")}
          </h1>
          <p className="mt-2 text-sm text-[color:rgb(var(--creos-text-rgb)/0.5)]">{t("Type a command or ask a question")}</p>
        </div>

        {error ? (
          <div className="rounded-2xl border border-rose-300/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-200 backdrop-blur-xl">
            {error}
          </div>
        ) : null}

        <motion.div
          className="chat-panel relative"
          initial={{ scale: 0.98 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="border-b border-white/[0.05] p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2">
                <Sparkles className="h-4 w-4 text-white/70" />
                <p className="truncate text-sm font-medium text-white/85">{activeSession?.title || t("Conversation")}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onNewSession}
                  className="btn-gold px-3 py-1.5 text-xs"
                >
                  {t("New Session")}
                </button>
                {activeSessionId ? (
                  <button
                    type="button"
                    onClick={() => onDeleteSession(activeSessionId)}
                    className="inline-flex items-center gap-1 rounded-lg border border-red-400/30 px-2.5 py-1.5 text-xs text-red-200 hover:bg-red-500/10"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    {t("Delete")}
                  </button>
                ) : null}
              </div>
            </div>

            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {loadingSessions ? (
                Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-8 w-28 animate-pulse rounded-lg bg-white/10" />)
              ) : sessions.length ? (
                sessions.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => selectSession(s.id)}
                    className={`whitespace-nowrap rounded-lg border px-2.5 py-1.5 text-xs transition ${
                      s.id === activeSessionId
                        ? "border-[rgb(var(--creos-accent-rgb)/0.28)] bg-[rgb(var(--creos-accent-rgb)/0.14)] text-[color:var(--creos-text)]"
                        : "border-white/10 bg-[rgb(var(--creos-surface-rgb)/0.42)] text-[color:rgb(var(--creos-text-rgb)/0.68)] hover:bg-white/5 hover:text-[color:var(--creos-text)]"
                    }`}
                  >
                    {s.title || t("Session")}
                  </button>
                ))
              ) : (
                <p className="text-xs text-[color:rgb(var(--creos-text-rgb)/0.45)]">{t("No sessions yet")}</p>
              )}
            </div>
          </div>

          <ChatActionBar onArchive={onArchive} onPatchContext={onPatchContext} busy={sending} />

          <div className="min-h-[380px] max-h-[52vh] overflow-y-auto">
            <ChatMessageList messages={messages} loading={loadingMessages || sending} />
          </div>

          <ChatComposer sending={sending} onSend={sendMessage} onFocusChange={setInputFocused} />
        </motion.div>

        <div className="flex flex-wrap items-center justify-center gap-2">
          {["/clone", "/figma", "/page", "/improve"].map((cmd) => (
            <button
              key={cmd}
              type="button"
            className="chat-chip text-sm"
            >
              <Command className="h-4 w-4" />
              <span>{cmd}</span>
            </button>
          ))}
        </div>
      </motion.div>

      {inputFocused ? (
        <motion.div
          className="pointer-events-none fixed z-0 h-[50rem] w-[50rem] rounded-full bg-gradient-to-r from-[rgb(var(--creos-accent-rgb)/0.18)] via-[rgb(var(--creos-accent-bright-rgb)/0.12)] to-[rgb(var(--creos-navy-rgb)/0.18)] opacity-[0.08] blur-[96px]"
          animate={{
            x: mousePosition.x - 400,
            y: mousePosition.y - 400,
          }}
          transition={{
            type: "spring",
            damping: 25,
            stiffness: 150,
            mass: 0.5,
          }}
        />
      ) : null}
    </div>
  );
}
