import { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Pencil, Trash2, Eye, EyeOff, X, Upload, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  adminGetAllProducts, adminCreateProduct, adminUpdateProduct,
  adminDeleteProduct, adminToggleProduct, adminUploadImage, getCategories,
} from '../../api';
import type { Product, Category } from '../../types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormState {
  name: string;
  description: string;
  price: string;
  stock: string;
  discount: string;
  material: 'PINO' | 'ALAMO' | '';
  categoryId: string;
  active: boolean;
  images: string[];
}

const EMPTY_FORM: FormState = {
  name: '', description: '', price: '', stock: '', discount: '0',
  material: '', categoryId: '', active: true, images: [],
};

function productToForm(p: Product): FormState {
  return {
    name:       p.name,
    description: p.description ?? '',
    price:      String(p.price),
    stock:      String(p.stock),
    discount:   String(p.discount),
    material:   (p.material ?? '') as FormState['material'],
    categoryId: String(p.categoryId),
    active:     p.active,
    images:     p.images.map(i => i.url),
  };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function MaterialBadge({ value }: { value?: 'PINO' | 'ALAMO' | null }) {
  if (!value) return null;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
      value === 'PINO' ? 'bg-amber-50 text-amber-700' : 'bg-sky-50 text-sky-700'
    }`}>
      {value === 'PINO' ? 'Pino' : 'Álamo'}
    </span>
  );
}

function StockBadge({ stock }: { stock: number }) {
  if (stock === 0) return <span className="text-red-500 font-semibold text-sm">Sin stock</span>;
  if (stock <= 3)  return <span className="text-amber-500 font-semibold text-sm">{stock}</span>;
  return <span className="text-stone-600 text-sm">{stock}</span>;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function AdminProductsPage() {
  const { token } = useAuth();
  const [products, setProducts]     = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch]         = useState('');
  const [loading, setLoading]       = useState(true);
  const [modal, setModal]           = useState<null | 'create' | Product>(null);
  const [form, setForm]             = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving]         = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);
  const [formError, setFormError]   = useState('');
  const [fetchError, setFetchError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchProducts = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setFetchError('');
    try {
      const d = await adminGetAllProducts(token, search || undefined);
      setProducts(d.products ?? []);
    } catch (err: unknown) {
      setFetchError(err instanceof Error ? err.message : 'Error al cargar productos');
    } finally {
      setLoading(false);
    }
  }, [token, search]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);
  useEffect(() => { getCategories().then(setCategories).catch(() => {}); }, []);

  // ── Modal helpers ──────────────────────────────────────────────────────────

  const openCreate = () => { setForm(EMPTY_FORM); setFormError(''); setModal('create'); };
  const openEdit   = (p: Product) => { setForm(productToForm(p)); setFormError(''); setModal(p); };
  const closeModal = () => setModal(null);

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm(f => ({ ...f, [key]: value }));

  // ── Image upload ───────────────────────────────────────────────────────────

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploadingImg(true);
    try {
      const urls = await Promise.all(Array.from(files).map(f => adminUploadImage(token!, f)));
      setField('images', [...form.images, ...urls]);
    } catch {
      setFormError('Error al subir imagen. Intentá de nuevo.');
    } finally {
      setUploadingImg(false);
    }
  };

  const removeImage = (idx: number) =>
    setField('images', form.images.filter((_, i) => i !== idx));

  // ── Save ───────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    setFormError('');
    if (!form.name.trim() || !form.price || !form.stock || !form.categoryId) {
      setFormError('Completá nombre, precio, stock y categoría.');
      return;
    }
    setSaving(true);
    const payload = {
      name:        form.name.trim(),
      description: form.description.trim() || undefined,
      price:       Number(form.price),
      stock:       Number(form.stock),
      discount:    Number(form.discount) || 0,
      material:    form.material || undefined,
      categoryId:  Number(form.categoryId),
      active:      form.active,
      images:      form.images,
    };
    try {
      if (modal === 'create') {
        await adminCreateProduct(token!, payload);
      } else {
        await adminUpdateProduct(token!, (modal as Product).id, payload);
      }
      closeModal();
      fetchProducts();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Error al guardar.');
    } finally {
      setSaving(false);
    }
  };

  // ── Toggle active ──────────────────────────────────────────────────────────

  const handleToggle = async (p: Product) => {
    await adminToggleProduct(token!, p.id, !p.active);
    fetchProducts();
  };

  // ── Delete ─────────────────────────────────────────────────────────────────

  const handleDelete = async (p: Product) => {
    if (!confirm(`¿Desactivar "${p.name}"?`)) return;
    await adminDeleteProduct(token!, p.id);
    fetchProducts();
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      <div className="p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-light text-ink">Productos</h1>
            <p className="text-stone-400 text-sm mt-0.5">{products.length} en total</p>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-ink text-bone px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-brass hover:text-ink transition-all duration-200"
          >
            <Plus size={16} strokeWidth={2} />
            Nuevo producto
          </button>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 bg-white border border-stone-200 rounded-lg px-3 py-2.5 w-full max-w-xs focus-within:border-brass transition-colors">
          <Search size={15} strokeWidth={1.75} className="text-stone-400 shrink-0" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar producto..."
            className="bg-transparent text-sm text-ink placeholder-stone-400 outline-none w-full"
          />
          {search && (
            <button onClick={() => setSearch('')}>
              <X size={13} className="text-stone-400 hover:text-ink" />
            </button>
          )}
        </div>

        {/* Error */}
        {fetchError && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-red-600 text-sm flex items-center justify-between">
            <span>{fetchError}</span>
            <button onClick={fetchProducts} className="underline hover:no-underline ml-4">Reintentar</button>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-xl border border-stone-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-100 text-left">
                  <th className="px-4 py-3 text-[11px] font-medium text-stone-400 uppercase tracking-[0.12em] w-14">Img</th>
                  <th className="px-4 py-3 text-[11px] font-medium text-stone-400 uppercase tracking-[0.12em]">Nombre</th>
                  <th className="px-4 py-3 text-[11px] font-medium text-stone-400 uppercase tracking-[0.12em]">Categoría</th>
                  <th className="px-4 py-3 text-[11px] font-medium text-stone-400 uppercase tracking-[0.12em]">Material</th>
                  <th className="px-4 py-3 text-[11px] font-medium text-stone-400 uppercase tracking-[0.12em] text-right">Precio</th>
                  <th className="px-4 py-3 text-[11px] font-medium text-stone-400 uppercase tracking-[0.12em] text-center">Stock</th>
                  <th className="px-4 py-3 text-[11px] font-medium text-stone-400 uppercase tracking-[0.12em] text-center">Dto.</th>
                  <th className="px-4 py-3 text-[11px] font-medium text-stone-400 uppercase tracking-[0.12em] text-center">Estado</th>
                  <th className="px-4 py-3 text-[11px] font-medium text-stone-400 uppercase tracking-[0.12em] text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {loading ? (
                  [...Array(6)].map((_, i) => (
                    <tr key={i}>
                      {[...Array(9)].map((_, j) => (
                        <td key={j} className="px-4 py-3">
                          <div className="h-4 bg-stone-100 rounded animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-12 text-stone-400">
                      No hay productos.
                    </td>
                  </tr>
                ) : (
                  products.map(p => (
                    <tr key={p.id} className={`hover:bg-stone-50/50 transition-colors ${!p.active ? 'opacity-50' : ''}`}>
                      <td className="px-4 py-3">
                        {p.images[0] ? (
                          <img src={p.images[0].url} alt={p.name} className="w-10 h-10 rounded-lg object-cover bg-stone-100" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-stone-100" />
                        )}
                      </td>
                      <td className="px-4 py-3 font-medium text-ink max-w-[200px]">
                        <span className="line-clamp-1">{p.name}</span>
                      </td>
                      <td className="px-4 py-3 text-stone-500">{p.category?.name}</td>
                      <td className="px-4 py-3"><MaterialBadge value={p.material} /></td>
                      <td className="px-4 py-3 text-right text-stone-700">
                        ${Number(p.price).toLocaleString('es-AR')}
                      </td>
                      <td className="px-4 py-3 text-center"><StockBadge stock={p.stock} /></td>
                      <td className="px-4 py-3 text-center">
                        {p.discount > 0 ? (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[11px] font-medium bg-brass/10 text-brass">
                            -{p.discount}%
                          </span>
                        ) : (
                          <span className="text-stone-300">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => handleToggle(p)} title={p.active ? 'Desactivar' : 'Activar'}>
                          {p.active
                            ? <Eye size={16} strokeWidth={1.75} className="text-emerald-500 mx-auto" />
                            : <EyeOff size={16} strokeWidth={1.75} className="text-stone-300 mx-auto" />
                          }
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 justify-end">
                          <button
                            onClick={() => openEdit(p)}
                            className="p-1.5 text-stone-400 hover:text-ink hover:bg-stone-100 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Pencil size={15} strokeWidth={1.75} />
                          </button>
                          <button
                            onClick={() => handleDelete(p)}
                            className="p-1.5 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Desactivar"
                          >
                            <Trash2 size={15} strokeWidth={1.75} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Modal ── */}
      <AnimatePresence>
        {modal !== null && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={closeModal}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.97 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            >
              <div
                onClick={e => e.stopPropagation()}
                className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto pointer-events-auto"
              >
                {/* Modal header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
                  <h2 className="font-medium text-ink">
                    {modal === 'create' ? 'Nuevo producto' : `Editar: ${(modal as Product).name}`}
                  </h2>
                  <button onClick={closeModal} className="text-stone-400 hover:text-ink">
                    <X size={20} strokeWidth={1.75} />
                  </button>
                </div>

                {/* Form */}
                <div className="p-6 space-y-5">

                  {/* Nombre + Categoría */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="label-admin">Nombre *</label>
                      <input
                        value={form.name}
                        onChange={e => setField('name', e.target.value)}
                        placeholder="Nombre del producto"
                        className="input-admin"
                      />
                    </div>
                    <div>
                      <label className="label-admin">Categoría *</label>
                      <select
                        value={form.categoryId}
                        onChange={e => setField('categoryId', e.target.value)}
                        className="input-admin"
                      >
                        <option value="">Seleccioná...</option>
                        {categories.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="label-admin">Material</label>
                      <select
                        value={form.material}
                        onChange={e => setField('material', e.target.value as FormState['material'])}
                        className="input-admin"
                      >
                        <option value="">Sin material</option>
                        <option value="PINO">Pino</option>
                        <option value="ALAMO">Álamo</option>
                      </select>
                    </div>
                  </div>

                  {/* Descripción */}
                  <div>
                    <label className="label-admin">Descripción</label>
                    <textarea
                      value={form.description}
                      onChange={e => setField('description', e.target.value)}
                      rows={3}
                      placeholder="Describí el producto..."
                      className="input-admin resize-none"
                    />
                  </div>

                  {/* Precio, Stock, Descuento */}
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="label-admin">Precio (ARS) *</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={form.price}
                        onChange={e => setField('price', e.target.value)}
                        placeholder="0"
                        className="input-admin"
                      />
                    </div>
                    <div>
                      <label className="label-admin">Stock *</label>
                      <input
                        type="number"
                        min="0"
                        value={form.stock}
                        onChange={e => setField('stock', e.target.value)}
                        placeholder="0"
                        className="input-admin"
                      />
                    </div>
                    <div>
                      <label className="label-admin">Descuento %</label>
                      <input
                        type="number"
                        min="0"
                        max="50"
                        value={form.discount}
                        onChange={e => setField('discount', e.target.value)}
                        placeholder="0"
                        className="input-admin"
                      />
                    </div>
                  </div>

                  {/* Activo */}
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setField('active', !form.active)}
                      className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${form.active ? 'bg-emerald-500' : 'bg-stone-200'}`}
                    >
                      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-200 ${form.active ? 'left-5' : 'left-0.5'}`} />
                    </button>
                    <span className="text-sm text-stone-600">{form.active ? 'Activo' : 'Inactivo'}</span>
                  </div>

                  {/* Imágenes */}
                  <div>
                    <label className="label-admin">Imágenes</label>

                    {/* Preview */}
                    {form.images.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {form.images.map((url, idx) => (
                          <div key={idx} className="relative group">
                            <img src={url} alt="" className="w-20 h-20 rounded-lg object-cover bg-stone-100" />
                            <button
                              type="button"
                              onClick={() => removeImage(idx)}
                              className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X size={11} strokeWidth={2.5} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Upload area */}
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      disabled={uploadingImg}
                      className="w-full border-2 border-dashed border-stone-200 rounded-xl py-6 flex flex-col items-center gap-2 text-stone-400 hover:border-brass hover:text-brass transition-colors duration-200 disabled:opacity-50"
                    >
                      {uploadingImg
                        ? <Loader2 size={20} strokeWidth={1.75} className="animate-spin" />
                        : <Upload size={20} strokeWidth={1.75} />
                      }
                      <span className="text-sm">{uploadingImg ? 'Subiendo...' : 'Hacé click para subir imágenes'}</span>
                    </button>
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={e => handleFiles(e.target.files)}
                    />
                  </div>

                  {formError && (
                    <p className="text-red-500 text-sm">{formError}</p>
                  )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-stone-100 flex justify-end gap-3">
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 text-sm text-stone-500 hover:text-ink transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-5 py-2 bg-ink text-bone text-sm font-medium rounded-lg hover:bg-brass hover:text-ink transition-all duration-200 disabled:opacity-60"
                  >
                    {saving && <Loader2 size={14} strokeWidth={2} className="animate-spin" />}
                    {saving ? 'Guardando...' : 'Guardar'}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
