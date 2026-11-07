import Icon from '../components/Icon';

export default function Settings({ user, role }) {
  return (
    <div className="mx-auto max-w-[1440px]">
      <div className="mb-8">
        <p className="mb-1 text-sm font-bold tracking-widest text-fuchsia-500 uppercase">Sistema</p>
        <h2 className="text-3xl font-extrabold text-white">Configuración de la Cuenta</h2>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <section className="rounded-3xl border border-white/5 bg-white/5 p-8 backdrop-blur-md">
          <div className="flex items-center gap-4 mb-6">
            <img src={user?.image} alt="Avatar" className="h-16 w-16 rounded-full border-2 border-fuchsia-500 object-cover" />
            <div>
              <h3 className="text-xl font-bold text-white">{user?.firstName} {user?.lastName}</h3>
              <p className="text-sm text-fuchsia-400 font-semibold">{role}</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="border-b border-white/5 pb-2">
              <p className="text-xs text-slate-500 uppercase">Correo Electrónico</p>
              <p className="text-white">{user?.email}</p>
            </div>
            <div className="border-b border-white/5 pb-2">
              <p className="text-xs text-slate-500 uppercase">Teléfono</p>
              <p className="text-white">{user?.phone}</p>
            </div>
            <div className="border-b border-white/5 pb-2">
              <p className="text-xs text-slate-500 uppercase">Género</p>
              <p className="text-white capitalize">{user?.gender}</p>
            </div>
            <div className="pb-2">
              <p className="text-xs text-slate-500 uppercase">Edad</p>
              <p className="text-white">{user?.age} años</p>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-white/5 bg-white/5 p-8 backdrop-blur-md flex flex-col items-center justify-center text-center">
          <Icon name="settings" size={48} className="text-slate-600 mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Ajustes del Sistema</h3>
          <p className="text-slate-400 mb-6">Las opciones de configuración avanzada están deshabilitadas para la versión de demostración.</p>
          <button className="px-6 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition text-white font-semibold border border-white/10">Próximamente</button>
        </section>
      </div>
    </div>
  );
}