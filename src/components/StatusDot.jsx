// src/components/StatusDot.jsx
export default function StatusDot({ color = "gray", label }) {
  const map = {
    green:  "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.45)]",
    yellow: "bg-[var(--creos-accent)] shadow-[0_0_10px_rgba(212,175,55,0.4)]",
    red:    "bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.6)]",
    blue:   "bg-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.45)]",
    gray:   "bg-gray-400 shadow-[0_0_5px_rgba(156,163,175,0.5)]",
  };

  return (
    <span className="inline-flex items-center gap-1.5 text-sm">
      <span
        className={`
          inline-block h-2.5 w-2.5 rounded-full 
          ${map[color] || map.gray} 
          backdrop-blur-sm
        `}
      />
      {label && <span className="text-[color:rgb(var(--creos-text-rgb)/0.78)]">{label}</span>}
    </span>
  );
}
