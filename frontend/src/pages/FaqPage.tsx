import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react'; 

interface FaqItem {
    question: string;
    answer: React.ReactNode;
}

const faqs: FaqItem[] = [
    {
        question: 'A tener en cuenta',
        answer: (
            <ul className="space-y-3 list-disc pl-5 marker:text-brass">
                <li>Nuestros productos son fabricados por nosotros mismos.</li>
                <li>Elegimos la madera de excelente calidad.</li>
                <li>
                    Tenemos productos en stock y también hacemos a pedido, siempre y
                    cuando vayan con el estilo y materiales que usamos.
                </li>
                <li>Controlamos los detalles para lograr la máxima prolijidad.</li>
                <li>La demora de entrega puede ser de 3 a 20 días continuos.</li>
            </ul>
        ),
    },
    {
        question: '¿Cuáles son las formas de pago?',
        answer: (
            <div className="space-y-3">
                <p>
                    Pagando en efectivo o con transferencia 25% OFF y con tarjetas de
                    crédito ( 3 cuotas sin interes).
                </p>
                <p>
                    Podés pagar contra entrega del producto, si estás en CABA, Gran
                    Buenos Aires o acercándote a nuestro taller.
                </p>
            </div>
        ),
    },
    {
        question: '¿Cuál es el costo de envío?',
        answer: (
            <>
                <p>
                    El envío se coodina una vez confirmada la compra, nos comunicamos por whatsapp y 
                    concretamos, tenemos nuestro propio servicio de envío, donde te garantizamos que tu producto
                    llegara en excelentes condiciones.
                </p>

                <p>
                    Si estas en el interior del país, podemos enviarlo por via cargo.
                </p>    
            
            </>
            
        ),
    },
    {
        question: '¿Cómo se realizan los envíos?',
        answer: (
            <div className="space-y-3">
                <p>
                    Para Capital y Gran Buenos Aires tenemos "Envío propio", pueden ser
                    despachados a partir de 48 hs luego de acreditado el pago.
                </p>
                <p>Se coordina por WhatsApp la franja horaria.</p>
            </div>
        ),
    },
    {
        question: '¿Cuánto tarda en llegar el pedido?',
        answer: (
            <div className="space-y-3">
                <p>
                    Si tenemos stock, en Capital y Gran Buenos Aires en general la
                    demora es de entre 3 y 7 días hábiles luego de acreditado el pago.
                </p>
                <p>Si hay que elaborarlo, de 15 a 20 días.</p>
            </div>
        ),
    },
];

function AccordionItem({
    item,
    isOpen,
    onToggle,
}: {
    item: FaqItem;
    isOpen: boolean;
    onToggle: () => void;
}) {
    return (
        <div className="border-b border-stone-200">
            <button
                onClick={onToggle}
                aria-expanded={isOpen}
                className="w-full flex items-center justify-between gap-4 py-6 text-left group"
            >
                <span
                    className={`font-display text-lg md:text-xl tracking-tight transition-colors duration-300 ${
                        isOpen ? 'text-brass' : 'text-ink group-hover:text-brass'
                    }`}
                >
                    {item.question}
                </span>
                <motion.span
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className={`shrink-0 w-9 h-9 rounded-full border flex items-center justify-center transition-colors duration-300 ${
                        isOpen
                            ? 'border-brass bg-brass/10 text-brass'
                            : 'border-stone-300 text-ink group-hover:border-brass group-hover:text-brass'
                    }`}
                >
                    <Plus size={18} strokeWidth={1.75} />
                </motion.span>
            </button>

            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                    >
                        <div className="pb-6 pr-12 text-stone-600 leading-relaxed">
                            {item.answer}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function FaqPage() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const handleToggle = (index: number) => {
        setOpenIndex((current) => (current === index ? null : index));
    };

    return (
        <div className="bg-bone min-h-screen">

            {/* ── HERO ────────────────────────────────────────────── */}
            <section className="relative pt-36 pb-16 px-6 bg-ink grain overflow-hidden">
                <div className="relative z-10 max-w-4xl mx-auto text-center">
                    <motion.p
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15, duration: 0.6 }}
                        className="text-brass-soft text-xs font-medium uppercase tracking-[0.25em] mb-3"
                    >
                        Estamos para ayudarte
                    </motion.p>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.6 }}
                        className="text-bone font-display font-light text-5xl md:text-6xl tracking-tight"
                    >
                        Preguntas frecuentes
                    </motion.h1>
                </div>
            </section>

            {/* ── ACORDEÓN ────────────────────────────────────────── */}
            <section className="max-w-3xl mx-auto px-6 py-16 md:py-20">
                <div className="divide-y-0">
                    {faqs.map((item, i) => (
                        <AccordionItem
                            key={item.question}
                            item={item}
                            isOpen={openIndex === i}
                            onToggle={() => handleToggle(i)}
                        />
                    ))}
                </div>
            </section>

            {/* ── CTA ─────────────────────────────────────────────── */}
            <section className="pb-24 px-6 text-center">
                <h2 className="text-2xl md:text-3xl font-display font-light text-ink tracking-tight mb-4">
                    ¿Tenés otra duda?
                </h2>
                <p className="text-stone-500 mb-8 max-w-md mx-auto leading-relaxed">
                    Escribinos y te respondemos a la brevedad.
                </p>
                <Link
                    to="/contacto"
                    className="inline-block bg-ink text-bone px-9 py-3.5 rounded-full font-medium text-sm tracking-wide hover:bg-brass hover:text-ink transition-all duration-300"
                >
                    Contactanos
                </Link>
            </section>
        </div>
    );
}
