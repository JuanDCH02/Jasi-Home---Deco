import { useEffect, useState, type FormEvent } from 'react';
import { Trash2, Plus, Tag } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getCategories, adminCreateCategory, adminDeleteCategory } from '../../api';
import type { Category } from '../../types';

export default function AdminCategoriesPage() {
  const { token } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [newName, setNewName]       = useState('');
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [error, setError]           = useState('');

  const fetch = () => {
    setLoading(true);
    getCategories().then(setCategories).finally(() => setLoading(false));
  };
  useEffect(fetch, []);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setSaving(true);
    setError('');
    try {
      await adminCreateCategory(token!, newName.trim());
      setNewName('');
      fetch();
    } catch {
      setError('Error al crear la categoría.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (cat: Category) => {
    if (!confirm(`¿Eliminar categoría "${cat.name}"? Los productos asociados quedarán sin categoría.`)) return;
    try {
      await adminDeleteCategory(token!, cat.id);
      fetch();
    } catch {
      setError('Error al eliminar. Puede tener productos asociados.');
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-xl">
      <div>
        <h1 className="text-2xl font-display font-light text-ink">Categorías</h1>
        <p className="text-stone-400 text-sm mt-0.5">{categories.length} categorías creadas</p>
      </div>

      {/* Create form */}
      <form onSubmit={handleCreate} className="flex gap-3">
        <input
          value={newName}
          onChange={e => setNewName(e.target.value)}
          placeholder="Nueva categoría..."
          className="flex-1 bg-white border border-stone-200 rounded-lg px-4 py-2.5 text-sm text-ink placeholder-stone-400 outline-none focus:border-brass focus:ring-2 focus:ring-brass/15 transition-all"
        />
        <button
          type="submit"
          disabled={saving || !newName.trim()}
          className="flex items-center gap-2 px-4 py-2.5 bg-ink text-bone text-sm font-medium rounded-lg hover:bg-brass hover:text-ink transition-all duration-200 disabled:opacity-50"
        >
          <Plus size={16} strokeWidth={2} />
          Crear
        </button>
      </form>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      {/* List */}
      <div className="bg-white rounded-xl border border-stone-100 overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-10 bg-stone-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="py-12 text-center text-stone-400">
            <Tag size={32} strokeWidth={1.25} className="mx-auto mb-3 opacity-40" />
            <p className="text-sm">No hay categorías aún.</p>
          </div>
        ) : (
          <ul className="divide-y divide-stone-50">
            {categories.map(cat => (
              <li key={cat.id} className="flex items-center justify-between px-5 py-3.5">
                <div>
                  <p className="text-sm font-medium text-ink">{cat.name}</p>
                  <p className="text-xs text-stone-400">/{cat.slug}</p>
                </div>
                <button
                  onClick={() => handleDelete(cat)}
                  className="p-1.5 text-stone-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Eliminar"
                >
                  <Trash2 size={15} strokeWidth={1.75} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
