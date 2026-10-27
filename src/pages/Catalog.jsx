import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchProducts, fetchCategories, addProduct, updateProduct, deleteProduct } from '../services/api';
import Icon from '../components/Icon';

export default function Catalog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({ title: '', price: 0, category: '' });

  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const search = searchParams.get('q') || '';
  const category = searchParams.get('category') || 'all';
  const skip = (page - 1) * limit;

  useEffect(() => { fetchCategories().then(setCategories).catch(() => {}); }, []);

  useEffect(() => {
    setLoading(true);
    fetchProducts({ limit, skip, search, category })
      .then((data) => { setProducts(data.products || []); setTotal(data.total || 0); setError(''); })
      .catch(() => setError('Error al cargar los datos'))
      .finally(() => setLoading(false));
  }, [limit, skip, search, category]);

  const updateParams = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) newParams.set(key, value); else newParams.delete(key);
    if (key !== 'page') newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    await addProduct(formData);
    setProducts([{ ...formData, id: Date.now(), thumbnail: 'https://via.placeholder.com/150' }, ...products]);
    setModalOpen(false);
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!confirm('¿Estás seguro de guardar los cambios?')) return;
    await updateProduct(editing.id, formData);
    setProducts(products.map(p => p.id === editing.id ? { ...p, ...formData } : p));
    setModalOpen(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Seguro que deseas eliminar este registro?')) return;
    await deleteProduct(id);
    setProducts(products.filter(p => p.id !== id));
  };

  const openModal = (product = null) => {
    setEditing(product);
    setFormData(product ? { title: product.title, price: product.price, category: product.category } : { title: '', price: 0, category: 'beauty' });
    setModalOpen(true);
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="mx-auto max-w-[1440px]">
      <div className="overflow-hidden rounded-3xl border border-white/5 bg-[#0a0a0a]">
        
        {/* Filtros */}
        <div className="flex flex-col gap-4 border-b border-white/5 p-5 sm:flex-row sm:items-center sm:justify-between bg-white/[0.02]">
          <div className="flex flex-wrap gap-3">
            <label className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-black/50 px-4 py-2.5 sm:max-w-[300px] focus-within:border-fuchsia-500 transition-colors">
              <Icon name="search" size={18} className="text-white" />
              <input type="text" placeholder="Buscar producto..." defaultValue={search} onChange={(e) => updateParams('q', e.target.value)} className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500" />
            </label>
            <label className="relative flex items-center">
              <select value={category} onChange={(e) => updateParams('category', e.target.value)} className="appearance-none rounded-xl border border-white/10 bg-black/50 py-2.5 pl-4 pr-10 text-sm font-medium text-slate-300 outline-none focus:border-fuchsia-500">
                <option value="all">Todas las categorías</option>
                {categories.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}
              </select>
              <Icon name="chevronDown" size={16} className="absolute right-3 text-white pointer-events-none" />
            </label>
          </div>
          <button onClick={() => openModal()} className="flex items-center gap-2 rounded-xl bg-fuchsia-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-fuchsia-700 transition shadow-[0_0_15px_rgba(217,70,239,0.3)]">
            <span className="text-xl leading-none">+</span> Agregar Registro
          </button>
        </div>

        {/* Tabla */}
        {loading ? (
          <p className="text-fuchsia-400 text-center py-10 animate-pulse font-bold">Cargando catálogo...</p>
        ) : error ? (
          <p className="text-red-400 text-center py-10">{error}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-white/[0.02] text-xs uppercase tracking-wider text-slate-500">
                <tr>{["ID", "Título", "Categoría", "Precio", "Acciones"].map(l => <th key={l} className="px-6 py-5 font-bold">{l}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {products.map(p => (
                  <tr key={p.id} className="hover:bg-white/[0.04] transition-colors group">
                    <td className="px-6 py-5 font-medium text-slate-500">{p.id}</td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <img src={p.thumbnail} alt={p.title} className="h-10 w-10 rounded-lg object-cover bg-black/50" />
                        <p className="font-bold text-white text-base line-clamp-1">{p.title}</p>
                      </div>
                    </td>
                    <td className="px-6 py-5"><span className="rounded bg-fuchsia-500/20 px-2 py-1 text-xs text-fuchsia-300">{p.category}</span></td>
                    <td className="px-6 py-5 font-medium text-white">${p.price}</td>
                    <td className="px-6 py-5">
                      {/* ⚠️ ICONOS EN BLANCO AQUÍ */}
                      <div className="flex gap-2 opacity-70 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openModal(p)} className="rounded-lg p-2 bg-white/10 text-white hover:bg-fuchsia-500 hover:text-white transition"><Icon name="edit" size={16} /></button>
                        <button onClick={() => handleDelete(p.id)} className="rounded-lg p-2 bg-white/10 text-white hover:bg-red-500 hover:text-white transition"><Icon name="trash" size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Paginación */}
        <div className="flex flex-col gap-4 border-t border-white/5 px-5 py-4 sm:flex-row sm:items-center sm:justify-between bg-white/[0.02]">
          <label className="relative flex items-center w-fit">
            <select value={limit} onChange={(e) => updateParams('limit', e.target.value)} className="appearance-none rounded-xl border border-white/10 bg-black/50 py-2 pl-4 pr-10 text-sm font-medium text-slate-300 outline-none">
              {[10, 20, 40, 50].map(n => <option key={n} value={n}>{n} por página</option>)}
            </select>
            <Icon name="chevronDown" size={16} className="absolute right-3 text-white pointer-events-none" />
          </label>
          <div className="flex items-center gap-3">
            <button disabled={page === 1} onClick={() => updateParams('page', page - 1)} className="rounded-lg bg-white/10 px-4 py-2 text-sm text-white disabled:opacity-50 hover:bg-white/20 transition">Anterior</button>
            <span className="text-sm text-slate-400 font-medium">Página {page} de {totalPages || 1}</span>
            <button disabled={page >= totalPages} onClick={() => updateParams('page', page + 1)} className="rounded-lg bg-white/10 px-4 py-2 text-sm text-white disabled:opacity-50 hover:bg-white/20 transition">Siguiente</button>
          </div>
        </div>
      </div>

      {/* Modal CRUD */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm" onMouseDown={() => setModalOpen(false)}>
          <section className="w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-[#111] shadow-2xl" onMouseDown={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
              <h2 className="text-xl font-bold text-white">{editing ? "Editar Registro" : "Nuevo Registro"}</h2>
              <button onClick={() => setModalOpen(false)} className="text-white hover:text-red-400 transition"><Icon name="x" size={20} /></button>
            </div>
            <form onSubmit={editing ? handleEdit : handleAdd} className="p-6 space-y-4">
              <label className="block"><span className="mb-2 block text-sm font-medium text-slate-300">Título</span><input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full rounded-xl border border-white/10 bg-black/50 p-3 text-sm text-white outline-none focus:border-fuchsia-500" required /></label>
              <label className="block"><span className="mb-2 block text-sm font-medium text-slate-300">Precio</span><input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })} className="w-full rounded-xl border border-white/10 bg-black/50 p-3 text-sm text-white outline-none focus:border-fuchsia-500" required /></label>
              <label className="block"><span className="mb-2 block text-sm font-medium text-slate-300">Categoría</span><input type="text" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full rounded-xl border border-white/10 bg-black/50 p-3 text-sm text-white outline-none focus:border-fuchsia-500" required /></label>
              
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm font-medium text-white hover:text-slate-300 transition">Cancelar</button>
                <button type="submit" className="rounded-xl bg-fuchsia-600 px-5 py-2 font-bold text-white hover:bg-fuchsia-700 shadow-[0_0_15px_rgba(217,70,239,0.4)]">Guardar</button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}