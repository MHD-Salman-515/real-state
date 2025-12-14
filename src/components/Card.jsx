// src/components/Card.jsx
export default function Card({ children, className = "" }) {
  return (
    <div
      className={`
        p-4 rounded-2xl
        bg-black/40 backdrop-blur-xl
        border border-emerald-300/20 
        shadow-lg shadow-emerald-600/20
        hover:shadow-emerald-400/30 hover:border-emerald-300/40
        transition duration-300
        ${className}
      `}
    >
      {children}
    </div>
  );
}
