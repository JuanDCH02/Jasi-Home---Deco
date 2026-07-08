import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Hammer, Heart, MapPin } from 'lucide-react';
import heroImage from '../assets/foto-banner.png'
import Image2 from '../assets/abouUs-2.png'

function FadeUp({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

const values = [
  {
    icon: <Hammer size={22} strokeWidth={1.5} className="text-brass" />,
    title: 'Artesanía de calidad',
    desc: 'Trabajamos con pino y álamo seleccionados, garantizando durabilidad y belleza en cada pieza que fabricamos.',
  },
  {
    icon: <Heart size={22} strokeWidth={1.5} className="text-brass" />,
    title: 'Diseño personalizado',
    desc: 'Cada mueble se adapta a tu espacio y estilo. Trabajamos junto a vos desde el concepto hasta la entrega.',
  },
  {
    icon: <MapPin size={22} strokeWidth={1.5} className="text-brass" />,
    title: 'Raíces porteñas',
    desc: 'Somos un emprendimiento de Buenos Aires. Entregamos en Capital Federal, GBA y alrededores con cuidado y puntualidad.',
  },
];

export default function AboutPage() {
  return (
    <div className="bg-bone">

      {/* ── HERO BANNER ─────────────────────────────────────── */}
      <section className="relative h-80 md:h-[28rem] flex items-end overflow-hidden grain">
        <img
          src={heroImage}
          alt="Taller Jasihome"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
        <div className="relative z-10 max-w-4xl mx-auto px-6 pb-14 w-full">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-brass-soft text-xs font-medium uppercase tracking-[0.25em] mb-3"
          >
            Nuestra historia
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.6 }}
            className="text-bone font-display font-light text-5xl md:text-6xl tracking-tight"
          >
            Sobre Nosotros
          </motion.h1>
        </div>
      </section>

      {/* ── HISTORIA ────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-6 py-20">
        <div className="grid md:grid-cols-2 gap-14 items-center">
          <FadeUp>
            <p className="text-brass text-xs font-medium uppercase tracking-[0.25em] mb-4">
              Quiénes somos
            </p>
            <h2 className="text-3xl md:text-4xl font-display font-light text-ink tracking-tight leading-tight mb-6">
              Nacimos de la pasión por transformar espacios
            </h2>
            <p className="text-stone-600 leading-relaxed mb-4">
              Jasihome Deco es un emprendimiento familiar con sede en Buenos Aires, dedicado
              a la fabricación y venta de muebles y artículos de decoración interior. Cada
              pieza que hacemos lleva horas de trabajo, cuidado en los detalles y amor por
              el oficio.
            </p>
            <p className="text-stone-600 leading-relaxed">
              Nos especializamos en mesas ratonas, mesas de luz, racks de TV, bibliotecas,
              vinotecas y todo tipo de mobiliario hecho a medida. Trabajamos con maderas
              seleccionadas — principalmente pino y álamo — para ofrecer productos duraderos
              y con una estética cálida y natural que se adapta a cualquier hogar.
            </p>
          </FadeUp>
          <FadeUp delay={0.15}>
            <div className="aspect-square rounded-2xl overflow-hidden border border-stone-200">
              <img
                src={Image2}
                alt="Nuestro taller"
                className="w-full h-full object-cover"
              />
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── VALORES ─────────────────────────────────────────── */}
      <section className="bg-ink py-24 px-6 relative grain">
        <div className="max-w-5xl mx-auto relative z-10">
          <FadeUp>
            <div className="text-center mb-16">
              <p className="text-brass-soft text-xs font-medium uppercase tracking-[0.25em] mb-3">
                Lo que nos define
              </p>
              <h2 className="text-3xl md:text-4xl font-display font-light text-bone tracking-tight">
                Nuestros valores
              </h2>
            </div>
          </FadeUp>
          <div className="grid md:grid-cols-3 gap-10 md:gap-0 md:divide-x md:divide-white/10 text-center">
            {values.map((v, i) => (
              <FadeUp key={v.title} delay={i * 0.1}>
                <div className="flex flex-col items-center gap-4 md:px-8">
                  <div className="w-14 h-14 rounded-full border border-brass/30 bg-brass/5 flex items-center justify-center">
                    {v.icon}
                  </div>
                  <h3 className="text-bone font-display text-xl">{v.title}</h3>
                  <p className="text-white/45 text-sm leading-relaxed">{v.desc}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────── */}
      <section className="py-24 px-6 text-center bg-bone">
        <FadeUp>
          <h2 className="text-3xl md:text-4xl font-display font-light text-ink tracking-tight mb-5">
            ¿Querés saber más o pedir un presupuesto?
          </h2>
          <p className="text-stone-500 mb-9 max-w-md mx-auto leading-relaxed">
            Escribinos y te respondemos a la brevedad. Trabajamos con presupuesto personalizado
            para cada proyecto.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/contacto"
              className="bg-ink text-bone px-9 py-3.5 rounded-full font-medium text-sm tracking-wide hover:bg-brass hover:text-ink transition-all duration-300"
            >
              Contactanos
            </Link>
            <Link
              to="/productos"
              className="border border-ink/30 text-ink px-9 py-3.5 rounded-full font-medium text-sm tracking-wide hover:bg-ink hover:text-bone transition-all duration-300"
            >
              Ver productos
            </Link>
          </div>
        </FadeUp>
      </section>
    </div>
  );
}
