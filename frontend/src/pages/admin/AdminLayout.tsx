import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, Tag, LogOut, ClipboardList } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const links = [
  { to: '/admin',           label: 'Dashboard',   icon: LayoutDashboard, end: true },
  { to: '/admin/consultas', label: 'Consultas',    icon: ClipboardList },
  { to: '/admin/productos', label: 'Productos',    icon: Package },
  { to: '/admin/categorias',label: 'Categorías',   icon: Tag },
];

export default function AdminLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="flex h-screen bg-stone-100 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 bg-ink flex flex-col">
        {/* Brand */}
        <div className="px-5 py-6 border-b border-white/10">
          <span className="font-display text-lg text-bone tracking-tight">Jasihome</span>
          <span className="block text-[11px] text-white/35 uppercase tracking-[0.18em] mt-0.5">Admin</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-white/10 text-brass'
                    : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                }`
              }
            >
              <Icon size={17} strokeWidth={1.75} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-white/40 hover:text-white/70 hover:bg-white/5 transition-all duration-200"
          >
            <LogOut size={17} strokeWidth={1.75} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
