import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ShoppingCart, Minus, Plus, Check, Package } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { getProduct, getProducts } from '../api';
import { useCart } from '../context/CartContext';
import type { Product } from '../types';

const MATERIAL_LABELS: Record<string, string> = {
  PINO: 'Pino',
  ALAMO: 'Álamo',
};

export default function DetailsProductsPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    setNotFound(false);
    setActiveImage(0);
    setQuantity(1);

    getProduct(slug!)
      .then((data: Product) => {
        setProduct(data);
        return getProducts({ category: data.category?.slug, limit: 5 });
      })
      .then((data) => {
        setRelated((data.products ?? []).filter((p: Product) => p.slug !== slug).slice(0, 4));
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  const formatPrice = (n: number) =>
    n.toLocaleString('es-AR', { maximumFractionDigits: 0 });

  const handleAdd = () => {
    if (!product) return;
    for (let i = 0; i < quantity; i++) addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bone pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12">
          <div className="aspect-square bg-stone-200 rounded-2xl animate-pulse" />
          <div className="space-y-5">
            <div className="h-4 w-24 bg-stone-200 rounded animate-pulse" />
            <div className="h-12 w-3/4 bg-stone-200 rounded animate-pulse" />
            <div className="h-8 w-32 bg-stone-200 rounded animate-pulse" />
            <div className="h-24 w-full bg-stone-200 rounded animate-pulse" />
            <div className="h-12 w-full bg-stone-200 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div className="min-h-screen bg-bone pt-32 pb-20 flex items-center justify-center">
        <div className="text-center">
          <p className="text-6xl mb-5">🪑</p>
          <h1 className="text-3xl font-display font-light text-ink mb-3">
            Producto no encontrado
          </h1>
          <p className="text-stone-500 mb-8">El producto que buscás no existe o fue retirado.</p>
          <button
            onClick={() => navigate('/productos')}
            className="inline-block border border-ink/30 text-ink px-8 py-3 rounded-full font-medium text-sm tracking-wide hover:bg-ink hover:text-bone hover:border-ink transition-all duration-300"
          >
            Ver catálogo
          </button>
        </div>
      </div>
    );
  }

  const images = product.images ?? [];
  const hasImages = images.length > 0;
  const discountedPrice =
    product.discount > 0
      ? Number(product.price) * (1 - product.discount / 100)
      : Number(product.price);
  const inStock = product.stock > 0;

  return (
    <div className="min-h-screen bg-bone pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-6">

        {/* Breadcrumb / back */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <Link
            to="/productos"
            className="inline-flex items-center gap-2 text-stone-500 hover:text-ink text-sm transition-colors duration-300"
          >
            <ArrowLeft size={16} strokeWidth={1.75} />
            Volver al catálogo
          </Link>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 lg:gap-16">

          {/* ── GALERÍA ─────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="relative aspect-square overflow-hidden rounded-2xl bg-stone-100 border border-stone-200">
              {product.discount > 0 && (
                <span className="absolute top-4 left-4 z-10 bg-clay/95 text-bone text-xs font-medium tracking-wide px-3 py-1.5 rounded-full">
                  −{product.discount}%
                </span>
              )}
              <AnimatePresence mode="wait">
                {hasImages ? (
                  <motion.img
                    key={activeImage}
                    src={images[activeImage].url}
                    alt={product.name}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.35 }}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-stone-300">
                    <span className="text-7xl">🪑</span>
                  </div>
                )}
              </AnimatePresence>
            </div>

            {images.length > 1 && (
              <div className="flex gap-3 mt-4">
                {images.map((img, i) => (
                  <button
                    key={img.id}
                    onClick={() => setActiveImage(i)}
                    className={`aspect-square w-20 rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                      activeImage === i
                        ? 'border-brass'
                        : 'border-stone-200 hover:border-stone-300 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* ── INFO ────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="self-start w-full bg-stone-50 border border-stone-200 rounded-2xl p-8 lg:p-10 shadow-[0_18px_50px_-24px_rgba(33,28,22,0.3)]"
          >
            {product.category && (
              <Link
                to={`/productos`}
                className="text-brass text-xs font-medium uppercase tracking-[0.25em] hover:text-clay transition-colors duration-300"
              >
                {product.category.name}
              </Link>
            )}

            <h1 className="text-4xl md:text-5xl font-display font-light text-ink tracking-tight leading-tight mt-4">
              {product.name}
            </h1>

            <div className="flex items-baseline gap-3 mt-7">
              <span className="font-display text-ink text-3xl">
                ${formatPrice(discountedPrice)}
              </span>
              {product.discount > 0 && (
                <span className="text-lg text-stone-400 line-through">
                  ${formatPrice(Number(product.price))}
                </span>
              )}
            </div>

            {/* Meta badges */}
            <div className="flex flex-wrap items-center gap-3 mt-7">
              {product.material && (
                <span className="inline-flex items-center gap-1.5 bg-white border border-stone-200 text-stone-600 text-xs font-medium px-3 py-1.5 rounded-full">
                  Material: {MATERIAL_LABELS[product.material] ?? product.material}
                </span>
              )}
              <span
                className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border ${
                  inStock
                    ? 'bg-white border-stone-200 text-stone-600'
                    : 'bg-clay/10 border-clay/30 text-clay'
                }`}
              >
                <Package size={13} strokeWidth={1.75} />
                {inStock ? `${product.stock} en stock` : 'Sin stock'}
              </span>
            </div>

            {product.description && (
              <p className="text-stone-600 leading-relaxed mt-7">
                {product.description}
              </p>
            )}

            <div className="h-px w-full bg-stone-200 my-9" />

            {/* Quantity + add to cart */}
            <div className="space-y-5">
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs font-medium text-stone-500 uppercase tracking-[0.2em]">
                  Cantidad
                </span>
                <div className="flex items-center gap-1 bg-white border border-stone-200 rounded-full px-2 py-1.5">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="w-9 h-9 rounded-full flex items-center justify-center text-stone-600 hover:bg-stone-100 disabled:opacity-40 disabled:hover:bg-transparent transition-colors duration-300"
                    aria-label="Disminuir cantidad"
                  >
                    <Minus size={16} strokeWidth={1.75} />
                  </button>
                  <span className="w-10 text-center font-display text-ink text-lg">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(product.stock || q + 1, q + 1))}
                    disabled={inStock && quantity >= product.stock}
                    className="w-9 h-9 rounded-full flex items-center justify-center text-stone-600 hover:bg-stone-100 disabled:opacity-40 disabled:hover:bg-transparent transition-colors duration-300"
                    aria-label="Aumentar cantidad"
                  >
                    <Plus size={16} strokeWidth={1.75} />
                  </button>
                </div>
              </div>

              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleAdd}
                disabled={!inStock}
                className={`w-full inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full font-medium text-sm tracking-wide transition-all duration-300 ${
                  !inStock
                    ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                    : added
                    ? 'bg-brass text-ink'
                    : 'bg-ink text-bone hover:bg-brass hover:text-ink'
                }`}
              >
                {added ? (
                  <>
                    <Check size={18} strokeWidth={2} />
                    Agregado al carrito
                  </>
                ) : (
                  <>
                    <ShoppingCart size={18} strokeWidth={1.75} />
                    {inStock ? 'Agregar al carrito' : 'Sin stock'}
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        </div>

        {/* ── RELACIONADOS ─────────────────────────────── */}
        {related.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-28 md:mt-36 pt-12 border-t border-stone-200"
          >
            <div className="text-center mb-12">
              <p className="text-brass text-xs font-medium uppercase tracking-[0.25em] mb-3">
                También te puede gustar
              </p>
              <h2 className="text-3xl md:text-4xl font-display font-light text-ink tracking-tight">
                Productos relacionados
              </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {related.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
