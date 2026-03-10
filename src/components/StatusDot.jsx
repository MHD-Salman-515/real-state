// src/components/StatusDot.jsx
export default function StatusDot({ color = "gray", label }) {
  const map = {
    green:  "bg-white/10 shadow-[0_0_6px_rgba(16,185,129,0.6)]",
    yellow: "bg-white/10 shadow-[0_0_6px_rgba(255,255,255,0.35)]",
    red:    "bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.6)]",
    blue:   "bg-white/10 shadow-[0_0_6px_rgba(34,211,238,0.6)]",
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
      {label && <span className="text-slate-300">{label}</span>}
    </span>
  );
}
