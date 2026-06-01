import type { OrderStatus } from '../../types';

interface StatusMeta {
  label: string;
  hex: string;      // para gráficos SVG
  badge: string;    // clases tailwind para badges
}

export const STATUS_META: Record<OrderStatus, StatusMeta> = {
  PENDING:   { label: 'Pendiente', hex: '#c4a06a', badge: 'bg-amber-50 text-amber-700' },
  PAID:      { label: 'Confirmada', hex: '#0ea5e9', badge: 'bg-sky-50 text-sky-700' },
  SHIPPED:   { label: 'Enviada',   hex: '#8b5cf6', badge: 'bg-violet-50 text-violet-700' },
  DELIVERED: { label: 'Entregada', hex: '#2f7d5b', badge: 'bg-emerald-50 text-emerald-700' },
  CANCELLED: { label: 'Cancelada', hex: '#b5654a', badge: 'bg-clay/10 text-clay' },
};

export const STATUS_ORDER: OrderStatus[] = ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

export const formatMoney = (n: number) =>
  '$' + n.toLocaleString('es-AR', { maximumFractionDigits: 0 });
