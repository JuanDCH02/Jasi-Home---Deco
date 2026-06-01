import type { OrderStatus } from '../../types';
import { STATUS_META, STATUS_ORDER } from './orderStatus';

const R = 42;
const C = 2 * Math.PI * R;

export default function StatusDonut({ porEstado }: { porEstado: Record<OrderStatus, number> }) {
  const total = STATUS_ORDER.reduce((s, k) => s + (porEstado[k] ?? 0), 0);

  let offset = 0;
  const segments = STATUS_ORDER
    .filter(k => (porEstado[k] ?? 0) > 0)
    .map(k => {
      const value = porEstado[k];
      const len = (value / total) * C;
      const seg = { k, value, len, offset };
      offset += len;
      return seg;
    });

  return (
    <div className="px-6 py-5 flex flex-col sm:flex-row items-center gap-6">
      <div className="relative w-32 h-32 shrink-0">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          <circle cx="50" cy="50" r={R} fill="none" stroke="#f1ece3" strokeWidth="14" />
          {total > 0 && segments.map(s => (
            <circle
              key={s.k}
              cx="50" cy="50" r={R}
              fill="none"
              stroke={STATUS_META[s.k].hex}
              strokeWidth="14"
              strokeDasharray={`${s.len} ${C - s.len}`}
              strokeDashoffset={-s.offset}
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-semibold text-ink leading-none">{total}</span>
          <span className="text-[10px] text-stone-400 uppercase tracking-wider mt-1">Consultas</span>
        </div>
      </div>

      <ul className="flex-1 w-full space-y-2">
        {STATUS_ORDER.map(k => (
          <li key={k} className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: STATUS_META[k].hex }} />
              <span className="text-stone-600">{STATUS_META[k].label}</span>
            </span>
            <span className="text-ink font-medium tabular-nums">{porEstado[k] ?? 0}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
