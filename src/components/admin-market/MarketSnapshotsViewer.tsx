import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import {
  getAdminMarketSnapshots,
  rebuildAdminMarketSnapshots,
  type MarketSnapshot,
} from "@/services/adminMarketSnapshots.api";
import SnapshotTable from "@/components/admin-market/SnapshotTable";
import SnapshotDetailsDrawer from "@/components/admin-market/SnapshotDetailsDrawer";

type Props = {
  onError?: (message: string) => void;
  onSuccess?: (message: string) => void;
};

export default function MarketSnapshotsViewer({ onError, onSuccess }: Props) {
  const [snapshots, setSnapshots] = useState<MarketSnapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<MarketSnapshot | null>(null);
  const [rebuilding, setRebuilding] = useState(false);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getAdminMarketSnapshots();
      setSnapshots(data);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Snapshots endpoint not available yet.";
      setError(msg);
      onError?.(msg);
      setSnapshots([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleRebuild = async () => {
    setRebuilding(true);
    try {
      await rebuildAdminMarketSnapshots();
      onSuccess?.("Snapshots rebuilt successfully.");
      await load();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Rebuild snapshots is not available.";
      onError?.(msg);
      setError(msg);
    } finally {
      setRebuilding(false);
    }
  };

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-white">Market Snapshots</h2>
          <p className="text-xs text-white/55">Daily snapshot viewer for historical market states.</p>
        </div>
        <button
          type="button"
          onClick={handleRebuild}
          disabled={rebuilding}
          className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-sm text-white disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${rebuilding ? "animate-spin" : ""}`} /> Rebuild Snapshots
        </button>
      </div>

      {error ? <div className="mb-3 rounded-xl border border-amber-400/30 bg-amber-500/10 p-2 text-xs text-amber-200">{error}</div> : null}

      <SnapshotTable snapshots={snapshots} loading={loading} onSelect={setSelected} />

      <SnapshotDetailsDrawer snapshot={selected} onClose={() => setSelected(null)} />
    </section>
  );
}
