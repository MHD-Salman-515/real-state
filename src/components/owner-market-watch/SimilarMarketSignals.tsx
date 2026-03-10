type Props = {
  result: Record<string, any> | null;
};

export default function SimilarMarketSignals({ result }: Props) {
  const signals = Array.isArray(result?.signals)
    ? result.signals
    : Array.isArray(result?.comps)
    ? result.comps
    : [];

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <h3 className="text-sm font-semibold text-white">Supporting Market Signals</h3>
      <div className="mt-3 space-y-2">
        {signals.length ? (
          signals.slice(0, 5).map((s: any, idx: number) => (
            <article key={idx} className="rounded-xl border border-white/10 bg-black/25 p-3">
              <p className="text-xs text-white/55">Signal #{idx + 1}</p>
              <p className="mt-1 text-sm text-white/90">{typeof s === "string" ? s : JSON.stringify(s)}</p>
            </article>
          ))
        ) : (
          <p className="text-sm text-white/60">No detailed market signals returned yet.</p>
        )}
      </div>
    </section>
  );
}
