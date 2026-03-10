import type { ChatMessage } from "@/types/chat";

interface OwnerChatMessagesProps {
  messages: ChatMessage[];
  loading: boolean;
}

function timeLabel(value?: string): string {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function OwnerChatMessages({ messages, loading }: OwnerChatMessagesProps) {
  if (loading) {
    return (
      <div className="space-y-3 p-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className={`h-16 animate-pulse rounded-2xl bg-white/5 ${i % 2 ? "ml-auto w-3/4" : "w-4/5"}`} />
        ))}
      </div>
    );
  }

  if (!messages.length) {
    return (
      <div className="grid h-full min-h-[400px] place-items-center p-8 text-center">
        <div className="max-w-lg rounded-3xl border border-white/10 bg-black/40 px-6 py-8 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
          <p className="text-sm font-medium text-white">Start your first owner conversation</p>
          <p className="mt-2 text-sm text-white/60">
            Ask about portfolio strategy, pricing, market comparisons, or operational actions.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-6">
      {messages.map((msg) => {
        const isUser = msg.role === "user";
        const isTool = msg.role === "tool";
        return (
          <div key={msg.id} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
            <article
              className={`max-w-[86%] rounded-2xl border px-4 py-3.5 shadow-[0_10px_35px_rgba(0,0,0,0.25)] ${
                isUser
                  ? "border-white/20 bg-white text-black"
                  : isTool
                  ? "border-white/20 bg-black/65 text-white"
                  : "border-white/10 bg-white/5 text-white"
              }`}
            >
              <div className="mb-1 flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] opacity-70">
                <span>{isUser ? "Owner" : isTool ? "Market Tool" : "Assistant"}</span>
                <span>{timeLabel(msg.createdAt)}</span>
              </div>
              <p className="whitespace-pre-wrap text-sm leading-6">{msg.content || "No content returned."}</p>
            </article>
          </div>
        );
      })}
    </div>
  );
}
