import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchEvents } from '../services/api';
import Icon from '../components/Icon';
import EventCard from '../components/EventCard';

export default function Catalog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [events, setEvents] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '12'); // Mostramos más por página
  const search = searchParams.get('q') || '';
  const category = searchParams.get('category') || 'all';

  useEffect(() => {
    setLoading(true);
    fetchEvents({ limit, page, search, category })
      .then((data) => { setEvents(data.events); setTotal(data.total); setError(''); })
      .catch(() => setError('No se pudieron cargar los eventos.'))
      .finally(() => setLoading(false));
  }, [limit, page, search, category]);

  const updateParams = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) newParams.set(key, value); else newParams.delete(key);
    if (key !== 'page') newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="mx-auto max-w-[1440px]">
      
      {/* Filtros */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white/5 p-4 rounded-2xl border border-white/5">
        <div className="flex flex-wrap gap-3">
          <label className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-black/50 px-4 py-2.5 sm:max-w-[300px] focus-within:border-fuchsia-500 transition-colors">
            <Icon name="search" size={18} className="text-white" />
            <input type="text" placeholder="Buscar evento..." defaultValue={search} onChange={(e) => updateParams('q', e.target.value)} className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500" />
          </label>
          <label className="relative flex items-center">
            <select value={category} onChange={(e) => updateParams('category', e.target.value)} className="appearance-none rounded-xl border border-white/10 bg-black/50 py-2.5 pl-4 pr-10 text-sm font-medium text-slate-300 outline-none focus:border-fuchsia-500">
              <option value="all">Todas las categorías</option>
              <option value="Music">Música</option>
              <option value="Arts & Theatre">Teatro y Danza</option>
              <option value="Miscellaneous">Literatura / Otros</option>
            </select>
            <Icon name="chevronDown" size={16} className="absolute right-3 text-white pointer-events-none" />
          </label>
        </div>
        <div className="text-sm text-slate-400">
          Mostrando {events.length} de {total} eventos
        </div>
      </div>

      {/* Cuadrícula de Eventos */}
      {loading ? (
        <p className="text-fuchsia-400 text-center py-20 animate-pulse font-bold text-lg">Cargando cartelera nacional...</p>
      ) : error ? (
        <p className="text-red-400 text-center py-20">{error}</p>
      ) : events.length === 0 ? (
        <p className="text-slate-400 text-center py-20">No hay eventos disponibles con estos filtros.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {events.map(ev => (
            <EventCard key={ev.id} event={ev} />
          ))}
        </div>
      )}

      {/* Paginación */}
      <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/10 pt-6">
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-400">Mostrar:</span>
          <select value={limit} onChange={(e) => updateParams('limit', e.target.value)} className="rounded-lg border border-white/10 bg-black/50 py-1.5 px-3 text-sm text-white outline-none">
            {[12, 24, 48].map(n => <option key={n} value={n}>{n} eventos</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <button disabled={page === 1} onClick={() => updateParams('page', page - 1)} className="rounded-lg bg-white/5 px-4 py-2 text-sm text-white disabled:opacity-50 hover:bg-white/10 transition">Anterior</button>
          <span className="text-sm text-slate-400 font-medium px-4">Página {page} de {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => updateParams('page', page + 1)} className="rounded-lg bg-white/5 px-4 py-2 text-sm text-white disabled:opacity-50 hover:bg-white/10 transition">Siguiente</button>
        </div>
      </div>

    </div>
  );
}