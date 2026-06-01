interface BarItem {
  label: string;
  value: number;
  /** Texto que se muestra a la derecha (por defecto, value formateado). */
  display?: string;
  /** Miniatura opcional a la izquierda del label. */
  image?: string | null;
}

interface BarListProps {
  items: BarItem[];
  /** Color de relleno de la barra (hex o clase). Por defecto, brass. */
  color?: string;
  emptyLabel?: string;
}

export default function BarList({ items, color = '#a98046', emptyLabel = 'Sin datos todavía.' }: BarListProps) {
  if (items.length === 0) {
    return <p className="text-stone-400 text-sm px-6 py-8 text-center">{emptyLabel}</p>;
  }

  const max = Math.max(...items.map(i => i.value), 1);

  return (
    <ul className="px-6 py-4 space-y-3.5">
      {items.map((item, idx) => (
        <li key={idx} className="space-y-1.5">
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="flex items-center gap-2.5 min-w-0">
              {item.image !== undefined && (
                item.image
                  ? <img src={item.image} alt="" className="w-6 h-6 rounded-md object-cover bg-stone-100 shrink-0" />
                  : <div className="w-6 h-6 rounded-md bg-stone-100 shrink-0" />
              )}
              <span className="text-ink line-clamp-1">{item.label}</span>
            </span>
            <span className="text-stone-500 font-medium shrink-0 tabular-nums">
              {item.display ?? item.value.toLocaleString('es-AR')}
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-stone-100 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${(item.value / max) * 100}%`, backgroundColor: color }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
