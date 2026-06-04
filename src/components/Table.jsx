// src/components/Table.jsx
export default function Table({ columns, rows, emptyText = "No data available" }) {
  const classForKey = (key = "") => {
    const k = String(key).toLowerCase();
    if (k === "id" || k.endsWith("id")) return "min-w-[90px] tabular-nums whitespace-nowrap";
    if (k.includes("status")) return "w-[160px] whitespace-nowrap";
    if (k.includes("action")) return "w-[120px] text-center whitespace-nowrap";
    if (k.includes("date") || k.includes("time")) return "whitespace-nowrap";
    return "";
  };

  return (
    <div className="table-creos">
      <table className="min-w-[900px]">
        <thead className="sticky top-0 z-10 backdrop-blur-glass">
          <tr className="border-b border-white/10">
            {columns.map((c) => (
              <th
                key={c.key}
                className={`px-4 py-3 align-middle text-left ${classForKey(c.key)}`}
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="divide-y divide-white/10">
          {rows.length === 0 && (
            <tr>
              <td className="px-4 py-6 text-center text-sm text-[color:rgb(var(--creos-text-rgb)/0.52)]" colSpan={columns.length}>
                {emptyText}
              </td>
            </tr>
          )}

          {rows.map((r, i) => (
            <tr key={r.id ?? i} className="transition-colors hover:bg-white/[0.04]">
              {columns.map((c) => (
                <td key={c.key} className={`px-4 py-3 align-middle text-left text-sm leading-5 text-[color:var(--creos-text)] ${classForKey(c.key)}`}>
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
