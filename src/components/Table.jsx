// src/components/Table.jsx
export default function Table({ columns, rows, emptyText = "لا توجد بيانات" }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-white/10 bg-black/20 backdrop-blur-md shadow-lg shadow-emerald-500/10">
      <table className="min-w-full divide-y divide-white/5 text-sm">
        <thead className="bg-white/5">
          <tr>
            {columns.map((c) => (
              <th
                key={c.key}
                className="px-4 py-2.5 text-right text-[13px] font-semibold text-slate-200"
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="divide-y divide-white/5">
          {rows.length === 0 && (
            <tr>
              <td
                className="px-4 py-6 text-center text-slate-400 text-sm"
                colSpan={columns.length}
              >
                {emptyText}
              </td>
            </tr>
          )}

          {rows.map((r, i) => (
            <tr
              key={r.id ?? i}
              className="hover:bg-white/5 transition-colors"
            >
              {columns.map((c) => (
                <td
                  key={c.key}
                  className="px-4 py-2.5 text-sm text-slate-100 align-middle"
                >
                  {typeof c.render === "function" ? c.render(r) : r[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
