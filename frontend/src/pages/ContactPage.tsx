import { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Send, MessageCircle, MapPin, Clock } from 'lucide-react';
import { sendContact } from '../api';
import { usePageMeta } from '../hooks/usePageMeta';

function FadeUp({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

type Status = 'idle' | 'loading' | 'success' | 'error';

const BRASS = '#b5922a';
const STONE = '#78716c';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [status, setStatus] = useState<Status>('idle');
  const [focused, setFocused] = useState<string | null>(null);

  usePageMeta({
    title: 'Contacto y presupuestos a medida',
    description:
      'Pedí presupuesto para tu mueble a medida por WhatsApp o formulario. Lunes a sábado de 9 a 19 h. Envíos a CABA y GBA.',
    path: '/contacto',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      await sendContact(form);
      setStatus('success');
      setForm({ name: '', email: '', phone: '', message: '' });
    } catch {
      setStatus('error');
    }
  };

  const whatsappUrl = `https://wa.me/5491124050288?text=${encodeURIComponent('Hola! Me gustaría consultar sobre sus productos.')}`;

  const inputClass =
    'w-full bg-bone border border-stone-200 rounded-lg px-4 py-3 text-sm text-ink placeholder-stone-400 outline-none focus:border-brass focus:ring-2 focus:ring-brass/15 transition-all';

  const AnimLabel = ({ name, children }: { name: string; children: React.ReactNode }) => (
    <motion.label
      htmlFor={name}
      animate={focused === name ? { color: BRASS, x: 3 } : { color: STONE, x: 0 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className="text-[11px] font-medium uppercase tracking-[0.18em] block mb-1.5 origin-left"
    >
      {children}
    </motion.label>
  );

  return (
    <div className="min-h-screen bg-bone pt-32 pb-20">
      <div className="max-w-6xl mx-auto px-6">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <p className="text-brass text-xs font-medium uppercase tracking-[0.25em] mb-3">
            Estamos para ayudarte
          </p>
          <h1 className="text-5xl md:text-6xl font-display font-light text-ink tracking-tight">Contacto</h1>
          <p className="text-stone-500 mt-4 max-w-md mx-auto leading-relaxed">
            Consultanos sobre productos, precios, medidas a medida o cualquier duda. Te respondemos a la brevedad.
          </p>
        </motion.div>

        {/* Grid: info 1/3 · form 2/3 */}
        <div className="grid md:grid-cols-3 gap-10 items-start">

          {/* Info lateral */}
          <div className="space-y-6">
            <FadeUp>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 bg-[#2f7d5b] text-white p-5 rounded-xl hover:bg-[#27684c] transition-colors duration-300"
              >
                <MessageCircle size={26} strokeWidth={1.75} className="shrink-0" />
                <div>
                  <p className="font-display text-lg">WhatsApp</p>
                  <p className="text-white/70 text-sm">Respuesta rápida</p>
                </div>
              </a>
            </FadeUp>

            <FadeUp delay={0.1}>
              <div className="bg-stone-50 border border-stone-200 rounded-xl p-6 space-y-5">
                <div className="flex items-start gap-3 text-sm text-stone-600">
                  <MapPin size={18} strokeWidth={1.75} className="text-brass mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-ink">Zona de entrega</p>
                    <p>Capital Federal, GBA y alrededores</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 text-sm text-stone-600">
                  <Clock size={18} strokeWidth={1.75} className="text-brass mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-ink">Horario de atención</p>
                    <p>Lunes a Sábado, 9 a 19 hs</p>
                  </div>
                </div>
              </div>
            </FadeUp>
          </div>

          {/* Form — col-span fuera del FadeUp para que el grid lo respete */}
          <div className="md:col-span-2">
            <FadeUp delay={0.05}>
              <div className="bg-stone-50 border border-stone-200 rounded-2xl p-10">
                {status === 'success' ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-12"
                  >
                    <p className="text-4xl mb-4">✅</p>
                    <h3 className="text-2xl font-display text-ink mb-2">¡Mensaje enviado!</h3>
                    <p className="text-stone-500 text-sm">Te contactamos a la brevedad.</p>
                    <button
                      onClick={() => setStatus('idle')}
                      className="mt-6 text-sm text-brass hover:underline"
                    >
                      Enviar otro mensaje
                    </button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-2 gap-5">
                      <div className="col-span-2 md:col-span-1">
                        <AnimLabel name="name">Nombre</AnimLabel>
                        <input
                          id="name"
                          name="name"
                          value={form.name}
                          onChange={handleChange}
                          onFocus={() => setFocused('name')}
                          onBlur={() => setFocused(null)}
                          required
                          placeholder="Tu nombre"
                          className={inputClass}
                        />
                      </div>
                      <div className="col-span-2 md:col-span-1">
                        <AnimLabel name="phone">Teléfono (opcional)</AnimLabel>
                        <input
                          id="phone"
                          name="phone"
                          value={form.phone}
                          onChange={handleChange}
                          onFocus={() => setFocused('phone')}
                          onBlur={() => setFocused(null)}
                          placeholder="+54 9 11..."
                          className={inputClass}
                        />
                      </div>
                    </div>

                    <div>
                      <AnimLabel name="email">Email</AnimLabel>
                      <input
                        id="email"
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        onFocus={() => setFocused('email')}
                        onBlur={() => setFocused(null)}
                        required
                        placeholder="tu@email.com"
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <AnimLabel name="message">Mensaje</AnimLabel>
                      <textarea
                        id="message"
                        name="message"
                        value={form.message}
                        onChange={handleChange}
                        onFocus={() => setFocused('message')}
                        onBlur={() => setFocused(null)}
                        required
                        rows={6}
                        placeholder="Contanos en qué podemos ayudarte..."
                        className={`${inputClass} resize-none`}
                      />
                    </div>

                    {status === 'error' && (
                      <p className="text-red-500 text-sm">
                        Hubo un error al enviar. Intentá de nuevo o escribinos por WhatsApp.
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={status === 'loading'}
                      className="w-full flex items-center justify-center gap-2 bg-ink text-bone py-3.5 rounded-lg font-medium text-sm tracking-wide hover:bg-brass hover:text-ink transition-all duration-300 disabled:opacity-60"
                    >
                      {status === 'loading' ? (
                        <span className="animate-spin w-4 h-4 border-2 border-bone/30 border-t-bone rounded-full" />
                      ) : (
                        <>
                          <Send size={16} strokeWidth={1.75} />
                          Enviar mensaje
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </FadeUp>
          </div>
        </div>
      </div>
    </div>
  );
}
