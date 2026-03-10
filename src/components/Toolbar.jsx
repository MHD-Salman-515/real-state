// src/components/Toolbar.jsx
export default function Toolbar({ children, className = "" }) {
  return (
    <div
      className={
        "mb-4 flex flex-wrap items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-slate-100 backdrop-blur-xl " +
        className
      }
    >
      {children}
    </div>
  );
}
