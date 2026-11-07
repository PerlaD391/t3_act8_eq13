import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchEvents, fetchArtists } from '../services/api';
import Icon from '../components/Icon';

export default function Dashboard() {
  const navigate = useNavigate();
  const [previewEvents, setPreviewEvents] = useState([]);
  const [totalEvents, setTotalEvents] = useState(null);
  const [artistsCount, setArtistsCount] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(true);
  const [reminders, setReminders] = useState([]);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('misEventos') || '[]');
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const upcoming = saved
        .map((event) => {
          const date = event.date ? new Date(`${event.date}T00:00:00`) : null;
          const daysLeft = date ? Math.round((date - today) / (1000 * 60 * 60 * 24)) : null;
          return { ...event, daysLeft };
        })
        .filter((event) => event.daysLeft !== null && event.daysLeft >= 0 && event.daysLeft <= 7)
        .sort((a, b) => a.daysLeft - b.daysLeft);
      setReminders(upcoming);
    } catch {
      setReminders([]);
    }
  }, []);

  useEffect(() => {
    fetchEvents({ limit: 4, page: 1, search: '', category: '' })
      .then(data => { setPreviewEvents(data.events || []); setTotalEvents(data.total); })
      .catch(() => {})
      .finally(() => setLoadingPreview(false));
    fetchArtists()
      .then(({ artists }) => setArtistsCount(artists.length))
      .catch(() => {});
  }, []);

  return (
    <div className="mx-auto max-w-[1440px]">
      {/* HERO SECTION (Enfoque Nacional) */}
      <div className="relative mb-8 overflow-hidden rounded-3xl border border-white/10 bg-slate-900 shadow-[0_0_50px_rgba(217,70,239,0.15)]"
        style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1518659526054-190340b32735?q=80&w=2070&auto=format&fit=crop")', backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/70 to-transparent"></div>
        <div className="absolute inset-0 bg-fuchsia-900/20 mix-blend-overlay"></div>
        <div className="relative z-10 flex flex-col justify-end p-8 sm:p-12 h-[400px]">
          <p className="mb-2 flex items-center gap-2 text-sm font-bold tracking-widest text-[#f0abfc] uppercase drop-shadow-md"><Icon name="map-pin" size={16} /> Eventos en México</p>
          <h2 className="text-4xl font-extrabold tracking-[-.02em] text-white sm:text-5xl lg:text-6xl max-w-3xl leading-tight drop-shadow-xl">Vive la cultura en todo el país</h2>
          <p className="mt-4 max-w-2xl text-lg text-slate-300">Descubre conciertos, obras de teatro, danza y presentaciones de libros en las principales ciudades de la República.</p>
          <button onClick={() => navigate('/catalog')} className="mt-8 w-fit flex items-center gap-2 rounded-xl bg-gradient-to-r from-fuchsia-600 to-violet-600 px-6 py-3.5 text-sm font-bold text-white transition hover:opacity-90 shadow-[0_0_20px_rgba(217,70,239,0.5)]">Ver Cartelera Nacional <Icon name="chevronRight" size={18} /></button>
        </div>
      </div>

      <section className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { title: "Eventos Activos", value: totalEvents ? totalEvents.toLocaleString('es-MX') : '…', note: "En todo México", icon: "calendar", tone: "text-fuchsia-400 bg-fuchsia-500/20", target: "/catalog" },
          { title: "Categorías", value: "3", note: "Música, Teatro, Libros", icon: "palette", tone: "text-violet-400 bg-violet-500/20", target: "/catalog" },
          { title: "Artistas Locales", value: artistsCount ? artistsCount.toLocaleString('es-MX') : '…', note: "En la cartelera", icon: "users", tone: "text-pink-400 bg-pink-500/20", target: "/artists" },
          { title: "Próximo Evento", value: "Hoy", note: "Consulta la agenda", icon: "star", tone: "text-emerald-400 bg-emerald-500/20", target: "/catalog" },
        ].map((item, i) => (
          <article key={i} onClick={() => navigate(item.target)} className="group cursor-pointer rounded-3xl border border-white/5 bg-white/5 p-6 backdrop-blur-md transition-all hover:-translate-y-1 hover:bg-white/10 hover:border-white/20">
            <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl ${item.tone}`}><Icon name={item.icon} size={24} /></div>
            <div>
              <p className="text-sm font-medium text-slate-400">{item.title}</p>
              <p className="mt-1 text-[36px] font-extrabold tracking-[-.04em] text-white">{item.value}</p>
              <p className="mt-1 text-[12px] font-medium text-slate-500 group-hover:text-slate-400">{item.note}</p>
            </div>
          </article>
        ))}
      </section>

      {reminders.length > 0 && (
        <section className="mb-8 rounded-3xl border border-fuchsia-500/20 bg-fuchsia-500/10 p-6 backdrop-blur-md">
          <h3 className="font-bold text-white text-lg">Tus recordatorios</h3>
          <p className="text-sm text-slate-400">Eventos que agendaste para los próximos 7 días.</p>
          <div className="mt-4 space-y-2">
            {reminders.map((event) => (
              <div key={event.id} onClick={() => navigate(`/event/${event.id}`)} className="flex items-center justify-between gap-4 rounded-xl bg-black/30 px-4 py-3 cursor-pointer hover:bg-black/50 transition">
                <div className="min-w-0 flex-1">
                  <span className="font-semibold text-white truncate block">{event.name}</span>
                  {(event.venue || event.city || event.state) && (
                    <span className="text-xs text-slate-400 truncate block">
                      {[event.venue, event.city, event.state].filter(Boolean).join(' · ')}
                      {event.time ? ` · ${event.time}` : ''}
                    </span>
                  )}
                </div>
                <span className="shrink-0 rounded bg-fuchsia-500/20 px-2 py-1 text-xs text-fuchsia-300">
                  {event.daysLeft === 0 ? '¡Es hoy!' : event.daysLeft === 1 ? 'Mañana' : `En ${event.daysLeft} días`} · {event.date}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <section className="rounded-3xl border border-white/5 bg-white/5 backdrop-blur-md flex flex-col">
          <div className="flex items-center justify-between border-b border-white/5 p-6">
            <div><h3 className="font-bold text-white text-lg">Próximos Eventos</h3><p className="text-sm text-slate-400">Cartelera destacada</p></div>
            <button onClick={() => navigate('/catalog')} className="text-sm font-semibold text-fuchsia-400 hover:text-fuchsia-300">Ver todos</button>
          </div>
          <div className="flex-1 divide-y divide-white/5">
            {loadingPreview ? (
              <div className="p-8 text-center text-slate-400 animate-pulse">Cargando eventos...</div>
            ) : (
              previewEvents.map((ev) => (
                <div key={ev.id} onClick={() => navigate('/catalog')} className="flex items-center gap-4 px-6 py-4 transition hover:bg-white/5 cursor-pointer group">
                  {ev.images?.[0]?.url && <img src={ev.images[0].url} alt={ev.name} className="h-12 w-12 rounded-xl object-cover bg-black/50" />}
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-white truncate group-hover:text-fuchsia-300 transition-colors">{ev.name}</p>
                    <p className="text-sm text-slate-400">{ev.dates?.start?.localDate} · {ev._embedded?.venues?.[0]?.name}</p>
                  </div>
                  <div className="text-right"><span className="rounded bg-fuchsia-500/20 px-2 py-1 text-xs text-fuchsia-300">{ev.classifications?.[0]?.segment?.name}</span></div>
                </div>
              ))
            )}
          </div>
          <div className="p-4 border-t border-white/5 bg-white/[0.02] rounded-b-3xl">
            <button onClick={() => navigate('/catalog')} className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 transition text-white font-semibold border border-white/10">Ir a la cartelera</button>
          </div>
        </section>
        
        <section className="rounded-3xl border border-white/5 bg-white/5 p-6 backdrop-blur-md">
          <div className="mb-6 border-b border-white/5 pb-4"><h3 className="font-bold text-white text-lg">Cultura en México</h3><p className="text-sm text-slate-400">Tradiciones y arte</p></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="group relative overflow-hidden rounded-xl cursor-pointer">
              <img src="https://images.unsplash.com/photo-1599940824399-b87987ceb72a?fit=crop&w=400&q=80" alt="Alebrijes" className="h-32 w-full object-cover transition-transform duration-500 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-3"><span className="text-sm font-bold text-white">Artesanías</span></div>
            </div>
            <div className="group relative overflow-hidden rounded-xl cursor-pointer">
              <img src="https://images.unsplash.com/photo-1518638150340-f706e86654de?fit=crop&w=400&q=80" alt="Guelaguetza" className="h-32 w-full object-cover transition-transform duration-500 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-3"><span className="text-sm font-bold text-white">Danzas</span></div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}