import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchEvents } from '../services/api';
import Icon from '../components/Icon';
import EventCard from '../components/EventCard';

const LIMIT_OPTIONS = [12, 24, 48];
const LIMIT_STORAGE_KEY = 'culturavibe-events-per-page';
const STATES = [
  { value: 'all', label: 'Todos los estados' },
  { value: 'CDMX', label: 'Ciudad de México' },
  { value: 'NL', label: 'Nuevo León' },
  { value: 'JAL', label: 'Jalisco' },
  { value: 'SIN', label: 'Sinaloa' },
  { value: 'MEX', label: 'Estado de México' },
  { value: 'PUE', label: 'Puebla' },
  { value: 'GRO', label: 'Guerrero' },
  { value: 'MOR', label: 'Morelos' },
];

const SORT_OPTIONS = [
  { value: 'date-asc', label: 'Fecha: próximos primero' },
  { value: 'date-desc', label: 'Fecha: más lejanos primero' },
  { value: 'price-asc', label: 'Precio: menor a mayor' },
  { value: 'price-desc', label: 'Precio: mayor a menor' },
];

const readStoredLimit = () => {
  const stored = Number(localStorage.getItem(LIMIT_STORAGE_KEY));
  return LIMIT_OPTIONS.includes(stored) ? stored : 12;
};

export default function Catalog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [events, setEvents] = useState([]);
  const [total, setTotal] = useState(0);
  const [source, setSource] = useState('ticketmaster');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchInput, setSearchInput] = useState(searchParams.get('q') || '');
  const searchTimer = useRef(null);

  const rawPage = Number(searchParams.get('page') || '1');
  const page = Number.isFinite(rawPage) && rawPage >= 1 ? Math.floor(rawPage) : 1;
  const rawLimit = Number(searchParams.get('limit') || '');
  const limit = LIMIT_OPTIONS.includes(rawLimit) ? rawLimit : readStoredLimit();
  const search = searchParams.get('q') || '';
  const category = searchParams.get('category') || 'all';
  const state = searchParams.get('state') || 'all';
  const sortParam = searchParams.get('sort') || 'date-asc';
  const sort = SORT_OPTIONS.some((o) => o.value === sortParam) ? sortParam : 'date-asc';

  // Si se entra al catálogo sin límite en la URL, se restaura el último
  // elegido (12, 24 o 48) para que la configuración se mantenga.
  useEffect(() => {
    if (!searchParams.get('limit')) {
      const stored = readStoredLimit();
      const next = new URLSearchParams(searchParams);
      next.set('limit', String(stored));
      setSearchParams(next, { replace: true });
    }
    // Solo al entrar a la página.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateParams = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) newParams.set(key, value); else newParams.delete(key);
    if (key !== 'page') newParams.set('page', '1');
    if (key === 'limit') localStorage.setItem(LIMIT_STORAGE_KEY, String(value));
    setSearchParams(newParams);
  };

  // La búsqueda espera 400 ms después de dejar de escribir para no pedir
  // a la API con cada tecla.
  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      if (searchInput !== search) updateParams('q', searchInput.trim());
    }, 400);
    return () => clearTimeout(searchTimer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  useEffect(() => {
    setLoading(true);
    fetchEvents({ limit, page, search, category, state, sort })
      .then((data) => {
        setEvents(data.events);
        setTotal(data.total);
        setSource(data.source || 'ticketmaster');
        setError('');
      })
      .catch(() => setError('No se pudieron cargar los eventos.'))
      .finally(() => setLoading(false));
  }, [limit, page, search, category, state, sort]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  // Si los filtros dejan menos páginas que la actual (por ejemplo, se
  // estaba en la página 10 y ahora solo hay 3), se vuelve a la última válida.
  useEffect(() => {
    if (!loading && total > 0 && page > totalPages) {
      updateParams('page', String(totalPages));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, total, totalPages]);

  return (
    <div className="mx-auto max-w-[1440px]">

      {/* Filtros */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white/5 p-4 rounded-2xl border border-white/5">
        <div className="flex flex-wrap gap-3">
          <label className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-black/50 px-4 py-2.5 sm:max-w-[300px] focus-within:border-fuchsia-500 transition-colors">
            <Icon name="search" size={18} className="text-white" />
            <input type="text" placeholder="Buscar evento..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)} className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500" />
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
          <label className="relative flex items-center">
            <select value={state} onChange={(e) => updateParams('state', e.target.value)} className="appearance-none rounded-xl border border-white/10 bg-black/50 py-2.5 pl-4 pr-10 text-sm font-medium text-slate-300 outline-none focus:border-fuchsia-500">
              {STATES.map((item) => (
                <option key={item.value} value={item.value}>{item.label}</option>
              ))}
            </select>
            <Icon name="chevronDown" size={16} className="absolute right-3 text-white pointer-events-none" />
          </label>
          <label className="relative flex items-center">
            <select value={sort} onChange={(e) => updateParams('sort', e.target.value)} className="appearance-none rounded-xl border border-white/10 bg-black/50 py-2.5 pl-4 pr-10 text-sm font-medium text-slate-300 outline-none focus:border-fuchsia-500">
              {SORT_OPTIONS.map((item) => (
                <option key={item.value} value={item.value}>{item.label}</option>
              ))}
            </select>
            <Icon name="chevronDown" size={16} className="absolute right-3 text-white pointer-events-none" />
          </label>
        </div>
        <div className="text-sm text-slate-400">
          Mostrando {events.length} de {total.toLocaleString('es-MX')} eventos
        </div>
      </div>

      {source === 'fallback' && !loading && (
        <p className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
          Ticketmaster no respondió en este momento, así que se muestran los eventos de respaldo.
        </p>
      )}

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
            {LIMIT_OPTIONS.map(n => <option key={n} value={n}>{n} eventos</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <button disabled={page === 1} onClick={() => updateParams('page', page - 1)} className="rounded-lg bg-white/5 px-4 py-2 text-sm text-white disabled:opacity-50 hover:bg-white/10 transition">Anterior</button>
          <span className="text-sm text-slate-400 font-medium px-4">Página {Math.min(page, totalPages)} de {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => updateParams('page', page + 1)} className="rounded-lg bg-white/5 px-4 py-2 text-sm text-white disabled:opacity-50 hover:bg-white/10 transition">Siguiente</button>
        </div>
      </div>

    </div>
  );
}
