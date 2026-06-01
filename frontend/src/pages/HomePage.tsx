import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronLeft, ChevronRight, Star, Package, Truck } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { getProducts } from '../api';
import type { Product } from '../types';
import heroImage from '../assets/hero-foto.png';

function FadeUp({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

const features = [
  {
    icon: <Star size={22} strokeWidth={1.5} className="text-brass" />,
    title: 'Productos Cuidados',
    desc: 'Cada pieza es inspeccionada para garantizar la máxima calidad',
  },
  {
    icon: <Package size={22} strokeWidth={1.5} className="text-brass" />,
    title: 'Hechos a Medida',
    desc: 'Personalizamos cada mueble según tus necesidades y espacio',
  },
  {
    icon: <Truck size={22} strokeWidth={1.5} className="text-brass" />,
    title: 'Envíos a BS AS',
    desc: 'Entregamos en Capital Federal, GBA y alrededores',
  },
];

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [carouselIdx, setCarouselIdx] = useState(0);
  const cardsPerPage = 3;

  useEffect(() => {
    getProducts({ limit: 9 })
      .then((data) => setProducts(data.products ?? []))
      .catch(() => setProducts([]));
  }, []);

  const pages = Math.ceil(products.length / cardsPerPage);
  const visibleProducts = products.slice(
    carouselIdx * cardsPerPage,
    carouselIdx * cardsPerPage + cardsPerPage
  );

  const prev = () => setCarouselIdx((i) => Math.max(0, i - 1));
  const next = () => setCarouselIdx((i) => Math.min(pages - 1, i + 1));

  return (
    <div>
      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden grain">
        <img
          src={heroImage}
          alt="Jasihome Deco"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/55 via-ink/35 to-ink/60" />

        <div className="relative z-10 flex flex-col items-center px-6">
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7 }}
            className="text-brass-soft text-xs md:text-sm font-medium uppercase tracking-[0.35em] mb-6"
          >
            Muebles a medida · Buenos Aires
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="text-bone font-display font-light text-6xl md:text-8xl lg:text-9xl text-center leading-[0.95] tracking-tight"
          >
            Jasihome Deco
          </motion.h1>

          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="rule-draw mt-8 h-px w-32 bg-brass-soft/70"
          />
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3, duration: 0.6 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10"
        >
          <ChevronDown size={26} strokeWidth={1.5} className="text-bone/80 bounce-arrow" />
        </motion.div>
      </section>

      {/* ── FEATURES STRIP ───────────────────────────────────── */}
      <section className="bg-ink py-16 relative grain">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-0 md:divide-x md:divide-white/10 text-center relative z-10">
          {features.map((f, i) => (
            <FadeUp key={f.title} delay={i * 0.1}>
              <div className="flex flex-col items-center gap-4 md:px-8">
                <div className="w-12 h-12 rounded-full border border-brass/30 bg-brass/5 flex items-center justify-center">
                  {f.icon}
                </div>
                <h3 className="text-bone font-display text-xl">{f.title}</h3>
                <p className="text-white/45 text-sm leading-relaxed">{f.desc}</p>
              </div>
            </FadeUp>
          ))}
        </div>
      </section>

      {/* ── PRODUCTOS DESTACADOS ─────────────────────────────── */}
      <section className="py-24 px-6 bg-bone">
        <div className="max-w-6xl mx-auto">
          <FadeUp>
            <div className="text-center mb-14">
              <p className="text-brass text-xs font-medium uppercase tracking-[0.25em] mb-3">
                Colección
              </p>
              <h2 className="text-4xl md:text-5xl font-display font-light text-ink tracking-tight">
                Nuestros Productos
              </h2>
              <p className="text-stone-500 mt-3 text-base">
                Muebles de calidad para cada rincón de tu hogar
              </p>
            </div>
          </FadeUp>

          {products.length > 0 ? (
            <>
              <div className="relative">
                {carouselIdx > 0 && (
                  <button
                    onClick={prev}
                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-5 z-10 w-11 h-11 rounded-full bg-stone-50 border border-stone-200 shadow-sm flex items-center justify-center hover:bg-ink hover:text-bone hover:border-ink transition-colors duration-300"
                  >
                    <ChevronLeft size={20} strokeWidth={1.75} />
                  </button>
                )}
                {carouselIdx < pages - 1 && (
                  <button
                    onClick={next}
                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-5 z-10 w-11 h-11 rounded-full bg-stone-50 border border-stone-200 shadow-sm flex items-center justify-center hover:bg-ink hover:text-bone hover:border-ink transition-colors duration-300"
                  >
                    <ChevronRight size={20} strokeWidth={1.75} />
                  </button>
                )}

                <AnimatePresence mode="wait">
                  <motion.div
                    key={carouselIdx}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6"
                  >
                    {visibleProducts.map((p, i) => (
                      <ProductCard key={p.id} product={p} index={i} />
                    ))}
                  </motion.div>
                </AnimatePresence>
              </div>

              {pages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  {Array.from({ length: pages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCarouselIdx(i)}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        i === carouselIdx ? 'bg-brass w-7' : 'bg-stone-300 w-1.5'
                      }`}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="aspect-4/5 bg-stone-200 rounded-xl animate-pulse" />
              ))}
            </div>
          )}

          <FadeUp delay={0.2}>
            <div className="text-center mt-14">
              <Link
                to="/productos"
                className="inline-block border border-ink/30 text-ink px-9 py-3.5 rounded-full font-medium text-sm tracking-wide hover:bg-ink hover:text-bone hover:border-ink transition-all duration-300"
              >
                Ver todos los productos
              </Link>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── CTA PERSONALIZACIÓN ──────────────────────────────── */}
      <section className="bg-espresso py-24 px-6 text-center relative grain">
        <div className="relative z-10">
          <FadeUp>
            <p className="text-brass-soft text-xs font-medium uppercase tracking-[0.25em] mb-5">
              Hecho a medida
            </p>
            <h2 className="text-bone font-display font-light text-4xl md:text-5xl tracking-tight leading-[1.1] max-w-2xl mx-auto">
              ¿Tenés un espacio único?<br />Creamos el mueble ideal para vos.
            </h2>
            <p className="text-white/50 mt-6 text-base max-w-lg mx-auto leading-relaxed">
              Desde una mesa ratona hasta un rack de TV o vinoteca, diseñamos y fabricamos
              cada pieza adaptada a tus dimensiones y estilo.
            </p>
            <Link
              to="/contacto"
              className="inline-block mt-9 bg-brass text-ink px-9 py-3.5 rounded-full font-medium text-sm tracking-wide hover:bg-brass-soft transition-all duration-300"
            >
              Consultanos
            </Link>
          </FadeUp>
        </div>
      </section>
    </div>
  );
}
