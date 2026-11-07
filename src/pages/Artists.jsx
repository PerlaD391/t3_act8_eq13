import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchArtists } from '../services/api';
import Icon from '../components/Icon';

// Artesanos destacados: talento local que se muestra junto a los
// artistas de la cartelera de Ticketmaster.
const artesanosDestacados = [
  { id: "ART-01", name: "Taller de Barro Negro", specialty: "Alfarería Tradicional", location: "San Bartolo Coyotepec", image: "https://images.unsplash.com/photo-1610715936287-6c0f40816c14?fit=crop&w=300&q=80" },
  { id: "ART-02", name: "Tejedoras de Teotitlán", specialty: "Textiles y Telar de Cintura", location: "Teotitlán del Valle", image: "https://images.unsplash.com/photo-1605333396920-4b4e6b925443?fit=crop&w=300&q=80" },
  { id: "ART-03", name: "Taller de Alebrijes", specialty: "Tallado en Madera", location: "San Martín Tilcajete", image: "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?fit=crop&w=300&q=80" },
  { id: "ART-04", name: "Grupo Folklórico Xhavizende", specialty: "Danza y Música Tradicional", location: "Juchitán", image: "https://images.unsplash.com/photo-1518638150340-f706e86654de?fit=crop&w=300&q=80" },
  { id: "ART-05", name: "Colectivo de Pintores Oaxaqueños", specialty: "Pintura y Muralismo", location: "Oaxaca de Juárez", image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?fit=crop&w=300&q=80" },
];

export default function Artists() {
  const navigate = useNavigate();
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  // Artistas reales de los eventos que están en cartelera.
  useEffect(() => {
    fetchArtists()
      .then(({ artists }) => setArtists(artists))
      .catch(() => setArtists([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = artists.filter((artist) =>
    artist.name.toLowerCase().includes(query.trim().toLowerCase())
  );

  return (
    <div className="mx-auto max-w-[1440px]">
      <div className="mb-8">
        <p className="mb-1 text-sm font-bold tracking-widest text-fuchsia-500 uppercase">Artistas</p>
        <h2 className="text-3xl font-extrabold text-white">Artistas de la cartelera</h2>
        <p className="mt-2 text-slate-400">Quienes se presentan en los próximos eventos en todo México. Toca “Ver sus eventos” para ver su cartelera.</p>
      </div>

      <div className="mb-8 flex items-center gap-3 rounded-xl border border-white/10 bg-black/40 px-4 py-3 focus-within:border-violet-500 transition-all">
        <Icon name="search" size={19} className="text-slate-500" />
        <input
          type="text"
          placeholder="Buscar artista..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-600"
        />
      </div>

      {loading ? (
        <p className="text-center py-20 text-fuchsia-400 animate-pulse font-bold text-lg">Cargando artistas...</p>
      ) : filtered.length === 0 ? (
        <p className="text-center py-20 text-slate-400">No hay artistas con ese nombre en la cartelera actual.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((artist) => (
            <div key={artist.id} className="group overflow-hidden rounded-3xl border border-white/5 bg-white/5 backdrop-blur-md transition-all hover:-translate-y-1 hover:bg-white/10">
              <div className="relative h-48 w-full overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] to-transparent z-10" />
                {artist.image ? (
                  <img src={artist.image} alt={artist.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-600/40 to-fuchsia-600/40"><Icon name="users" size={48} className="text-white/60" /></div>
                )}
                <span className="absolute top-3 right-3 z-20 rounded-full bg-fuchsia-600/80 backdrop-blur-md px-3 py-1 text-[10px] font-bold text-white uppercase tracking-wider border border-white/10 shadow-lg flex items-center gap-1"><Icon name="star" size={12} /> Artista</span>
              </div>
              <div className="p-5 relative z-20">
                <h3 className="text-lg font-bold text-white mb-1">{artist.name}</h3>
                <p className="text-sm font-medium text-fuchsia-400 mb-3">{artist.genre || artist.segment || 'Artista'}</p>
                <p className="text-xs text-slate-400 mb-4">
                  {artist.eventCount} {artist.eventCount === 1 ? 'evento próximo' : 'eventos próximos'}
                  {artist.nextDate ? ` · Próximo: ${artist.nextDate}` : ''}
                </p>
                <button
                  onClick={() => navigate(`/catalog?q=${encodeURIComponent(artist.name)}`)}
                  className="w-full rounded-xl bg-white/10 hover:bg-fuchsia-600/80 transition px-4 py-2.5 text-sm font-bold text-white border border-white/10"
                >
                  Ver sus eventos
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Artesanos destacados */}
      <div className="mt-14 mb-8">
        <p className="mb-1 text-sm font-bold tracking-widest text-fuchsia-500 uppercase">Talento Oaxaqueño</p>
        <h2 className="text-3xl font-extrabold text-white">Artesanos destacados</h2>
        <p className="mt-2 text-slate-400">Descubre el arte y la cultura de los creadores de Oaxaca.</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {artesanosDestacados.map((artista) => (
          <div key={artista.id} className="group overflow-hidden rounded-3xl border border-white/5 bg-white/5 backdrop-blur-md transition-all hover:-translate-y-1 hover:bg-white/10">
            <div className="relative h-48 w-full overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] to-transparent z-10" />
              <img src={artista.image} alt={artista.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
              <span className="absolute top-3 right-3 z-20 rounded-full bg-fuchsia-600/80 backdrop-blur-md px-3 py-1 text-[10px] font-bold text-white uppercase tracking-wider border border-white/10 shadow-lg flex items-center gap-1"><Icon name="palette" size={12} /> Artesano</span>
            </div>
            <div className="p-5 relative z-20">
              <h3 className="text-lg font-bold text-white mb-1">{artista.name}</h3>
              <p className="text-sm font-medium text-fuchsia-400 mb-3">{artista.specialty}</p>
              <div className="flex items-center gap-2 text-xs text-slate-400 border-t border-white/5 pt-3"><Icon name="map-pin" size={14} /> {artista.location}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
