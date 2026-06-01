import { useEffect, useState, useCallback, Fragment } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ChevronDown, ChevronRight, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { adminGetOrders, adminUpdateOrderStatus } from '../../api';
import type { Order, OrderStatus } from '../../types';
import { STATUS_META, STATUS_ORDER, formatMoney } from '../../components/admin/orderStatus';

const FILTERS: { value: 'all' | OrderStatus; label: string }[] = [
  { value: 'all', label: 'Todas' },
  ...STATUS_ORDER.map(s => ({ value: s, label: STATUS_META[s].label })),
];

function StatusSelect({ value, onChange, saving }: { value: OrderStatus; onChange: (s: OrderStatus) => void; saving: boolean }) {
  const meta = STATUS_META[value];
  return (
    <div className="relative inline-flex items-center">
      <span className={`pointer-events-none absolute left-2 w-2 h-2 rounded-full`} style={{ backgroundColor: meta.hex }} />
      <select
        value={value}
        disabled={saving}
        onChange={e => onChange(e.target.value as OrderStatus)}
        onClick={e => e.stopPropagation()}
        className={`appearance-none pl-6 pr-7 py-1.5 rounded-full text-xs font-medium cursor-pointer outline-none border-0 ${meta.badge} disabled:opacity-50`}
      >
        {STATUS_ORDER.map(s => (
          <option key={s} value={s}>{STATUS_META[s].label}</option>
        ))}
      </select>
      {saving
        ? <Loader2 size={12} className="absolute right-2 animate-spin text-stone-400 pointer-events-none" />
        : <ChevronDown size={12} className="absolute right-2 text-stone-400 pointer-events-none" />}
    </div>
  );
}

export default function AdminOrdersPage() {
  const { token } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const filter = (searchParams.get('status') as 'all' | OrderStatus) ?? 'all';

  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);

  const fetchOrders = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const d = await adminGetOrders(token, {
        status: filter === 'all' ? undefined : filter,
        page,
      });
      setOrders(d.orders ?? []);
      setTotal(d.total ?? 0);
      setPages(d.pages ?? 1);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [token, filter, page]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const setFilter = (value: 'all' | OrderStatus) => {
    setPage(1);
    setSearchParams(value === 'all' ? {} : { status: value });
  };

  const handleStatusChange = async (order: Order, status: OrderStatus) => {
    setSavingId(order.id);
    try {
      await adminUpdateOrderStatus(token!, order.id, status);
      // Si hay filtro activo y el nuevo estado ya no coincide, lo quitamos de la vista.
      if (filter !== 'all' && status !== filter) {
        setOrders(prev => prev.filter(o => o.id !== order.id));
        setTotal(t => Math.max(0, t - 1));
      } else {
        setOrders(prev => prev.map(o => (o.id === order.id ? { ...o, status } : o)));
      }
    } finally {
      setSavingId(null);
    }
  };

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

  const itemsSummary = (o: Order) => {
    const totalUnits = o.items.reduce((s, i) => s + i.quantity, 0);
    const first = o.items[0]?.product?.name ?? 'Producto';
    const rest = o.items.length - 1;
    return `${totalUnits} u. · ${first}${rest > 0 ? ` +${rest}` : ''}`;
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-light text-ink">Consultas</h1>
        <p className="text-stone-400 text-sm mt-0.5">{total} consulta{total === 1 ? '' : 's'} de compra por WhatsApp</p>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2">
        {FILTERS.map(f => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === f.value
                ? 'bg-ink text-bone'
                : 'bg-white border border-stone-200 text-stone-500 hover:text-ink'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl border border-stone-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-100 text-left">
                <th className="px-4 py-3 text-[11px] font-medium text-stone-400 uppercase tracking-[0.12em] w-10"></th>
                <th className="px-4 py-3 text-[11px] font-medium text-stone-400 uppercase tracking-[0.12em]">Consulta</th>
                <th className="px-4 py-3 text-[11px] font-medium text-stone-400 uppercase tracking-[0.12em]">Fecha</th>
                <th className="px-4 py-3 text-[11px] font-medium text-stone-400 uppercase tracking-[0.12em]">Productos</th>
                <th className="px-4 py-3 text-[11px] font-medium text-stone-400 uppercase tracking-[0.12em] text-right">Total est.</th>
                <th className="px-4 py-3 text-[11px] font-medium text-stone-400 uppercase tracking-[0.12em] text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(6)].map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-4 bg-stone-100 rounded animate-pulse" /></td>
                    ))}
                  </tr>
                ))
              ) : orders.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-stone-400">No hay consultas{filter !== 'all' ? ' con este estado' : ''}.</td></tr>
              ) : (
                orders.map(o => (
                  <Fragment key={o.id}>
                    <tr
                      onClick={() => setExpanded(expanded === o.id ? null : o.id)}
                      className="hover:bg-stone-50/50 transition-colors cursor-pointer"
                    >
                      <td className="px-4 py-3 text-stone-300">
                        {expanded === o.id ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      </td>
                      <td className="px-4 py-3 font-medium text-ink">#{o.id}</td>
                      <td className="px-4 py-3 text-stone-500">{fmtDate(o.createdAt)}</td>
                      <td className="px-4 py-3 text-stone-600 max-w-[240px]"><span className="line-clamp-1">{itemsSummary(o)}</span></td>
                      <td className="px-4 py-3 text-right font-medium text-ink">{formatMoney(Number(o.total))}</td>
                      <td className="px-4 py-3 text-center">
                        <StatusSelect value={o.status} saving={savingId === o.id} onChange={s => handleStatusChange(o, s)} />
                      </td>
                    </tr>
                    {expanded === o.id && (
                      <tr className="bg-stone-50/40">
                        <td />
                        <td colSpan={5} className="px-4 py-3">
                          <ul className="space-y-1.5">
                            {o.items.map(it => (
                              <li key={it.id} className="flex items-center justify-between text-sm">
                                <span className="flex items-center gap-2.5">
                                  {it.product?.images?.[0]?.url
                                    ? <img src={it.product.images[0].url} alt="" className="w-7 h-7 rounded-md object-cover bg-stone-100" />
                                    : <div className="w-7 h-7 rounded-md bg-stone-100" />}
                                  <span className="text-ink">{it.product?.name ?? `Producto #${it.productId}`}</span>
                                  <span className="text-stone-400">× {it.quantity}</span>
                                </span>
                                <span className="text-stone-600 tabular-nums">{formatMoney(Number(it.unitPrice) * it.quantity)}</span>
                              </li>
                            ))}
                          </ul>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Paginación */}
      {pages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-stone-400">Página {page} de {pages}</span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-1.5 rounded-lg border border-stone-200 text-stone-600 disabled:opacity-40 hover:bg-stone-50"
            >Anterior</button>
            <button
              onClick={() => setPage(p => Math.min(pages, p + 1))}
              disabled={page >= pages}
              className="px-3 py-1.5 rounded-lg border border-stone-200 text-stone-600 disabled:opacity-40 hover:bg-stone-50"
            >Siguiente</button>
          </div>
        </div>
      )}
    </div>
  );
}
