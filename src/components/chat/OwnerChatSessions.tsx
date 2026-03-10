import type { ChatSession } from "@/types/chat";

interface OwnerChatSessionsProps {
  sessions: ChatSession[];
  activeSessionId: string | null;
  loading: boolean;
  onSelect: (sessionId: string) => void;
  onNew: () => void;
}

function formatDate(value?: string): string {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

export default function OwnerChatSessions({
  sessions,
  activeSessionId,
  loading,
  onSelect,
  onNew,
}: OwnerChatSessionsProps) {
  return (
    <aside className="rounded-3xl border border-white/10 bg-black/45 p-3 backdrop-blur-xl">
      <div className="mb-3 flex items-center justify-between gap-2 border-b border-white/10 pb-3">
        <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-white/70">Sessions</h2>
        <button
          type="button"
          onClick={onNew}
          className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs text-white hover:bg-white/15"
        >
          + New
        </button>
      </div>

      {loading ? (
        <div className="space-y-2 px-1">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-2xl bg-white/5" />
          ))}
        </div>
      ) : sessions.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-black/25 p-4 text-sm text-white/60">
          No sessions yet. Start a new conversation.
        </div>
      ) : (
        <ul className="max-h-[620px] space-y-2 overflow-y-auto pr-1">
          {sessions.map((session) => {
            const active = activeSessionId === session.id;
            return (
              <li key={session.id}>
                <button
                  type="button"
                  onClick={() => onSelect(session.id)}
                  className={`w-full rounded-2xl border p-3 text-left transition ${
                    active
                      ? "border-white/25 bg-white/10 text-white shadow-[0_10px_30px_rgba(0,0,0,0.3)]"
                      : "border-white/10 bg-black/25 text-white/80 hover:bg-white/5"
                  }`}
                >
                  <p className="truncate text-sm font-medium">{session.title || "Untitled session"}</p>
                  <div className="mt-1 flex items-center justify-between text-xs text-white/45">
                    <span className="truncate">{session.preview || "No preview yet"}</span>
                    <span>{formatDate(session.updatedAt || session.createdAt)}</span>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </aside>
  );
}
