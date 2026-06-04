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
        className="btn-glass px-3 py-1.5 text-xs disabled:opacity-50"
      >
        <DatabaseZap className="h-3.5 w-3.5" /> {t("Patch Context")}
      </button>
      <button
        type="button"
        onClick={onArchive}
        disabled={busy}
        className="btn-glass px-3 py-1.5 text-xs disabled:opacity-50"
      >
        <Archive className="h-3.5 w-3.5" /> {t("Archive Session")}
      </button>
    </div>
  );
}
