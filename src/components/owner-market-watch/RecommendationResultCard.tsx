type Props = {
  result: Record<string, any> | null;
};

function valueOf(obj: Record<string, any> | null, keys: string[], fallback = "-") {
  if (!obj) return fallback;
  for (const k of keys) {
    if (obj[k] !== undefined && obj[k] !== null && obj[k] !== "") return obj[k];
  }
  return fallback;
}

export default function RecommendationResultCard({ result }: Props) {
  const low = Number(valueOf(result, ["recommendedMin", "min", "low", "rangeMin"], 0));
  const high = Number(valueOf(result, ["recommendedMax", "max", "high", "rangeMax"], 0));
  const conf = Number(valueOf(result, ["confidence", "score", "confidenceScore"], 0));
  const explanation = String(valueOf(result, ["explanation", "reason", "summary"], "No explanation returned."));

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <h3 className="text-sm font-semibold text-white">Recommendation Result</h3>
      {result ? (
        <>
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            <article className="rounded-xl border border-white/10 bg-black/25 p-3">
              <p className="text-xs text-white/55">Recommended Min</p>
              <p className="mt-1 text-sm font-semibold text-white">{low ? `${Math.round(low).toLocaleString()} SYP` : "-"}</p>
            </article>
            <article className="rounded-xl border border-white/10 bg-black/25 p-3">
              <p className="text-xs text-white/55">Recommended Max</p>
              <p className="mt-1 text-sm font-semibold text-white">{high ? `${Math.round(high).toLocaleString()} SYP` : "-"}</p>
            </article>
            <article className="rounded-xl border border-white/10 bg-black/25 p-3">
              <p className="text-xs text-white/55">Confidence</p>
              <p className="mt-1 text-sm font-semibold text-white">{conf ? `${Math.round(conf)}%` : "-"}</p>
            </article>
          </div>

          <article className="mt-3 rounded-xl border border-white/10 bg-black/25 p-3">
            <p className="text-xs text-white/55">Explanation</p>
            <p className="mt-1 text-sm text-white/90">{explanation}</p>
          </article>
        </>
      ) : (
        <p className="mt-2 text-sm text-white/60">Submit property details to get a recommendation.</p>
      )}
    </section>
  );
}
