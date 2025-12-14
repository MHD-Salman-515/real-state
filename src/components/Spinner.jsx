// src/components/Spinner.jsx
export default function Spinner({ size = 24 }) {
  return (
    <div
      className="
        animate-spin rounded-full 
        border-2 border-emerald-400/40 
        border-t-emerald-300 
        shadow-md shadow-emerald-500/20
        backdrop-blur-sm
      "
      style={{ width: size, height: size }}
      aria-label="جارٍ التحميل"
    />
  );
}
