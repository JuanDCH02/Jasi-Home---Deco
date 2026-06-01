import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { getProducts, getCategories } from '../api';
import type { Product, Category } from '../types';

const MATERIALS = [
  { value: '', label: 'Todos' },
  { value: 'PINO', label: 'Pino' },
  { value: 'ALAMO', label: 'Álamo' },
];

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState('');
  const [activeMaterial, setActiveMaterial] = useState('');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    getCategories().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    setPage(1);
  }, [activeCategory, activeMaterial, debouncedSearch]);

  useEffect(() => {
    setLoading(true);
    getProducts({
      page,
      limit: 12,
      category: activeCategory || undefined,
      material: activeMaterial || undefined,
      search: debouncedSearch || undefined,
    })
      .then((data) => {
        setProducts(data.products ?? []);
        setTotalPages(data.pages ?? 1);
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [activeCategory, activeMaterial, debouncedSearch, page]);

  useEffect(() => {
    document.body.style.overflow = filtersOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [filtersOpen]);

  const filterKey = `${activeCategory}-${activeMaterial}-${debouncedSearch}-${page}`;
  const activeFilterCount = (activeCategory ? 1 : 0) + (activeMaterial ? 1 : 0);

  const FilterChip = ({
    active,
    onClick,
    children,
  }: {
    active: boolean;
    onClick: () => void;
    children: React.ReactNode;
  }) => (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
        active ? 'bg-brass text-ink' : 'text-stone-500 hover:text-ink hover:bg-stone-100'
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="min-h-screen bg-bone pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-6">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <p className="text-brass text-xs font-medium uppercase tracking-[0.25em] mb-3">
            Catálogo
          </p>
          <h1 className="text-5xl md:text-6xl font-display font-light text-ink tracking-tight">
            Nuestros Productos
          </h1>
          <p className="text-stone-500 mt-3">Encontrá el mueble perfecto para tu hogar</p>
        </motion.div>

        {/* ── Desktop filters ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
          className="hidden md:flex flex-wrap justify-center gap-3 mb-12"
        >
          <div className="flex items-center gap-2 bg-stone-50 border border-stone-200 rounded-full px-4 py-2 focus-within:border-brass transition-colors duration-300">
            <Search size={15} strokeWidth={1.75} className="text-stone-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar..."
              className="bg-transparent text-ink text-sm outline-none placeholder-stone-400 w-36"
            />
          </div>

          <div className="flex items-center gap-1 bg-stone-50 border border-stone-200 rounded-full px-3 py-1.5">
            <span className="text-stone-400 text-[11px] uppercase tracking-[0.15em] px-2">Categoría</span>
            <FilterChip active={activeCategory === ''} onClick={() => setActiveCategory('')}>Todos</FilterChip>
            {categories.map((cat) => (
              <FilterChip key={cat.id} active={activeCategory === cat.slug} onClick={() => setActiveCategory(cat.slug)}>
                {cat.name}
              </FilterChip>
            ))}
          </div>

          <div className="flex items-center gap-1 bg-stone-50 border border-stone-200 rounded-full px-3 py-1.5">
            <span className="text-stone-400 text-[11px] uppercase tracking-[0.15em] px-2">Material</span>
            {MATERIALS.map(({ value, label }) => (
              <FilterChip key={value} active={activeMaterial === value} onClick={() => setActiveMaterial(value)}>
                {label}
              </FilterChip>
            ))}
          </div>
        </motion.div>

        {/* ── Mobile filters bar ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
          className="flex md:hidden items-center gap-3 mb-8"
        >
          {/* Search */}
          <div className="flex-1 flex items-center gap-2 bg-stone-50 border border-stone-200 rounded-full px-4 py-2.5 focus-within:border-brass transition-colors duration-300">
            <Search size={15} strokeWidth={1.75} className="text-stone-400 shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar..."
              className="bg-transparent text-ink text-sm outline-none placeholder-stone-400 w-full"
            />
          </div>

          {/* Filtros button */}
          <button
            onClick={() => setFiltersOpen(true)}
            className="relative flex items-center gap-2 bg-stone-50 border border-stone-200 rounded-full px-4 py-2.5 text-sm font-medium text-stone-600 shrink-0 hover:border-brass transition-colors duration-200"
          >
            <SlidersHorizontal size={15} strokeWidth={1.75} />
            Filtros
            {activeFilterCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-brass text-ink text-[10px] font-bold flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </motion.div>

        {/* ── Mobile active filter chips ── */}
        {(activeCategory || activeMaterial) && (
          <div className="flex md:hidden flex-wrap gap-2 mb-6">
            {activeCategory && (
              <button
                onClick={() => setActiveCategory('')}
                className="flex items-center gap-1.5 bg-brass/15 text-brass rounded-full px-3 py-1 text-xs font-medium"
              >
                {categories.find((c) => c.slug === activeCategory)?.name ?? activeCategory}
                <X size={11} strokeWidth={2.5} />
              </button>
            )}
            {activeMaterial && (
              <button
                onClick={() => setActiveMaterial('')}
                className="flex items-center gap-1.5 bg-brass/15 text-brass rounded-full px-3 py-1 text-xs font-medium"
              >
                {MATERIALS.find((m) => m.value === activeMaterial)?.label}
                <X size={11} strokeWidth={2.5} />
              </button>
            )}
          </div>
        )}

        {/* Grid */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="skeleton"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5"
            >
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="aspect-[4/5] bg-stone-200 rounded-xl animate-pulse" />
              ))}
            </motion.div>
          ) : products.length > 0 ? (
            <motion.div
              key={filterKey}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5"
            >
              {products.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-24 text-stone-400"
            >
              <p className="text-5xl mb-4">🪑</p>
              <p className="text-lg font-display">No encontramos productos con esos filtros.</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pagination */}
        {totalPages > 1 && !loading && (
          <div className="flex justify-center gap-2 mt-12">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`w-9 h-9 rounded-full text-sm font-medium transition-all duration-300 ${
                  page === i + 1
                    ? 'bg-ink text-bone'
                    : 'bg-stone-50 border border-stone-200 text-stone-600 hover:border-ink hover:text-ink'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Mobile filters bottom sheet ── */}
      <AnimatePresence>
        {filtersOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setFiltersOpen(false)}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
            />

            {/* Sheet */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-bone rounded-t-3xl px-6 pt-5 pb-10 md:hidden"
            >
              {/* Handle */}
              <div className="w-10 h-1 bg-stone-300 rounded-full mx-auto mb-6" />

              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-display text-ink">Filtros</h2>
                <button
                  onClick={() => setFiltersOpen(false)}
                  className="text-stone-400 hover:text-ink transition-colors"
                >
                  <X size={20} strokeWidth={1.75} />
                </button>
              </div>

              {/* Categoría */}
              <div className="mb-6">
                <p className="text-[11px] font-medium text-stone-400 uppercase tracking-[0.18em] mb-3">
                  Categoría
                </p>
                <div className="flex flex-wrap gap-2">
                  <FilterChip active={activeCategory === ''} onClick={() => setActiveCategory('')}>Todos</FilterChip>
                  {categories.map((cat) => (
                    <FilterChip key={cat.id} active={activeCategory === cat.slug} onClick={() => setActiveCategory(cat.slug)}>
                      {cat.name}
                    </FilterChip>
                  ))}
                </div>
              </div>

              {/* Material */}
              <div className="mb-8">
                <p className="text-[11px] font-medium text-stone-400 uppercase tracking-[0.18em] mb-3">
                  Material
                </p>
                <div className="flex flex-wrap gap-2">
                  {MATERIALS.map(({ value, label }) => (
                    <FilterChip key={value} active={activeMaterial === value} onClick={() => setActiveMaterial(value)}>
                      {label}
                    </FilterChip>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setFiltersOpen(false)}
                className="w-full bg-ink text-bone py-3.5 rounded-xl font-medium text-sm tracking-wide"
              >
                Ver resultados
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
