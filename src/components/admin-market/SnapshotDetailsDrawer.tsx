import type { MarketSnapshot } from "@/services/adminMarketSnapshots.api";

type Props = {
  snapshot: MarketSnapshot | null;
  onClose: () => void;
};

export default function SnapshotDetailsDrawer({ snapshot, onClose }: Props) {
  if (!snapshot) return null;

  return (
    <div className="fixed inset-0 z-[110] flex justify-end bg-black/60">
      <aside className="h-full w-full max-w-md overflow-auto border-l border-white/10 bg-[#050912] p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">Snapshot Details</h3>
          <button onClick={onClose} type="button" className="rounded-lg border border-white/10 px-2 py-1 text-xs text-white/70 hover:bg-white/10">
            Close
          </button>
        </div>

        <div className="space-y-2">
          {Object.entries(snapshot).map(([key, value]) => (
            <article key={key} className="rounded-xl border border-white/10 bg-black/30 p-2.5">
              <p className="text-xs uppercase tracking-[0.12em] text-white/45">{key}</p>
              <p className="mt-1 text-sm text-white/90">{String(value ?? "-")}</p>
            </article>
          ))}
        </div>
      </aside>
    </div>
  );
}
