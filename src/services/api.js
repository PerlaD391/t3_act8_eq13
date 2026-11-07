const DUMMY_BASE = 'https://dummyjson.com';
// Llave de Ticketmaster: SOLO en el archivo .env (VITE_TICKETMASTER_API_KEY).
// Nunca va en el código: la llave anterior quedó expuesta en el historial
// de git, así que hay que generar una nueva en Ticketmaster y ponerla en
// el .env. Sin llave, la app muestra los eventos de respaldo.
const TM_API_KEY = import.meta.env.VITE_TICKETMASTER_API_KEY || '';

export const loginUser = async (username, password) => {
  const res = await fetch(`${DUMMY_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, expiresInMins: 30 }),
  });
  if (!res.ok) throw new Error('Usuario o contraseña incorrectos');
  return res.json();
};

const getFutureDate = (daysAhead) => {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return d.toISOString().split('T')[0];
};

const eventosNacionalesRespaldo = [
  { id: 'mx-1', name: 'Concierto Sinfónico Nacional', dates: { start: { localDate: getFutureDate(10) } }, _embedded: { venues: [{ name: 'Palacio de Bellas Artes', state: { name: 'Ciudad de México', stateCode: 'CDMX' } }] }, classifications: [{ segment: { name: 'Music' } }], images: [{ url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&q=80' }], priceRanges: [{ min: 500, max: 1500 }], info: 'Disfruta de una noche mágica con la Orquesta Sinfónica Nacional interpretando las mejores piezas clásicas.' },
  { id: 'mx-2', name: 'Festival de Teatro de CDMX', dates: { start: { localDate: getFutureDate(15) } }, _embedded: { venues: [{ name: 'Teatro Insurgentes', state: { name: 'Ciudad de México', stateCode: 'CDMX' } }] }, classifications: [{ segment: { name: 'Arts & Theatre' } }], images: [{ url: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=600&q=80' }], priceRanges: [{ min: 200, max: 600 }], info: 'Las mejores compañías teatrales se reúnen para presentar obras clásicas y contemporáneas.' },
  { id: 'mx-3', name: 'Noche de Jazz en Guadalajara', dates: { start: { localDate: getFutureDate(20) } }, _embedded: { venues: [{ name: 'Teatro Degollado', state: { name: 'Jalisco', stateCode: 'JAL' } }] }, classifications: [{ segment: { name: 'Music' } }], images: [{ url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&q=80' }], priceRanges: [{ min: 300, max: 800 }], info: 'Una velada íntima con los mejores exponentes del jazz nacional e internacional.' },
  { id: 'mx-4', name: 'Exposición de Arte Contemporáneo', dates: { start: { localDate: getFutureDate(25) } }, _embedded: { venues: [{ name: 'Museo de Arte Moderno', state: { name: 'Ciudad de México', stateCode: 'CDMX' } }] }, classifications: [{ segment: { name: 'Arts & Theatre' } }], images: [{ url: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&q=80' }], priceRanges: [{ min: 50, max: 100 }], info: 'Explora las nuevas tendencias del arte visual con obras de artistas emergentes.' },
  { id: 'mx-5', name: 'Feria del Libro Monterrey', dates: { start: { localDate: getFutureDate(30) } }, _embedded: { venues: [{ name: 'Cintermex', state: { name: 'Nuevo León', stateCode: 'NL' } }] }, classifications: [{ segment: { name: 'Miscellaneous' } }], images: [{ url: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=600&q=80' }], priceRanges: [{ min: 0, max: 0 }], info: 'Encuentros con autores, presentaciones de libros y talleres literarios para toda la familia.' },
];

// ---------------------------------------------------------------------------
// Ticketmaster: la API no permite paginar más allá de 1,000 resultados en
// una sola consulta (page * size < 1,000, error DIS1035). Para llegar a todos
// los eventos de México (~2,200 en 6 meses) la consulta se divide en
// ventanas de fechas: cada ventana se mide primero (size=1) y, si tiene
// 1,000 o más eventos, se parte por la mitad hasta que cada ventana quede
// por debajo del límite. Luego se juntan, se quitan duplicados y se ordenan
// por fecha. Así el catálogo puede mostrar el total real y paginarlo.
// ---------------------------------------------------------------------------

const TM_PAGE_SIZE = 200; // máximo por página en la API de descubrimiento
const TM_MAX_PAGING = 1000; // page * size debe ser < 1,000
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutos por combinación de filtros

const eventsCache = new Map();

const formatDateTime = (date) => date.toISOString().split('.')[0] + 'Z';

const buildTicketmasterUrl = (params) => {
  const query = new URLSearchParams({
    apikey: TM_API_KEY,
    countryCode: 'MX',
    sort: 'date,asc',
    ...params,
  });
  return `/api-ticketmaster/events.json?${query.toString()}`;
};

const fetchJson = async (url) => {
  const res = await fetch(url);
  if (!res.ok) return null;
  return res.json();
};

// Corre varias promesas con un máximo de tareas en paralelo para no
// saturar la API (límite de peticiones por segundo).
const runWithConcurrency = async (tasks, limit = 5) => {
  const results = [];
  let index = 0;
  const workers = Array.from({ length: Math.min(limit, tasks.length) }, async () => {
    while (index < tasks.length) {
      const current = index;
      index += 1;
      results[current] = await tasks[current]();
    }
  });
  await Promise.all(workers);
  return results;
};

// Devuelve las ventanas de fechas (hojas) que cubren [start, end], cada una
// con menos de 1,000 eventos. Si una ventana es demasiado grande, se divide.
const splitWindows = async (start, end, baseParams, depth = 0) => {
  const totalUrl = buildTicketmasterUrl({
    ...baseParams,
    size: '1',
    startDateTime: formatDateTime(start),
    endDateTime: formatDateTime(end),
  });
  const data = await fetchJson(totalUrl).catch(() => null);
  const total = data?.page?.totalElements ?? 0;
  if (total === 0) return [];
  if (total < TM_MAX_PAGING || depth >= 5) {
    return [{ start, end, total }];
  }
  const mid = new Date((start.getTime() + end.getTime()) / 2);
  const [first, second] = await Promise.all([
    splitWindows(start, mid, baseParams, depth + 1),
    splitWindows(mid, end, baseParams, depth + 1),
  ]);
  return [...first, ...second];
};

const fetchWindowEvents = async (window, baseParams) => {
  const pages = Math.ceil(window.total / TM_PAGE_SIZE);
  const tasks = Array.from({ length: pages }, (_, page) => async () => {
    const url = buildTicketmasterUrl({
      ...baseParams,
      size: String(TM_PAGE_SIZE),
      page: String(page),
      startDateTime: formatDateTime(window.start),
      endDateTime: formatDateTime(window.end),
    });
    const data = await fetchJson(url).catch(() => null);
    return data?._embedded?.events || [];
  });
  const results = await runWithConcurrency(tasks, 5);
  return results.flat();
};

const fetchAllEvents = async ({ search = '', category = '', state = '' }) => {
  const cacheKey = JSON.stringify({ search, category, state });
  const cached = eventsCache.get(cacheKey);
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return cached;
  }

  const today = new Date();
  const endDate = new Date(today);
  endDate.setMonth(today.getMonth() + 6);

  const baseParams = {};
  if (search) baseParams.keyword = search;
  if (category && category !== 'all') baseParams.classificationName = category;
  if (state && state !== 'all') baseParams.stateCode = state;

  let merged = [];
  let source = 'ticketmaster';
  try {
    const windows = await splitWindows(today, endDate, baseParams);
    const results = await runWithConcurrency(
      windows.map((window) => () => fetchWindowEvents(window, baseParams)),
      3,
    );
    merged = results.flat();
  } catch (error) {
    console.warn('Error al conectar con Ticketmaster. Usando eventos de respaldo.', error);
    merged = [];
  }

  // Quitar duplicados (las ventanas se tocan en los bordes) y ordenar por fecha.
  const seen = new Set();
  merged = merged.filter((event) => {
    if (!event?.id || seen.has(event.id)) return false;
    seen.add(event.id);
    return true;
  });
  merged.sort((a, b) => {
    const dateA = a.dates?.start?.localDate || '';
    const dateB = b.dates?.start?.localDate || '';
    if (dateA === dateB) return (a.name || '').localeCompare(b.name || '');
    return dateA.localeCompare(dateB);
  });

  if (merged.length === 0) {
    source = 'fallback';
    merged = eventosNacionalesRespaldo.filter((event) => {
      if (search && !event.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (category && category !== 'all' && event.classifications?.[0]?.segment?.name !== category) return false;
      if (state && state !== 'all' && event._embedded?.venues?.[0]?.state?.stateCode !== state) return false;
      return true;
    });
  }

  const result = { events: merged, total: merged.length, source };
  eventsCache.set(cacheKey, { ...result, fetchedAt: Date.now() });
  return result;
};

export const fetchEvents = async ({ limit = 12, page = 1, search = '', category = '', state = '', sort = 'date-asc' }) => {
  const safeLimit = [12, 24, 48].includes(Number(limit)) ? Number(limit) : 12;
  const safePage = Math.max(1, Number(page) || 1);
  const { events, total, source } = await fetchAllEvents({ search, category, state });
  const sorted = [...events];
  const eventDate = (e) => e.dates?.start?.localDate || '';
  const eventTime = (e) => e.dates?.start?.localTime || '';
  const eventPrice = (e) => e.priceRanges?.[0]?.min ?? null;
  if (sort === 'date-desc') {
    sorted.sort((a, b) => eventDate(b).localeCompare(eventDate(a)) || eventTime(b).localeCompare(eventTime(a)) || (a.name || '').localeCompare(b.name || ''));
  } else if (sort === 'price-asc') {
    sorted.sort((a, b) => {
      const pa = eventPrice(a);
      const pb = eventPrice(b);
      if (pa === null && pb === null) return eventDate(a).localeCompare(eventDate(b));
      if (pa === null) return 1;
      if (pb === null) return -1;
      return pa - pb || eventDate(a).localeCompare(eventDate(b));
    });
  } else if (sort === 'price-desc') {
    sorted.sort((a, b) => {
      const pa = eventPrice(a);
      const pb = eventPrice(b);
      if (pa === null && pb === null) return eventDate(a).localeCompare(eventDate(b));
      if (pa === null) return 1;
      if (pb === null) return -1;
      return pb - pa || eventDate(a).localeCompare(eventDate(b));
    });
  }
  const startIndex = (safePage - 1) * safeLimit;
  return {
    events: sorted.slice(startIndex, startIndex + safeLimit),
    total,
    source,
  };
};

// Artistas reales de la cartelera: se juntan las atracciones
// (_embedded.attractions) de todos los eventos cargados, se quitan
// duplicados y se ordenan por cantidad de eventos próximos.
export const fetchArtists = async ({ state = '' } = {}) => {
  const { events, source } = await fetchAllEvents({ state });
  const byId = new Map();
  events.forEach((event) => {
    (event._embedded?.attractions || []).forEach((attraction) => {
      if (!attraction?.id || !attraction?.name) return;
      const existing = byId.get(attraction.id) || {
        id: attraction.id,
        name: attraction.name,
        image: [...(attraction.images || [])].sort((a, b) => (b.width || 0) - (a.width || 0))[0]?.url || '',
        genre: attraction.classifications?.[0]?.genre?.name || attraction.classifications?.[0]?.segment?.name || '',
        segment: attraction.classifications?.[0]?.segment?.name || '',
        url: attraction.url || '',
        events: [],
      };
      existing.events.push({ id: event.id, name: event.name, date: event.dates?.start?.localDate || '' });
      byId.set(attraction.id, existing);
    });
  });
  const artists = [...byId.values()]
    .map((artist) => ({
      ...artist,
      eventCount: artist.events.length,
      nextDate: artist.events.map((e) => e.date).filter(Boolean).sort()[0] || '',
    }))
    .sort((a, b) => b.eventCount - a.eventCount || a.name.localeCompare(b.name));
  return { artists, source };
};

// Nueva función para obtener los detalles de un solo evento
export const fetchEventById = async (id) => {
  // Si el ID empieza con "mx-", significa que es un evento de respaldo
  if (id.startsWith('mx-')) {
    return eventosNacionalesRespaldo.find(e => e.id === id) || null;
  }

  try {
    const res = await fetch(`/api-ticketmaster/events/${id}.json?apikey=${TM_API_KEY}`);
    if (res.ok) {
      return await res.json();
    }
  } catch (error) {
    console.warn('Error al obtener el evento', error);
  }
  return null;
};
