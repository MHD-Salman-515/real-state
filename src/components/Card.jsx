// src/components/Card.jsx
export default function Card({ children, className = "" }) {
  return (
    <div
      className={`
        card card-glass p-4
        hover:border-[color:rgb(var(--creos-accent-rgb)/0.22)]
        transition duration-300
        ${className}
      `}
    >
      {children}
    </div>
  );
}
