// src/components/Card.jsx
export default function Card({ children, className = "" }) {
  return (
    <div
      className={`
        p-4 rounded-2xl
        bg-black/40 backdrop-blur-xl
        border border-white/15 
        shadow-lg shadow-white/10
        hover:shadow-white/10 hover:border-white/15
        transition duration-300
        ${className}
      `}
    >
      {children}
    </div>
  );
}
