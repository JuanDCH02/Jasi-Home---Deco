import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Plus, Minus, ShoppingBag, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { recordOrder } from '../api';
import { formatPrice, getProductPrices } from '../utils/pricing';
import { optimizeImageUrl } from '../utils/cloudinary';
import { usePageMeta } from '../hooks/usePageMeta';

export default function CartPage() {
  const { items, removeItem, updateQty, totalPrice, clearCart } = useCart();

  usePageMeta({
    title: 'Tu carrito',
    description: 'Revisá los muebles de tu carrito y hacé tu pedido por WhatsApp.',
    path: '/carrito',
    noIndex: true,
  });

  const buildWhatsAppMessage = () => {
    const lines = items.map(
      (i) =>
        `• ${i.product.name} x${i.quantity} — $${formatPrice(
          getProductPrices(i.product).discountedPrice * i.quantity
        )}`
    );
    const text = [
      'Hola! Me gustaría hacer el siguiente pedido:',
      '',
      ...lines,
      '',
      `Total estimado: $${formatPrice(totalPrice)}`,
    ].join('\n');
    return `https://wa.me/5491124050288?text=${encodeURIComponent(text)}`;
  };

  // Registra la consulta antes de abrir WhatsApp. Evita duplicar si se vuelve a
  // tocar el botón con el mismo carrito dentro de la misma sesión.
  const handleWhatsAppClick = () => {
    const signature = items
      .map((i) => `${i.product.id}x${i.quantity}`)
      .sort()
      .join('|');
    if (sessionStorage.getItem('jasihome-last-order') === signature) return;
    sessionStorage.setItem('jasihome-last-order', signature);
    recordOrder(items.map((i) => ({ productId: i.product.id, quantity: i.quantity })));
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-bone flex flex-col items-center justify-center pt-20 pb-20 px-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <ShoppingBag size={56} strokeWidth={1.25} className="text-stone-300 mx-auto mb-6" />
          <h1 className="text-3xl md:text-4xl font-display font-light text-ink tracking-tight mb-3">
            Tu carrito está vacío
          </h1>
          <p className="text-stone-500 mb-9 max-w-sm">
            Explorá nuestros muebles y encontrá el indicado para tu hogar.
          </p>
          <Link
            to="/productos"
            className="inline-block bg-ink text-bone px-9 py-3.5 rounded-full font-medium text-sm tracking-wide hover:bg-brass hover:text-ink transition-all duration-300"
          >
            Ver productos
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bone pt-32 pb-20">
      <div className="max-w-4xl mx-auto px-6">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="flex items-center justify-between mb-10"
        >
          <h1 className="text-4xl md:text-5xl font-display font-light text-ink tracking-tight">Tu Carrito</h1>
          <button
            onClick={clearCart}
            className="text-sm text-stone-400 hover:text-clay transition-colors duration-300 flex items-center gap-1.5"
          >
            <Trash2 size={14} />
            Vaciar carrito
          </button>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">

          {/* Items */}
          <div className="md:col-span-2 space-y-4">
            <AnimatePresence>
              {items.map((item) => {
                const imageUrl = item.product.images?.[0]?.url;
                const itemPrice = getProductPrices(item.product).discountedPrice;

                return (
                  <motion.div
                    key={item.product.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-stone-50 border border-stone-200 rounded-xl p-4 flex gap-4"
                  >
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-stone-100 shrink-0">
                      {imageUrl ? (
                        <img
                          src={optimizeImageUrl(imageUrl, 160)}
                          alt={item.product.name}
                          width={80}
                          height={80}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl">
                          🪑
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] text-brass uppercase tracking-[0.15em] mb-0.5">
                        {item.product.category?.name}
                      </p>
                      <h3 className="font-display text-ink text-base leading-snug line-clamp-2 mb-2">
                        {item.product.name}
                      </h3>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 bg-bone-deep rounded-full px-1 py-1">
                          <button
                            onClick={() => updateQty(item.product.id, item.quantity - 1)}
                            className="w-7 h-7 rounded-full bg-stone-50 flex items-center justify-center hover:bg-ink hover:text-bone transition-colors duration-300"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="text-sm font-medium w-6 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQty(item.product.id, item.quantity + 1)}
                            className="w-7 h-7 rounded-full bg-stone-50 flex items-center justify-center hover:bg-ink hover:text-bone transition-colors duration-300"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                        <span className="font-display text-ink text-base">
                          ${formatPrice(itemPrice * item.quantity)}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => removeItem(item.product.id)}
                      className="text-stone-300 hover:text-clay transition-colors duration-300 self-start mt-1"
                    >
                      <Trash2 size={16} />
                    </button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="md:col-span-1"
          >
            <div className="bg-stone-50 border border-stone-200 rounded-2xl p-6 sticky top-28">
              <h2 className="font-display text-ink text-xl mb-5">Resumen</h2>

              <div className="space-y-2.5 mb-5 text-sm text-stone-600">
                {items.map((i) => (
                  <div key={i.product.id} className="flex justify-between">
                    <span className="truncate max-w-35">
                      {i.product.name} ×{i.quantity}
                    </span>
                    <span className="font-medium text-ink">
                      ${formatPrice(
                        getProductPrices(i.product).discountedPrice * i.quantity
                      )}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-stone-200 pt-4 mb-6 flex justify-between items-baseline">
                <span className="font-medium text-ink">Total estimado</span>
                <span className="font-display text-2xl text-ink">
                  ${formatPrice(totalPrice)}
                </span>
              </div>

              <a
                href={buildWhatsAppMessage()}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleWhatsAppClick}
                className="w-full flex items-center justify-center gap-2 bg-[#2f7d5b] text-white py-3.5 rounded-lg font-medium text-sm tracking-wide hover:bg-[#27684c] transition-colors duration-300 mb-3"
              >
                <MessageCircle size={18} strokeWidth={1.75} />
                Pedir por WhatsApp
              </a>

              <Link
                to="/productos"
                className="w-full flex items-center justify-center text-sm text-stone-500 hover:text-ink transition-colors duration-300 py-2"
              >
                Seguir comprando
              </Link>

              <p className="text-xs text-stone-400 text-center mt-3 leading-relaxed">
                El precio final puede variar según disponibilidad. Te confirmamos antes de la entrega.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
