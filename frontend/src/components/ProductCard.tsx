import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import type { Product } from '../types';
import { useCart } from '../context/CartContext';
import { formatPrice, getProductPrices } from '../utils/pricing';
import { optimizeImageUrl } from '../utils/cloudinary';

interface ProductCardProps {
  product: Product;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { addItem } = useCart();

  const imageUrl = product.images?.[0]?.url;
  const { discountedPrice } = getProductPrices(product);

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.94 }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className="group relative bg-stone-50 rounded-xl overflow-hidden border border-stone-200 shadow-[0_1px_2px_rgba(33,28,22,0.04)] hover:shadow-[0_18px_40px_-18px_rgba(33,28,22,0.35)] hover:border-stone-300 transition-all duration-500"
    >
      {product.discount > 0 && (
        <span className="absolute top-3 left-3 z-10 bg-clay/95 text-bone text-[11px] font-medium tracking-wide px-2.5 py-1 rounded-full">
          −{product.discount}%
        </span>
      )}

      <Link to={`/productos/${product.slug}`} className="block">
        <div className="aspect-square overflow-hidden bg-stone-100">
          {imageUrl ? (
            <img
              src={optimizeImageUrl(imageUrl, 600)}
              alt={product.name}
              width={600}
              height={600}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[900ms] ease-out"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-stone-300">
              <span className="text-5xl">🪑</span>
            </div>
          )}
        </div>
      </Link>

      <div className="p-5">
        {product.category && (
          <p className="text-[11px] text-brass uppercase tracking-[0.2em] mb-2 font-medium">
            {product.category.name}
          </p>
        )}
        <Link to={`/productos/${product.slug}`}>
          <h3 className="font-display text-ink text-lg leading-snug mb-4 line-clamp-2 hover:text-brass transition-colors duration-300">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="font-display text-ink text-xl">
              ${formatPrice(discountedPrice)}
            </span>
            {product.discount > 0 && (
              <span className="text-xs text-stone-400 line-through">
                ${formatPrice(Number(product.price))}
              </span>
            )}
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => addItem(product)}
            className="bg-ink text-bone p-2.5 rounded-full hover:bg-brass transition-colors duration-300"
            aria-label="Agregar al carrito"
          >
            <ShoppingCart size={16} strokeWidth={1.75} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
