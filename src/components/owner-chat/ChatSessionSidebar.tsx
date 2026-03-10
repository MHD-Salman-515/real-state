import { MessageSquare, Plus, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import type { ChatSession } from "@/types/chat";

type Props = {
  sessions: ChatSession[];
  activeSessionId: string | null;
  loading: boolean;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
};

export default function ChatSessionSidebar({ sessions, activeSessionId, loading, onSelect, onNew, onDelete }: Props) {
  return (
    <aside className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 backdrop-blur-2xl">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">Sessions</h3>
        <button
          type="button"
          onClick={onNew}
          className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-xs text-white transition hover:bg-white/15"
        >
          <Plus className="h-3.5 w-3.5" /> New
        </button>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-xl bg-white/5" />
          ))}
        </div>
      ) : sessions.length ? (
        <ul className="max-h-[620px] space-y-2 overflow-y-auto pr-1">
          {sessions.map((s, idx) => {
            const active = s.id === activeSessionId;
            return (
              <motion.li
                key={s.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: idx * 0.02 }}
              >
                <div
                  className={`rounded-xl border p-2.5 transition ${
                    active
                      ? "border-white/25 bg-white/[0.12] shadow-[0_8px_30px_rgba(0,0,0,0.35)]"
                      : "border-white/10 bg-black/35 hover:border-white/20 hover:bg-white/[0.06]"
                  }`}
                >
                  <button type="button" className="w-full text-left" onClick={() => onSelect(s.id)}>
                    <p className="flex items-center gap-1.5 truncate text-sm text-white">
                      <MessageSquare className="h-3.5 w-3.5 text-white/60" />
                      {s.title || "Session"}
                    </p>
                    <p className="mt-1 truncate text-xs text-white/55">{s.preview || "No preview"}</p>
                  </button>
                  <div className="mt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => onDelete(s.id)}
                      className="inline-flex items-center gap-1 rounded-md border border-red-400/30 px-2 py-0.5 text-[11px] text-red-200 hover:bg-red-500/10"
                    >
                      <Trash2 className="h-3 w-3" /> Delete
                    </button>
                  </div>
                </div>
              </motion.li>
            );
          })}
        </ul>
      ) : (
        <p className="text-sm text-white/60">No sessions yet.</p>
      )}
    </aside>
  );
}
