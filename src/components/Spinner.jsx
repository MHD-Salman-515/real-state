// src/components/Spinner.jsx
export default function Spinner({ size = 24 }) {
  return (
    <div
      className="
        animate-spin rounded-full 
        border-2 border-white/15 
        border-t-white/80 
        shadow-md shadow-white/10
        backdrop-blur-sm
      "
      style={{ width: size, height: size }}
      aria-label="جارٍ التحميل"
    />
  );
}
