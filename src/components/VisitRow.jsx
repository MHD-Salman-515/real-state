// components/VisitRow.jsx
export default function VisitRow({ row, onChange, onDelete }) {
  const inputCls =
    "w-full rounded-xl bg-white/5 border border-white/15 " +
    "px-3 py-2 text-white placeholder-white/40 " +
    "focus:outline-none focus:ring-2 focus:ring-white/30 transition";

  return (
    <tr className="border-b border-white/10 hover:bg-white/5 transition">
      <td className="px-3 py-2">
        <input
          className={inputCls}
          placeholder="ID العقار"
          value={row.property_id}
          onChange={(e) => onChange({ property_id: e.target.value })}
        />
      </td>

      <td className="px-3 py-2">
        <input
          type="date"
          className={inputCls}
          value={row.date}
          onChange={(e) => onChange({ date: e.target.value })}
        />
      </td>

      <td className="px-3 py-2">
        <input
          type="time"
          className={inputCls}
          value={row.time}
          onChange={(e) => onChange({ time: e.target.value })}
        />
      </td>

      <td className="px-3 py-2">
        <input
          className={inputCls}
          placeholder="ملاحظات"
          value={row.notes}
          onChange={(e) => onChange({ notes: e.target.value })}
        />
      </td>

      <td className="px-3 py-2 text-center">
        <button
          type="button"
          onClick={onDelete}
          className="px-3 py-2 text-sm rounded-lg border border-red-400/40 
          text-red-300 hover:bg-red-500/10 transition"
        >
          حذف
        </button>
      </td>
    </tr>
  );
}
