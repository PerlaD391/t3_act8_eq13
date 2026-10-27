import Icon from '../components/Icon';

export default function Settings({ role }) {
  return (
    <div className="mx-auto max-w-[1440px]">
      <div className="mb-8">
        <p className="mb-1 text-sm font-bold tracking-widest text-violet-500 uppercase">Sistema</p>
        <h2 className="text-3xl font-extrabold text-white">Configuración de la Cuenta</h2>
      </div>
      <section className="rounded-3xl border border-white/5 bg-white/5 p-12 text-center text-slate-400 backdrop-blur-md">
        <Icon name="settings" size={48} className="mx-auto text-slate-600 mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Panel de {role}</h3>
        <p>Ajustes específicos según el rol actual.</p>
      </section>
    </div>
  );
}