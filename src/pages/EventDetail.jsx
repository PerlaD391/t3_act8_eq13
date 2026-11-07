import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchEventById } from '../services/api';
import Icon from '../components/Icon';

// Precio con moneda y formato: gratis, precio único o rango.
const formatPrice = (priceRanges) => {
  const range = priceRanges?.[0];
  if (!range) return 'Consultar en Ticketmaster';
  const currency = range.currency || 'MXN';
  const min = range.min ?? null;
  const max = range.max ?? null;
  if (min === 0 && max === 0) return 'Evento gratuito';
  if (min != null && max != null && min === max) return `$${min.toLocaleString('es-MX')} ${currency}`;
  if (min != null && max != null) return `$${min.toLocaleString('es-MX')} - $${max.toLocaleString('es-MX')} ${currency}`;
  return 'Consultar en Ticketmaster';
};

const STATUS_LABELS = {
  onsale: 'Boletos a la venta',
  offsale: 'Venta cerrada',
  cancelled: 'Cancelado',
  postponed: 'Pospuesto',
  rescheduled: 'Reprogramado',
};

// Enlace para agregar el evento a Google Calendar (sin iniciar sesión,
// se abre en una pestaña nueva). Duración estimada: 2 horas.
const googleCalendarUrl = (event, locationText) => {
  const date = event.dates?.start?.localDate;
  if (!date) return null;
  const time = event.dates?.start?.localTime || '19:00:00';
  const start = new Date(`${date}T${time}`);
  if (Number.isNaN(start.getTime())) return null;
  const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
  const compact = (d) => `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}T${String(d.getHours()).padStart(2, '0')}${String(d.getMinutes()).padStart(2, '0')}00`;
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.name,
    dates: `${compact(start)}/${compact(end)}`,
    details: `Evento de CulturaVibe.${event.url ? ` Boletos: ${event.url}` : ''}`,
    location: locationText,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [agendado, setAgendado] = useState(() => {
    try {
      const misEventos = JSON.parse(localStorage.getItem('misEventos') || '[]');
      return misEventos.some(e => e.id === id);
    } catch {
      return false;
    }
  });

  useEffect(() => {
    setLoading(true);
    fetchEventById(id)
      .then(data => setEvent(data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  // Agendar / quitar de la agenda. Se guarda con fecha, hora y sede para
  // que el Dashboard lo muestre en "Tus recordatorios".
  const handleAgendar = () => {
    let misEventos = [];
    try {
      misEventos = JSON.parse(localStorage.getItem('misEventos') || '[]');
    } catch {
      misEventos = [];
    }
    if (agendado) {
      localStorage.setItem('misEventos', JSON.stringify(misEventos.filter(e => e.id !== id)));
      setAgendado(false);
      return;
    }
    if (!misEventos.find(e => e.id === id)) {
      misEventos.push({
        id,
        name: event.name,
        date: event.dates?.start?.localDate,
        time: event.dates?.start?.localTime,
        venue: event._embedded?.venues?.[0]?.name || '',
        city: event._embedded?.venues?.[0]?.city?.name || '',
        state: event._embedded?.venues?.[0]?.state?.name || '',
        url: event.url || '',
      });
      localStorage.setItem('misEventos', JSON.stringify(misEventos));
    }
    setAgendado(true);
  };

  if (loading) return <div className="text-center py-20 text-fuchsia-400 animate-pulse font-bold text-xl">Cargando detalles...</div>;
  if (!event) return <div className="text-center py-20 text-red-400">Evento no encontrado.</div>;

  const imageUrl = event.images?.[0]?.url || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&q=80';
  const date = event.dates?.start?.localDate || 'Fecha por confirmar';
  const time = event.dates?.start?.localTime || 'Hora por confirmar';
  const venueObj = event._embedded?.venues?.[0] || {};
  const venue = venueObj.name || 'Lugar por confirmar';
  const address = venueObj.address?.line1 || '';
  const city = venueObj.city?.name || '';
  const stateCode = venueObj.state?.stateCode || '';
  // Ticketmaster a veces trae el código DF sin nombre para la CDMX.
  const stateName = venueObj.state?.name || (stateCode === 'DF' ? 'Ciudad de México' : '');
  const placeLine = [address, city, stateName].filter(Boolean).join(', ');
  const category = event.classifications?.[0]?.segment?.name || 'Cultura';
  const price = formatPrice(event.priceRanges);
  const info = event.info || event.pleaseNote || 'No hay descripción disponible para este evento.';
  const attractions = event._embedded?.attractions || [];
  const statusLabel = STATUS_LABELS[event.dates?.status?.code] || '';
  const calendarUrl = googleCalendarUrl(event, [venue, city, stateName].filter(Boolean).join(', '));

  // Compartir el evento: por WhatsApp o copiando el enlace de esta página.
  const shareText = `${event.name} — ${date} a las ${time} en ${venue}${city ? `, ${city}` : ''}${stateName ? `, ${stateName}` : ''}. ${window.location.href}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
    } catch {
      const input = document.createElement('textarea');
      input.value = window.location.href;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="mx-auto max-w-[1200px]">
      <button onClick={() => navigate('/catalog')} className="mb-6 flex items-center gap-2 text-sm text-slate-400 hover:text-white transition">
        <Icon name="chevronLeft" size={18} /> Volver al catálogo
      </button>

      <div className="flex flex-col lg:flex-row gap-8 bg-[#0a0a0a] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">

        {/* Imagen del evento */}
        <div className="w-full lg:w-1/2 h-[400px] lg:h-auto relative">
          <img src={imageUrl} alt={event.name} className="w-full h-full object-cover" />
          <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10">
            <span className="text-xs font-bold text-fuchsia-400 uppercase tracking-wider">{category}</span>
          </div>
          {stateCode && (
            <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10">
              <span className="text-xs font-bold text-white uppercase tracking-wider">{stateCode}</span>
            </div>
          )}
        </div>

        {/* Información */}
        <div className="w-full lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center">
          <h1 className="text-3xl lg:text-4xl font-extrabold text-white mb-4 leading-tight">{event.name}</h1>
          {statusLabel && (
            <p className="mb-4 w-fit rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-300">{statusLabel}</p>
          )}

          <div className="space-y-4 mb-8">
            <div className="flex items-start gap-4 text-slate-300">
              <div className="bg-white/5 p-2 rounded-lg text-fuchsia-400"><Icon name="calendar" size={20} /></div>
              <div>
                <p className="font-semibold text-white">Fecha y Hora</p>
                <p>{date} a las {time}</p>
              </div>
            </div>

            <div className="flex items-start gap-4 text-slate-300">
              <div className="bg-white/5 p-2 rounded-lg text-fuchsia-400"><Icon name="map-pin" size={20} /></div>
              <div>
                <p className="font-semibold text-white">Lugar</p>
                <p>{venue}</p>
                {placeLine && <p className="text-sm text-slate-400">{placeLine}</p>}
                {stateName && <p className="text-sm font-semibold text-fuchsia-300">{stateName}{stateCode ? ` (${stateCode})` : ''}</p>}
              </div>
            </div>

            <div className="flex items-start gap-4 text-slate-300">
              <div className="bg-white/5 p-2 rounded-lg text-fuchsia-400"><Icon name="briefcase" size={20} /></div>
              <div>
                <p className="font-semibold text-white">Precio del boleto</p>
                <p>{price}</p>
              </div>
            </div>
          </div>

          {attractions.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-white mb-2">Artistas</h3>
              <div className="flex flex-wrap gap-2">
                {attractions.map((artist) => (
                  <span key={artist.id} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-slate-200">{artist.name}</span>
                ))}
              </div>
            </div>
          )}

          <div className="mb-8">
            <h3 className="text-lg font-semibold text-white mb-2">Acerca del evento</h3>
            <p className="text-slate-400 leading-relaxed">{info}</p>
          </div>

          {/* Comprar boletos: la venta se hace en Ticketmaster. Si la venta
              ya cerró o el evento se canceló, no se muestra el botón. */}
          {event.url && !['offsale', 'cancelled'].includes(event.dates?.status?.code) && (
            <a
              href={event.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mb-3 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-fuchsia-600 to-violet-600 px-5 py-4 text-lg font-bold text-white transition hover:opacity-90 shadow-[0_0_20px_rgba(217,70,239,0.4)]"
            >
              <Icon name="ticket" size={20} /> Comprar boletos en Ticketmaster <Icon name="external" size={16} />
            </a>
          )}
          {['offsale', 'cancelled'].includes(event.dates?.status?.code) && (
            <p className="mb-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
              La venta de boletos para este evento ya está cerrada.
            </p>
          )}

          <button
            onClick={handleAgendar}
            className={`flex w-full items-center justify-center gap-2 rounded-xl px-5 py-4 text-lg font-bold transition ${
              agendado
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'
                : 'bg-white/5 text-white border border-white/10 hover:bg-white/10'
            }`}
          >
            {agendado ? (
              <><Icon name="check" size={20} /> ¡Agendado! Toca para quitarlo de tu agenda</>
            ) : (
              <><Icon name="calendar" size={20} /> Agendar Evento</>
            )}
          </button>

          {/* Confirmación de agenda: qué quedó agendado y dónde verlo */}
          {agendado && (
            <div className="mt-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-200">
              <p className="font-bold text-emerald-300">¡Listo! Quedó en tu agenda.</p>
              <p className="mt-1">{date} a las {time} · {venue}{city ? `, ${city}` : ''}{stateName ? `, ${stateName}` : ''}.</p>
              <p className="mt-1 text-emerald-200/80">Lo verás en “Tus recordatorios” en el Dashboard.</p>
              {calendarUrl && (
                <a href={calendarUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-2 font-semibold text-emerald-300 underline underline-offset-2 hover:text-emerald-200">
                  <Icon name="calendar" size={16} /> Agregar a Google Calendar
                </a>
              )}
            </div>
          )}

          {/* Compartir */}
          <div className="mt-4 flex flex-col sm:flex-row gap-3">
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600/20 border border-emerald-500/40 px-4 py-3 text-sm font-bold text-emerald-300 hover:bg-emerald-600/30 transition">
              <Icon name="share" size={18} /> Compartir por WhatsApp
            </a>
            <button onClick={handleCopyLink} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm font-bold text-white hover:bg-white/10 transition">
              <Icon name={copied ? 'check' : 'share'} size={18} /> {copied ? '¡Enlace copiado!' : 'Copiar enlace'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
