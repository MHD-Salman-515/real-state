// src/components/Toolbar.jsx
export default function Toolbar({ children, className = "" }) {
  return (
    <div
      className={
        "mb-4 flex flex-wrap items-center gap-2 rounded-2xl " +
        "border border-white/15 bg-white/5/ " + // في حال عندك class جاهز card-glass ممكن تستبدل السطرين دول بـ: "card-glass "
        "backdrop-blur-sm px-3 py-2 shadow-soft " +
        "text-slate-100 " +
        className
      }
    >
      {children}
    </div>
  );
}
