import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Menu, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { InstagramIcon, FacebookIcon, XIcon } from './SocialIcons';

export default function Navbar() {
  const location = useLocation();
  const { totalItems } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { to: '/productos', label: 'Productos' },
    { to: '/sobre-nosotros', label: 'Sobre Nosotros' },
    { to: '/contacto', label: 'Contacto' },
  ];

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + '/');

  const closeMenu = () => setMenuOpen(false);

  // Cierra el menú al cambiar de ruta
  useEffect(() => {
    closeMenu();
  }, [location.pathname]);

  // Bloquea el scroll cuando el menú está abierto
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50">
        <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

          {/* Logo */}
          <Link
            to="/"
            className="border border-white/25 rounded-full px-5 py-2 text-white font-display text-base tracking-tight backdrop-blur-md bg-black/50 hover:border-brass/60 transition-all duration-300"
          >
            Jasihome Deco
          </Link>

          {/* Desktop: nav links */}
          <div className="hidden md:flex items-center gap-1 backdrop-blur-md bg-black/50 border border-white/10 rounded-full px-2 py-1.5">
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`px-4 py-1.5 rounded-full text-[13px] font-medium tracking-wide transition-all duration-300 ${
                  isActive(to)
                    ? 'bg-brass text-white'
                    : 'text-white/75 hover:text-white hover:bg-white/10'
                }`}
              >
                {label}
              </Link>
            ))}

            <Link
              to="/carrito"
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[13px] font-medium tracking-wide transition-all duration-300 ${
                isActive('/carrito')
                  ? 'bg-brass text-white'
                  : 'text-white/75 hover:text-white hover:bg-white/10'
              }`}
            >
              <ShoppingCart size={15} strokeWidth={1.75} />
              Carrito
              <AnimatePresence>
                {totalItems > 0 && (
                  <motion.span
                    key={totalItems}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="text-xs font-semibold w-5 h-5 rounded-full flex items-center justify-center bg-brass text-ink"
                  >
                    {totalItems}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          </div>

          {/* Desktop: social icons */}
          <div className="hidden md:flex items-center gap-0.5 border border-white/15 rounded-full px-3 py-2 backdrop-blur-md bg-black/50">
            <a href="https://www.instagram.com/jasihomedeco/" target="_blank" rel="noopener noreferrer"
             className="text-white/55 hover:text-brass-soft transition-colors duration-300 p-1">
              <InstagramIcon size={17} />
            </a>
            <a href="https://www.facebook.com/profile.php?id=61578282431363&locale=es_LA" target="_blank" rel="noopener noreferrer"
             className="text-white/55 hover:text-brass-soft transition-colors duration-300 p-1">
              <FacebookIcon size={17} />
            </a>
          </div>

          {/* Mobile: carrito + hamburguesa */}
          <div className="flex md:hidden items-center gap-2">
            <Link
              to="/carrito"
              className="relative flex items-center gap-1.5 border border-white/25 rounded-full px-4 py-2 text-white text-[13px] font-medium backdrop-blur-md bg-black/50"
            >
              <ShoppingCart size={15} strokeWidth={1.75} />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-brass text-ink text-[10px] font-bold flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>

            <button
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="Abrir menú"
              className="border border-white/25 rounded-full p-2.5 text-white backdrop-blur-md bg-black/50 transition-all duration-300"
            >
              <AnimatePresence mode="wait" initial={false}>
                {menuOpen ? (
                  <motion.span key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.18 }}>
                    <X size={18} strokeWidth={1.75} />
                  </motion.span>
                ) : (
                  <motion.span key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.18 }}>
                    <Menu size={18} strokeWidth={1.75} />
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-40 flex flex-col backdrop-blur-2xl bg-black/85"
          >
            {/* Links */}
            <div className="flex flex-col items-center justify-center flex-1 gap-3 pt-20">
              {navLinks.map(({ to, label }, i) => (
                <motion.div
                  key={to}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 16 }}
                  transition={{ duration: 0.3, delay: i * 0.06 }}
                >
                  <Link
                    to={to}
                    className={`block text-4xl font-display font-light tracking-tight transition-colors duration-200 ${
                      isActive(to) ? 'text-brass' : 'text-white/80 hover:text-white'
                    }`}
                  >
                    {label}
                  </Link>
                </motion.div>
              ))}

              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 16 }}
                transition={{ duration: 0.3, delay: navLinks.length * 0.06 }}
              >
                <Link
                  to="/carrito"
                  className={`flex items-center gap-2 text-4xl font-display font-light tracking-tight transition-colors duration-200 ${
                    isActive('/carrito') ? 'text-brass' : 'text-white/80 hover:text-white'
                  }`}
                >
                  Carrito
                  {totalItems > 0 && (
                    <span className="text-base font-sans font-semibold w-7 h-7 rounded-full bg-brass text-ink flex items-center justify-center">
                      {totalItems}
                    </span>
                  )}
                </Link>
              </motion.div>
            </div>

            {/* Social icons bottom */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.25 }}
              className="flex justify-center gap-6 pb-12"
            >
              <a href="https://www.instagram.com/jasihomedeco/" target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-white transition-colors duration-300">
                <InstagramIcon size={22} />
              </a>
              <a href="https://www.facebook.com/jasihomedeco" target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-white transition-colors duration-300">
                <FacebookIcon size={22} />
              </a>
              <a href="https://www.tiktok.com/@jasihome?lang=en" target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-white transition-colors duration-300">
                <XIcon size={22} />
              </a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
