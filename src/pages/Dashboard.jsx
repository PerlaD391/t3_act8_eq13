import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchProducts } from '../services/api';
import Icon from '../components/Icon';

export default function Dashboard() {
  const navigate = useNavigate();
  const [previewProducts, setPreviewProducts] = useState([]);
  const [loadingPreview, setLoadingPreview] = useState(true);

  // Cargar una pequeña vista previa de 4 productos al entrar al Dashboard
  useEffect(() => {
    fetchProducts({ limit: 4, skip: 0, search: '', category: '' })
      .then(data => setPreviewProducts(data.products || []))
      .catch(err => console.error(err))
      .finally(() => setLoadingPreview(false));
  }, []);

  return (
    <div className="mx-auto max-w-[1440px]">
      {/* HERO SECTION (Estilo Neón / Maquillaje) */}
      <div 
        className="relative mb-8 overflow-hidden rounded-3xl border border-white/10 bg-slate-900 shadow-[0_0_50px_rgba(217,70,239,0.15)]"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=2070&auto=format&fit=crop")',
          backgroundSize: 'cover', backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/70 to-transparent"></div>
        <div className="absolute inset-0 bg-fuchsia-900/20 mix-blend-overlay"></div>
        
        <div className="relative z-10 flex flex-col justify-end p-8 sm:p-12 h-[400px]">
          <p className="mb-2 flex items-center gap-2 text-sm font-bold tracking-widest text-[#f0abfc] uppercase drop-shadow-md">
            <Icon name="star" size={16} /> Nueva Colección 2026
          </p>
          <h2 className="text-4xl font-extrabold tracking-[-.02em] text-white sm:text-5xl lg:text-6xl max-w-3xl leading-tight drop-shadow-xl">
            Descubre el arte del maquillaje y la belleza
          </h2>
          <p className="mt-4 max-w-2xl text-lg text-slate-300">Gestiona el catálogo de productos, marcas y artistas de la plataforma de cosméticos más grande.</p>
          <button onClick={() => navigate('/catalog')} className="mt-8 w-fit flex items-center gap-2 rounded-xl bg-gradient-to-r from-fuchsia-600 to-violet-600 px-6 py-3.5 text-sm font-bold text-white transition hover:opacity-90 shadow-[0_0_20px_rgba(217,70,239,0.5)]">
            Ver Todo el Catálogo <Icon name="chevronRight" size={18} />
          </button>
        </div>
      </div>

      {/* TARJETAS DE ESTADÍSTICAS */}
      <section className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { title: "Productos Activos", value: "194", note: "En DummyJSON", icon: "image", tone: "text-fuchsia-400 bg-fuchsia-500/20", target: "/catalog" },
          { title: "Marcas Registradas", value: "24", note: "+3 este mes", icon: "users", tone: "text-violet-400 bg-violet-500/20", target: "/artists" },
          { title: "Categorías", value: "24", note: "Labiales, Perfumes...", icon: "palette", tone: "text-pink-400 bg-pink-500/20", target: "/catalog" },
          { title: "Ventas (Simuladas)", value: "$8,450", note: "+18% vs mes anterior", icon: "star", tone: "text-emerald-400 bg-emerald-500/20", target: "/catalog" },
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

      {/* SECCIÓN INFERIOR: Vista Previa de Productos y Tendencias */}
      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        
        {/* VISTA PREVIA DE PRODUCTOS */}
        <section className="rounded-3xl border border-white/5 bg-white/5 backdrop-blur-md flex flex-col">
          <div className="flex items-center justify-between border-b border-white/5 p-6">
            <div>
              <h3 className="font-bold text-white text-lg">Vista Previa de Productos</h3>
              <p className="text-sm text-slate-400">Los mejores cosméticos disponibles</p>
            </div>
            <button onClick={() => navigate('/catalog')} className="text-sm font-semibold text-fuchsia-400 hover:text-fuchsia-300">
              Ver catálogo completo
            </button>
          </div>
          
          <div className="flex-1 divide-y divide-white/5">
            {loadingPreview ? (
              <div className="p-8 text-center text-slate-400 animate-pulse">Cargando productos...</div>
            ) : (
              previewProducts.map((p) => (
                <div 
                  key={p.id} 
                  onClick={() => navigate('/catalog')}
                  className="flex items-center gap-4 px-6 py-4 transition hover:bg-white/5 cursor-pointer group"
                >
                  <img src={p.thumbnail} alt={p.title} className="h-12 w-12 rounded-xl object-cover bg-black/50" />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-white truncate group-hover:text-fuchsia-300 transition-colors">{p.title}</p>
                    <p className="text-sm text-slate-400 capitalize">{p.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-white">${p.price}</p>
                    <span className="text-xs text-emerald-400">En stock</span>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div className="p-4 border-t border-white/5 bg-white/[0.02] rounded-b-3xl">
            <button onClick={() => navigate('/catalog')} className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 transition text-white font-semibold border border-white/10">
              Ir a la Tabla CRUD
            </button>
          </div>
        </section>
        
        {/* TENDENCIAS DE BELLEZA */}
        <section className="rounded-3xl border border-white/5 bg-white/5 p-6 backdrop-blur-md">
          <div className="mb-6 border-b border-white/5 pb-4">
            <h3 className="font-bold text-white text-lg">Tendencias de Belleza</h3>
            <p className="text-sm text-slate-400">Inspiración visual</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="group relative overflow-hidden rounded-xl cursor-pointer">
              <img src="https://images.unsplash.com/photo-1586495777744-4413f21062fa?q=80&w=400&auto=format&fit=crop" alt="Labiales" className="h-32 w-full object-cover transition-transform duration-500 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-3"><span className="text-sm font-bold text-white">Labiales Mate</span></div>
            </div>
            <div className="group relative overflow-hidden rounded-xl cursor-pointer">
              <img src="https://images.unsplash.com/photo-1512496015851-a90fb38ba796?q=80&w=400&auto=format&fit=crop" alt="Paletas" className="h-32 w-full object-cover transition-transform duration-500 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-3"><span className="text-sm font-bold text-white">Sombras Neón</span></div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}