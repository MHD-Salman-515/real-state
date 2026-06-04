// src/components/Toolbar.jsx
export default function Toolbar({ children, className = "" }) {
  return (
    <div
      className={
        "card-glass mb-4 flex flex-wrap items-center gap-2 rounded-3xl px-3 py-3 text-[color:var(--creos-text)] " +
        className
      }
    >
      {children}
    </div>
  );
}
