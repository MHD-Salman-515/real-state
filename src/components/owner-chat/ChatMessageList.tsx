import { motion } from "framer-motion";
import type { ChatMessage } from "@/types/chat";
import ChatWelcomeState from "@/components/owner-chat/ChatWelcomeState";

type Props = {
  messages: ChatMessage[];
  loading: boolean;
};

function time(v?: string): string {
  if (!v) return "";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function ThinkingIndicator() {
  return (
    <div className="flex justify-start px-4 pb-3">
      <div className="rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 backdrop-blur-xl">
        <div className="mb-1 text-[10px] uppercase tracking-[0.15em] text-white/60">Assistant Thinking</div>
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="h-2 w-2 rounded-full bg-white/70"
              animate={{ y: [0, -4, 0], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.12 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ChatMessageList({ messages, loading }: Props) {
  if (!messages.length && !loading) return <ChatWelcomeState />;

  return (
    <div className="space-y-3 p-4">
      {messages.map((m, idx) => {
        const user = m.role === "user";
        const tool = m.role === "tool";
        return (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: idx * 0.01 }}
            className={`flex ${user ? "justify-end" : "justify-start"}`}
          >
            <article
              className={`max-w-[88%] rounded-2xl border px-4 py-3 shadow-[0_10px_35px_rgba(0,0,0,0.32)] backdrop-blur-xl ${
                user
                  ? "border-white/20 bg-white text-black"
                  : tool
                  ? "border-white/20 bg-black/60 text-white"
                  : "border-white/10 bg-white/[0.07] text-white"
              }`}
            >
              <div className="mb-1 text-[10px] uppercase tracking-[0.15em] opacity-70">
                {user ? "User" : tool ? "Tool" : "Assistant"} {time(m.createdAt)}
              </div>
              <p className="whitespace-pre-wrap text-sm leading-6">{m.content}</p>
            </article>
          </motion.div>
        );
      })}

      {loading ? <ThinkingIndicator /> : null}
    </div>
  );
}
