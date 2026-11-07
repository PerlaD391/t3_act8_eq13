import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../components/Icon';

// Todos los eventos agendados: próximos primero y, abajo, los que ya
// pasaron. Se guardan en localStorage (clave "misEventos") desde el
// detalle del evento.
const readSaved = () => {
  try {
    return JSON.parse(localStorage.getItem('misEventos') || '[]');
  } catch {
    return [];
  }
};

export default function MisEventos() {
  const navigate = useNavigate();
  const [saved, setSaved] = useState(() => readSaved());

  useEffect(() => {
    setSaved(readSaved());
  }, []);

  const removeEvent = (id) => {
    const next = saved.filter((e) => e.id !== id);
    localStorage.setItem('misEventos', JSON.stringify(next));
    setSaved(next);
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const withDays = saved.map((event) => {
    const date = event.date ? new Date(`${event.date}T00:00:00`) : null;
    const daysLeft = date ? Math.round((date - today) / (1000 * 60 * 60 * 24)) : null;
    return { ...event, daysLeft };
  });
  const upcoming = withDays
    .filter((e) => e.daysLeft === null || e.daysLeft >= 0)
    .sort((a, b) => (a.date || '').localeCompare(b.date || ''));
  const past = withDays
    .filter((e) => e.daysLeft !== null && e.daysLeft < 0)
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  const renderCard = (event) => (
    <article key={event.id} className="rounded-3xl border border-white/5 bg-white/5 p-6 backdrop-blur-md">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="text-lg font-bold text-white leading-snug">{event.name}</h3>
          <p className="mt-1 text-sm text-slate-400">
            {event.date || 'Fecha por confirmar'}
            {event.time ? ` a las ${event.time}` : ''}
          </p>
          {(event.venue || event.city || event.state) && (
            <p className="mt-1 flex items-center gap-1 text-sm text-slate-400">
              <Icon name="map-pin" size={14} className="shrink-0" />
              {[event.venue, event.city, event.state].filter(Boolean).join(' · ')}
            </p>
          )}
        </div>
        <span className="shrink-0 rounded-full bg-fuchsia-500/20 px-3 py-1 text-xs font-bold text-fuchsia-300">
          {event.daysLeft === null
            ? 'Agendado'
            : event.daysLeft === 0
              ? '¡Es hoy!'
              : event.daysLeft === 1
                ? 'Mañana'
                : event.daysLeft > 0
                  ? `En ${event.daysLeft} días`
                  : 'Ya pasó'}
        </span>
      </div>
      <div className="mt-5 flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => navigate(`/event/${event.id}`)}
          className="flex-1 rounded-xl bg-white/10 hover:bg-white/20 transition px-4 py-2.5 text-sm font-bold text-white border border-white/10"
        >
          Ver detalle
        </button>
        {event.url && (
          <a
            href={event.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-fuchsia-600 to-violet-600 px-4 py-2.5 text-sm font-bold text-white transition hover:opacity-90"
          >
            <Icon name="ticket" size={16} /> Comprar boletos
          </a>
        )}
        <button
          onClick={() => removeEvent(event.id)}
          className="flex items-center justify-center gap-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 transition px-4 py-2.5 text-sm font-bold text-red-300 border border-red-500/30"
        >
          <Icon name="trash" size={16} /> Quitar
        </button>
      </div>
    </article>
  );

  return (
    <div className="mx-auto max-w-[1440px]">
      <div className="mb-8">
        <p className="mb-1 text-sm font-bold tracking-widest text-fuchsia-500 uppercase">Tu agenda</p>
        <h2 className="text-3xl font-extrabold text-white">Mis eventos</h2>
        <p className="mt-2 text-slate-400">Los eventos que agendaste desde su detalle. Aquí los ves todos juntos y puedes quitar los que ya no quieras.</p>
      </div>

      {saved.length === 0 ? (
        <div className="rounded-3xl border border-white/5 bg-white/5 p-10 text-center">
          <p className="text-lg font-bold text-white">Aún no tienes eventos agendados</p>
          <p className="mt-2 text-slate-400">Explora la cartelera y toca “Agendar Evento” en el que te guste.</p>
          <button onClick={() => navigate('/catalog')} className="mt-6 rounded-xl bg-gradient-to-r from-fuchsia-600 to-violet-600 px-6 py-3 text-sm font-bold text-white transition hover:opacity-90">
            Ver cartelera
          </button>
        </div>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2">
            {upcoming.map(renderCard)}
          </div>
          {past.length > 0 && (
            <>
              <h3 className="mt-12 mb-4 text-xl font-bold text-white">Eventos pasados</h3>
              <div className="grid gap-6 md:grid-cols-2 opacity-70">
                {past.map(renderCard)}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
