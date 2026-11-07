const DUMMY_BASE = 'https://dummyjson.com';
const TM_API_KEY = 'gOd0zJv7QlALwTyGW2QA1ynHW3t4Zmcq';

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
  { id: 'mx-1', name: 'Concierto Sinfónico Nacional', dates: { start: { localDate: getFutureDate(10) } }, _embedded: { venues: [{ name: 'Palacio de Bellas Artes' }] }, classifications: [{ segment: { name: 'Music' } }], images: [{ url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&q=80' }], priceRanges: [{ min: 500, max: 1500 }], info: 'Disfruta de una noche mágica con la Orquesta Sinfónica Nacional interpretando las mejores piezas clásicas.' },
  { id: 'mx-2', name: 'Festival de Teatro de CDMX', dates: { start: { localDate: getFutureDate(15) } }, _embedded: { venues: [{ name: 'Teatro Insurgentes' }] }, classifications: [{ segment: { name: 'Arts & Theatre' } }], images: [{ url: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=600&q=80' }], priceRanges: [{ min: 200, max: 600 }], info: 'Las mejores compañías teatrales se reúnen para presentar obras clásicas y contemporáneas.' },
  { id: 'mx-3', name: 'Noche de Jazz en Guadalajara', dates: { start: { localDate: getFutureDate(20) } }, _embedded: { venues: [{ name: 'Teatro Degollado' }] }, classifications: [{ segment: { name: 'Music' } }], images: [{ url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&q=80' }], priceRanges: [{ min: 300, max: 800 }], info: 'Una velada íntima con los mejores exponentes del jazz nacional e internacional.' },
  { id: 'mx-4', name: 'Exposición de Arte Contemporáneo', dates: { start: { localDate: getFutureDate(25) } }, _embedded: { venues: [{ name: 'Museo de Arte Moderno' }] }, classifications: [{ segment: { name: 'Arts & Theatre' } }], images: [{ url: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&q=80' }], priceRanges: [{ min: 50, max: 100 }], info: 'Explora las nuevas tendencias del arte visual con obras de artistas emergentes.' },
  { id: 'mx-5', name: 'Feria del Libro Monterrey', dates: { start: { localDate: getFutureDate(30) } }, _embedded: { venues: [{ name: 'Cintermex' }] }, classifications: [{ segment: { name: 'Miscellaneous' } }], images: [{ url: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=600&q=80' }], priceRanges: [{ min: 0, max: 0 }], info: 'Encuentros con autores, presentaciones de libros y talleres literarios para toda la familia.' },
];

export const fetchEvents = async ({ limit = 10, page = 1, search = '', category = '' }) => {
  const today = new Date();
  const endDate = new Date(today); 
  endDate.setMonth(today.getMonth() + 6);
  
  const formatDate = (date) => date.toISOString().split('.')[0] + 'Z';
  const startDateTime = formatDate(today);
  const endDateTime = formatDate(endDate);

  let allEvents = [];

  try {
    let url = `/api-ticketmaster/events.json?apikey=${TM_API_KEY}&countryCode=MX&size=100&sort=date,asc&startDateTime=${startDateTime}&endDateTime=${endDateTime}`;
    if (search) url += `&keyword=${encodeURIComponent(search)}`;
    if (category && category !== 'all') url += `&classificationName=${encodeURIComponent(category)}`;

    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      allEvents = data._embedded?.events || [];
    }
  } catch (error) {
    console.warn('Error al conectar con Ticketmaster. Usando eventos de respaldo.', error);
  }

  if (allEvents.length === 0) allEvents = eventosNacionalesRespaldo;

  let filtered = allEvents;
  if (search) filtered = filtered.filter(e => e.name.toLowerCase().includes(search.toLowerCase()));
  if (category && category !== 'all') filtered = filtered.filter(e => e.classifications?.[0]?.segment?.name === category);

  const total = filtered.length;
  const startIndex = (page - 1) * limit;
  const paginated = filtered.slice(startIndex, startIndex + limit);

  return { events: paginated, total };
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