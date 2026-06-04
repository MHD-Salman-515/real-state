// src/components/PageHeader.jsx
export default function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="card-glass mb-4 flex flex-wrap items-center justify-between gap-3 rounded-3xl px-5 py-4">
      <div>
        <h1 className="text-xl font-bold text-[color:var(--creos-text)] md:text-2xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1 text-sm text-[color:rgb(var(--creos-text-rgb)/0.64)]">
            {subtitle}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex items-center gap-2">
          {actions}
        </div>
      )}
    </div>
  );
}
