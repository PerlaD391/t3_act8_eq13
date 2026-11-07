import { useNavigate } from 'react-router-dom';
import Icon from './Icon';

export default function EventCard({ event }) {
  const navigate = useNavigate();

  // Extraemos los datos con valores por defecto para evitar errores
  const imageUrl = event.images?.[0]?.url || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&q=80';
  const title = event.name;
  const date = event.dates?.start?.localDate || 'Fecha por confirmar';
  const venue = event._embedded?.venues?.[0]?.name || 'Lugar por confirmar';
  const category = event.classifications?.[0]?.segment?.name || 'Cultura';
  
  // Formateamos el precio
  const price = event.priceRanges?.[0] 
    ? `$${event.priceRanges[0].min} - $${event.priceRanges[0].max}` 
    : 'Precio no disponible';

  return (
    <div 
      onClick={() => navigate(`/event/${event.id}`)}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/5 bg-[#0a0a0a] transition-all hover:-translate-y-1 hover:border-fuchsia-500/50 hover:shadow-[0_0_20px_rgba(217,70,239,0.15)] cursor-pointer"
    >
      {/* Imagen de fondo */}
      <div className="relative h-48 w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent z-10" />
        <img 
          src={imageUrl} 
          alt={title} 
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <span className="absolute top-3 right-3 z-20 rounded-full bg-black/60 backdrop-blur-md px-3 py-1 text-[10px] font-bold text-fuchsia-300 border border-fuchsia-500/30 shadow-lg flex items-center gap-1">
          <Icon name="star" size={12} /> {category}
        </span>
      </div>

      {/* Contenido */}
      <div className="flex flex-1 flex-col p-5 z-20">
        <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-fuchsia-300 transition-colors">
          {title}
        </h3>
        
        <div className="mt-auto space-y-2 text-sm text-slate-400">
          <p className="flex items-center gap-2"><Icon name="calendar" size={16} /> {date}</p>
          <p className="flex items-center gap-2"><Icon name="map-pin" size={16} /> {venue}</p>
          <p className="flex items-center gap-2 text-emerald-400 font-medium"><Icon name="briefcase" size={16} /> {price}</p>
        </div>

        <div className="mt-5 w-full rounded-xl bg-white/5 py-2 text-center text-xs font-semibold text-white transition group-hover:bg-fuchsia-600">
          Ver detalles y agendar
        </div>
      </div>
    </div>
  );
}