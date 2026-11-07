import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchEventById } from '../services/api';
import Icon from '../components/Icon';

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
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

  const handleAgendar = () => {
    setAgendado(true);
    // Opcional: guardar en localStorage
    const misEventos = JSON.parse(localStorage.getItem('misEventos') || '[]');
    if (!misEventos.find(e => e.id === id)) {
      misEventos.push({ id, name: event.name, date: event.dates?.start?.localDate });
      localStorage.setItem('misEventos', JSON.stringify(misEventos));
    }
    alert('¡Evento agendado con éxito! Lo verás marcado como agendado cuando vuelvas a esta página.');
  };

  if (loading) return <div className="text-center py-20 text-fuchsia-400 animate-pulse font-bold text-xl">Cargando detalles...</div>;
  if (!event) return <div className="text-center py-20 text-red-400">Evento no encontrado.</div>;

  const imageUrl = event.images?.[0]?.url || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&q=80';
  const date = event.dates?.start?.localDate || 'Fecha por confirmar';
  const time = event.dates?.start?.localTime || 'Hora por confirmar';
  const venue = event._embedded?.venues?.[0]?.name || 'Lugar por confirmar';
  const address = event._embedded?.venues?.[0]?.address?.line1 || '';
  const category = event.classifications?.[0]?.segment?.name || 'Cultura';
  const price = event.priceRanges?.[0] ? `$${event.priceRanges[0].min} - $${event.priceRanges[0].max} MXN` : 'Entrada libre / Consultar';
  const info = event.info || event.pleaseNote || 'No hay descripción disponible para este evento.';

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
        </div>

        {/* Información */}
        <div className="w-full lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center">
          <h1 className="text-3xl lg:text-4xl font-extrabold text-white mb-4 leading-tight">{event.name}</h1>
          
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
                <p>{venue} {address && `- ${address}`}</p>
              </div>
            </div>

            <div className="flex items-start gap-4 text-slate-300">
              <div className="bg-white/5 p-2 rounded-lg text-fuchsia-400"><Icon name="briefcase" size={20} /></div>
              <div>
                <p className="font-semibold text-white">Precio</p>
                <p>{price}</p>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-semibold text-white mb-2">Acerca del evento</h3>
            <p className="text-slate-400 leading-relaxed">{info}</p>
          </div>

          <button 
            onClick={handleAgendar}
            disabled={agendado}
            className={`w-full py-4 rounded-xl font-bold text-lg transition flex items-center justify-center gap-2 ${
              agendado 
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50' 
              : 'bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white hover:opacity-90 shadow-[0_0_20px_rgba(217,70,239,0.4)]'
            }`}
          >
            {agendado ? (
              <><Icon name="star" size={20} /> ¡Agendado!</>
            ) : (
              <><Icon name="calendar" size={20} /> Agendar Evento</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}