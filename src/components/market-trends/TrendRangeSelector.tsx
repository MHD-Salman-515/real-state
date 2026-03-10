type RangeValue = 7 | 30 | 90;

type Props = {
  value: RangeValue;
  onChange: (value: RangeValue) => void;
};

export default function TrendRangeSelector({ value, onChange }: Props) {
  return (
    <div className="inline-flex rounded-xl border border-white/10 bg-black/25 p-1">
      {[7, 30, 90].map((r) => (
        <button
          key={r}
          type="button"
          onClick={() => onChange(r as RangeValue)}
          className={`rounded-lg px-3 py-1.5 text-xs transition ${
            value === r ? "bg-white text-black" : "text-white/75 hover:bg-white/10"
          }`}
        >
          Last {r}d
        </button>
      ))}
    </div>
  );
}
