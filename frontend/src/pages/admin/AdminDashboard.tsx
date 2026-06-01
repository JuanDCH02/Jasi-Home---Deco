import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag, TrendingUp, Wallet, Clock, ArrowRight, ArrowUpRight, ArrowDownRight,
  AlertTriangle, Package, Tag, EyeOff,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { adminGetDashboardStats } from '../../api';
import type { DashboardStats } from '../../types';
import BarList from '../../components/admin/BarList';
import TrendChart from '../../components/admin/TrendChart';
import StatusDonut from '../../components/admin/StatusDonut';
import { formatMoney } from '../../components/admin/orderStatus';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  color: string;
  to?: string;
  children?: React.ReactNode;
}

function StatCard({ icon, label, value, color, to, children }: StatCardProps) {
  const inner = (
    <div className="bg-white rounded-xl border border-stone-100 p-5 h-full hover:border-stone-200 transition-colors">
      <div className="flex items-center gap-4">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-2xl font-semibold text-ink leading-tight">{value}</p>
          <p className="text-sm text-stone-500 line-clamp-1">{label}</p>
        </div>
      </div>
      {children && <div className="mt-3">{children}</div>}
    </div>
  );
  return to ? <Link to={to} className="block">{inner}</Link> : inner;
}

// Sección con encabezado reutilizable para los paneles del dashboard.
function Panel({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-stone-100">
      <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
        <h2 className="font-medium text-ink text-sm">{title}</h2>
        {action}
      </div>
      {children}
    </div>
  );
}

export default function AdminDashboard() {
  const { token } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    adminGetDashboardStats(token)
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  if (loading || !stats) {
    return (
      <div className="p-8 space-y-4">
        <div className="h-8 w-48 bg-stone-200 rounded-lg animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-stone-200 rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="h-48 bg-stone-200 rounded-xl animate-pulse" />
      </div>
    );
  }

  const { kpis, porEstado } = stats;
  const delta = kpis.consultasMesPrev > 0
    ? Math.round(((kpis.consultasMes - kpis.consultasMesPrev) / kpis.consultasMesPrev) * 100)
    : kpis.consultasMes > 0 ? 100 : 0;

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-light text-ink">Dashboard</h1>
        <p className="text-stone-400 text-sm mt-0.5">Consultas de compra y rendimiento del catálogo</p>
      </div>
      
      {/* Resumen de catálogo */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Package size={20} strokeWidth={1.75} className="text-ink" />}
          label="Productos activos"
          value={stats.productosActivos}
          color="bg-stone-100"
        />
        <StatCard
          icon={<AlertTriangle size={20} strokeWidth={1.75} className="text-amber-500" />}
          label="Stock bajo (≤ 3)"
          value={stats.stockBajo}
          color="bg-amber-50"
        />
        <StatCard
          icon={<EyeOff size={20} strokeWidth={1.75} className="text-stone-400" />}
          label="Inactivos"
          value={stats.productosInactivos}
          color="bg-stone-100"
        />
        <StatCard
          icon={<Tag size={20} strokeWidth={1.75} className="text-brass" />}
          label="Categorías"
          value={stats.totalCategorias}
          color="bg-stone-100"
        />
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<ShoppingBag size={20} strokeWidth={1.75} className="text-ink" />}
          label="Consultas totales"
          value={kpis.totalConsultas}
          color="bg-stone-100"
        >
          <p className="text-xs flex items-center gap-1">
            <span className={delta >= 0 ? 'text-emerald-600' : 'text-clay'}>
              {delta >= 0 ? <ArrowUpRight size={13} className="inline" /> : <ArrowDownRight size={13} className="inline" />}
              {Math.abs(delta)}%
            </span>
            <span className="text-stone-400">· {kpis.consultasMes} este mes</span>
          </p>
        </StatCard>

        <StatCard
          icon={<TrendingUp size={20} strokeWidth={1.75} className="text-emerald-600" />}
          label="Ingresos confirmados"
          value={formatMoney(kpis.ingresosConfirmados)}
          color="bg-emerald-50"
        >
          <p className="text-xs text-stone-400">Ticket prom. {formatMoney(kpis.ticketPromedio)}</p>
        </StatCard>

        <StatCard
          icon={<Wallet size={20} strokeWidth={1.75} className="text-brass" />}
          label="Estimado total"
          value={formatMoney(kpis.ingresosEstimados)}
          color="bg-stone-100"
        >
          <p className="text-xs text-stone-400">Incluye consultas pendientes</p>
        </StatCard>

        <StatCard
          icon={<Clock size={20} strokeWidth={1.75} className="text-amber-500" />}
          label="Pendientes de gestión"
          value={porEstado.PENDING}
          color="bg-amber-50"
          to="/admin/consultas?status=PENDING"
        >
          <p className="text-xs text-brass flex items-center gap-1">Gestionar <ArrowRight size={12} /></p>
        </StatCard>
      </div>

      {/* Tendencia */}
      <Panel
        title="Consultas — últimos 30 días"
        action={<span className="text-xs text-stone-400">{kpis.consultasMes} este mes</span>}
      >
        <TrendChart data={stats.consultasPorDia} />
      </Panel>

      {/* Top productos + Ingresos por categoría */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Panel
          title="Productos más consultados"
          action={<Link to="/admin/productos" className="text-xs text-brass hover:underline flex items-center gap-1">Productos <ArrowRight size={12} /></Link>}
        >
          <BarList
            items={stats.topProductos.map(p => ({
              label: p.name,
              value: p.cantidad,
              display: `${p.cantidad} u.`,
              image: p.image,
            }))}
            color="#a98046"
          />
        </Panel>

        <Panel title="Ingresos por categoría">
          <BarList
            items={stats.ingresosPorCategoria.map(c => ({
              label: c.name,
              value: c.ingresos,
              display: formatMoney(c.ingresos),
            }))}
            color="#2f7d5b"
          />
        </Panel>
      </div>

      {/* Estado + Stock bajo */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Panel
          title="Consultas por estado"
          action={<Link to="/admin/consultas" className="text-xs text-brass hover:underline flex items-center gap-1">Ver todas <ArrowRight size={12} /></Link>}
        >
          <StatusDonut porEstado={porEstado} />
        </Panel>

        <Panel
          title="Stock bajo"
          action={<Link to="/admin/productos" className="text-xs text-brass hover:underline flex items-center gap-1">Ver todos <ArrowRight size={12} /></Link>}
        >
          {stats.stockBajoLista.length === 0 ? (
            <p className="text-stone-400 text-sm px-6 py-8 text-center">Sin productos con stock bajo.</p>
          ) : (
            <ul className="divide-y divide-stone-50">
              {stats.stockBajoLista.map(p => (
                <li key={p.id} className="px-6 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {p.image
                      ? <img src={p.image} alt={p.name} className="w-9 h-9 rounded-lg object-cover bg-stone-100" />
                      : <div className="w-9 h-9 rounded-lg bg-stone-100" />}
                    <span className="text-sm text-ink font-medium line-clamp-1">{p.name}</span>
                  </div>
                  <span className={`text-sm font-semibold ${p.stock === 0 ? 'text-red-500' : 'text-amber-500'}`}>
                    {p.stock === 0 ? 'Sin stock' : `${p.stock} unid.`}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      
    </div>
  );
}
