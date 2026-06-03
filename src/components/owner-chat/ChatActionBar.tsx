import { Archive, DatabaseZap } from "lucide-react";
import { useTranslation } from "react-i18next";

type Props = {
  onArchive: () => void;
  onPatchContext: () => void;
  busy?: boolean;
};

export default function ChatActionBar({ onArchive, onPatchContext, busy }: Props) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-white/10 px-4 py-3">
      <button
        type="button"
        onClick={onPatchContext}
        disabled={busy}
        className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/80 disabled:opacity-50 hover:bg-white/10"
      >
        <DatabaseZap className="h-3.5 w-3.5" /> {t("Patch Context")}
      </button>
      <button
        type="button"
        onClick={onArchive}
        disabled={busy}
        className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/80 disabled:opacity-50 hover:bg-white/10"
      >
        <Archive className="h-3.5 w-3.5" /> {t("Archive Session")}
      </button>
    </div>
  );
}
