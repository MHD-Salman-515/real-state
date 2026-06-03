import type { ChatSession } from "@/types/chat";
import { useTranslation } from "react-i18next";

interface OwnerChatInsightsProps {
  session: ChatSession | null;
  messagesCount: number;
  sending: boolean;
}

export default function OwnerChatInsights({ session, messagesCount, sending }: OwnerChatInsightsProps) {
  const { t } = useTranslation();

  return (
    <aside className="rounded-3xl border border-white/10 bg-black/45 p-4 backdrop-blur-xl">
      <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-white/70">{t("Session Context")}</h3>
      <dl className="mt-3 space-y-2 text-xs">
        <div className="rounded-2xl border border-white/10 bg-black/25 p-2.5">
          <dt className="text-white/50">{t("Session ID")}</dt>
          <dd className="mt-1 break-all text-white/90">{session?.id || t("Not selected")}</dd>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/25 p-2.5">
          <dt className="text-white/50">{t("Title")}</dt>
          <dd className="mt-1 text-white/90">{session?.title || t("New conversation")}</dd>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/25 p-2.5">
          <dt className="text-white/50">{t("Messages")}</dt>
          <dd className="mt-1 text-white/90">{messagesCount}</dd>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/25 p-2.5">
          <dt className="text-white/50">{t("Status")}</dt>
          <dd className="mt-1 text-white/90">{sending ? t("Awaiting response") : t("Ready")}</dd>
        </div>
      </dl>

      <p className="mt-4 rounded-2xl border border-white/10 bg-black/25 p-3 text-xs leading-5 text-white/70">
        {t("Pricing and valuation questions are routed through existing backend market/advisor endpoints when available. No static valuation output is generated on the frontend.")}
      </p>
    </aside>
  );
}
