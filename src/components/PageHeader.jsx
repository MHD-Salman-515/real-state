// src/components/PageHeader.jsx
export default function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-slate-50">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1 text-sm text-slate-400">
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
