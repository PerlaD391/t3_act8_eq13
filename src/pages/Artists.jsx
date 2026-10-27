import Icon from '../components/Icon';

const initialArtists = [
  { id: "BRD-01", name: "Essence", specialty: "Maquillaje Low-Cost", location: "Alemania", image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=300&auto=format&fit=crop" },
  { id: "BRD-02", name: "Glam Beauty", specialty: "Cuidado de la Piel", location: "EE. UU.", image: "https://images.unsplash.com/photo-1617897903246-719242758050?q=80&w=300&auto=format&fit=crop" },
  { id: "BRD-03", name: "Velvet Lux", specialty: "Perfumes y Fragancias", location: "Francia", image: "https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=300&auto=format&fit=crop" },
  { id: "BRD-04", name: "Pat McGrath Labs", specialty: "Alta Costura / Makeup Artist", location: "Reino Unido", image: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?q=80&w=300&auto=format&fit=crop" },
  { id: "BRD-05", name: "Red Apple Lipstick", specialty: "Cosméticos Veganos", location: "EE. UU.", image: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?q=80&w=300&auto=format&fit=crop" },
];

export default function Artists() {
  return (
    <div className="mx-auto max-w-[1440px]">
      <div className="mb-8">
        <p className="mb-1 text-sm font-bold tracking-widest text-fuchsia-500 uppercase">Top del Momento</p>
        <h2 className="text-3xl font-extrabold text-white">Marcas y Makeup</h2>
        <p className="mt-2 text-slate-400">Descubre los creadores y marcas destacadas en GlamVibe.</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {initialArtists.map((artist) => (
          <div key={artist.id} className="group overflow-hidden rounded-3xl border border-white/5 bg-white/5 backdrop-blur-md transition-all hover:-translate-y-1 hover:bg-white/10">
            <div className="relative h-48 w-full overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] to-transparent z-10" />
              <img src={artist.image} alt={artist.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
              <span className="absolute top-3 right-3 z-20 rounded-full bg-fuchsia-600/80 backdrop-blur-md px-3 py-1 text-[10px] font-bold text-white uppercase tracking-wider border border-white/10 shadow-lg flex items-center gap-1">
                <Icon name="star" size={12} /> Brand
              </span>
            </div>
            <div className="p-5 relative z-20">
              <h3 className="text-lg font-bold text-white mb-1">{artist.name}</h3>
              <p className="text-sm font-medium text-fuchsia-400 mb-3">{artist.specialty}</p>
              <div className="flex items-center gap-2 text-xs text-slate-400 border-t border-white/5 pt-3">
                <Icon name="map-pin" size={14} /> {artist.location}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}