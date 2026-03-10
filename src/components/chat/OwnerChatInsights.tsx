import type { ChatSession } from "@/types/chat";

interface OwnerChatInsightsProps {
  session: ChatSession | null;
  messagesCount: number;
  sending: boolean;
}

export default function OwnerChatInsights({ session, messagesCount, sending }: OwnerChatInsightsProps) {
  return (
    <aside className="rounded-3xl border border-white/10 bg-black/45 p-4 backdrop-blur-xl">
      <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-white/70">Session Context</h3>
      <dl className="mt-3 space-y-2 text-xs">
        <div className="rounded-2xl border border-white/10 bg-black/25 p-2.5">
          <dt className="text-white/50">Session ID</dt>
          <dd className="mt-1 break-all text-white/90">{session?.id || "Not selected"}</dd>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/25 p-2.5">
          <dt className="text-white/50">Title</dt>
          <dd className="mt-1 text-white/90">{session?.title || "New conversation"}</dd>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/25 p-2.5">
          <dt className="text-white/50">Messages</dt>
          <dd className="mt-1 text-white/90">{messagesCount}</dd>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/25 p-2.5">
          <dt className="text-white/50">Status</dt>
          <dd className="mt-1 text-white/90">{sending ? "Awaiting response" : "Ready"}</dd>
        </div>
      </dl>

      <p className="mt-4 rounded-2xl border border-white/10 bg-black/25 p-3 text-xs leading-5 text-white/70">
        Pricing and valuation questions are routed through existing backend market/advisor endpoints when available. No static valuation output is generated on the frontend.
      </p>
    </aside>
  );
}
