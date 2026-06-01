import { Link } from 'react-router-dom';
import { MapPin, Phone } from 'lucide-react';
import { InstagramIcon, FacebookIcon, XIcon } from './SocialIcons';

export default function Footer() {
  return (
    <footer className="bg-ink text-white/65">
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-3 gap-12 md:divide-x md:divide-white/10">

        <div className="md:pr-10">
          <span className="text-white font-display text-2xl tracking-tight">Jasihome Deco</span>
          <p className="mt-4 text-sm leading-relaxed text-white/45">
            Muebles y decoración de interior hechos con pasión, diseñados para transformar
            cada rincón de tu hogar.
          </p>
          <div className="flex gap-4 mt-6">
            <a href="#" className="text-white/55 hover:text-brass-soft transition-colors duration-300"><InstagramIcon size={18} /></a>
            <a href="#" className="text-white/55 hover:text-brass-soft transition-colors duration-300"><FacebookIcon size={18} /></a>
            <a href="#" className="text-white/55 hover:text-brass-soft transition-colors duration-300"><XIcon size={18} /></a>
          </div>
        </div>

        <div className="md:px-10">
          <p className="text-brass-soft font-medium text-xs uppercase tracking-[0.2em] mb-5">Navegación</p>
          <ul className="space-y-2.5 text-sm">
            {[
              { to: '/productos', label: 'Productos' },
              { to: '/sobre-nosotros', label: 'Sobre Nosotros' },
              { to: '/contacto', label: 'Contacto' },
              { to: '/carrito', label: 'Carrito' },
            ].map(({ to, label }) => (
              <li key={to}>
                <Link to={to} className="hover:text-white transition-colors duration-300">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:pl-10">
          <p className="text-brass-soft font-medium text-xs uppercase tracking-[0.2em] mb-5">Contacto</p>
          <ul className="space-y-3.5 text-sm">
            <li className="flex items-start gap-2.5">
              <MapPin size={16} strokeWidth={1.75} className="mt-0.5 shrink-0 text-brass" />
              <span>Buenos Aires, Argentina<br />Capital Federal, GBA y alrededores</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Phone size={16} strokeWidth={1.75} className="shrink-0 text-brass" />
              <span>+54 9 11 XXXX-XXXX</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 py-6 text-center text-xs tracking-wide text-white/30">
        © {new Date().getFullYear()} Jasihome Deco. Todos los derechos reservados.
      </div>
    </footer>
  );
}
