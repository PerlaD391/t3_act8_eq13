import { useEffect, useState } from 'react';
import Icon from '../components/Icon';
import {
  loadPreferences,
  savePreferences,
  defaultPreferences,
  NOTIFICATION_CATEGORIES,
  NOTIFICATION_STATES,
} from '../services/auth';

const CATEGORY_LABELS = {
  Music: 'Música',
  'Arts & Theatre': 'Teatro y Danza',
  Miscellaneous: 'Literatura / Otros',
};

const STATE_LABELS = {
  all: 'Todos los estados',
  CDMX: 'Ciudad de México',
  NL: 'Nuevo León',
  JAL: 'Jalisco',
  SIN: 'Sinaloa',
  MEX: 'Estado de México',
  PUE: 'Puebla',
  GRO: 'Guerrero',
  MOR: 'Morelos',
};

export default function Settings({ user, role }) {
  const [preferences, setPreferences] = useState(defaultPreferences());
  const [saved, setSaved] = useState(false);
  const [loadingPrefs, setLoadingPrefs] = useState(true);

  useEffect(() => {
    loadPreferences(user?.firebaseUid)
      .then(setPreferences)
      .finally(() => setLoadingPrefs(false));
  }, [user?.firebaseUid]);

  const toggleCategory = (category) => {
    setPreferences((prev) => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category],
    }));
  };

  const toggleState = (state) => {
    setPreferences((prev) => {
      if (state === 'all') return { ...prev, states: ['all'] };
      const withoutAll = prev.states.filter((s) => s !== 'all');
      const next = withoutAll.includes(state)
        ? withoutAll.filter((s) => s !== state)
        : [...withoutAll, state];
      return { ...prev, states: next.length ? next : ['all'] };
    });
  };

  const handleSave = async () => {
    await savePreferences(user?.firebaseUid, preferences);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const displayName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.name || 'Usuario';

  return (
    <div className="mx-auto max-w-[1440px]">
      <div className="mb-8">
        <p className="mb-1 text-sm font-bold tracking-widest text-fuchsia-500 uppercase">Sistema</p>
        <h2 className="text-3xl font-extrabold text-white">Configuración de la Cuenta</h2>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="rounded-3xl border border-white/5 bg-white/5 p-8 backdrop-blur-md">
          <div className="flex items-center gap-4 mb-6">
            {user?.image ? (
              <img src={user.image} alt="Avatar" className="h-16 w-16 rounded-full border-2 border-fuchsia-500 object-cover" />
            ) : (
              <span className="grid h-16 w-16 place-items-center rounded-full border-2 border-fuchsia-500 bg-fuchsia-500/20 text-2xl font-bold text-white">
                {displayName.charAt(0) || 'C'}
              </span>
            )}
            <div>
              <h3 className="text-xl font-bold text-white">{displayName}</h3>
              <p className="text-sm text-fuchsia-400 font-semibold">{role}</p>
              {user?.firebaseUid && <p className="text-xs text-emerald-400 font-medium">Cuenta verificada por correo</p>}
            </div>
          </div>

          <div className="space-y-4">
            <div className="border-b border-white/5 pb-2">
              <p className="text-xs text-slate-500 uppercase">Correo Electrónico</p>
              <p className="text-white">{user?.email || '—'}</p>
            </div>
            <div className="border-b border-white/5 pb-2">
              <p className="text-xs text-slate-500 uppercase">Teléfono</p>
              <p className="text-white">{user?.phone || '—'}</p>
            </div>
            {user?.gender && (
              <div className="border-b border-white/5 pb-2">
                <p className="text-xs text-slate-500 uppercase">Género</p>
                <p className="text-white capitalize">{user.gender}</p>
              </div>
            )}
            {user?.age && (
              <div className="pb-2">
                <p className="text-xs text-slate-500 uppercase">Edad</p>
                <p className="text-white">{user.age} años</p>
              </div>
            )}
          </div>
        </section>

        <section className="rounded-3xl border border-white/5 bg-white/5 p-8 backdrop-blur-md">
          <div className="mb-6 flex items-center gap-3">
            <Icon name="settings" size={28} className="text-fuchsia-400" />
            <div>
              <h3 className="text-xl font-bold text-white">Notificaciones y recordatorios</h3>
              <p className="text-sm text-slate-400">Elige de qué quieres enterarte y cómo.</p>
            </div>
          </div>

          {loadingPrefs ? (
            <p className="text-slate-400 animate-pulse">Cargando tus preferencias...</p>
          ) : (
            <div className="space-y-6">
              <div>
                <p className="mb-2 text-sm font-semibold text-slate-300">¿Cómo te avisamos?</p>
                <div className="space-y-2 text-sm text-slate-300">
                  <label className="flex items-center gap-3"><input type="checkbox" checked={preferences.channels.email} onChange={(e) => setPreferences((p) => ({ ...p, channels: { ...p.channels, email: e.target.checked } }))} className="h-4 w-4 accent-fuchsia-500" /> Por correo electrónico</label>
                  <label className="flex items-center gap-3"><input type="checkbox" checked={preferences.channels.sms} onChange={(e) => setPreferences((p) => ({ ...p, channels: { ...p.channels, sms: e.target.checked } }))} className="h-4 w-4 accent-fuchsia-500" /> Por SMS (requiere teléfono y envío de SMS activo)</label>
                  <label className="flex items-center gap-3"><input type="checkbox" checked={preferences.channels.app} onChange={(e) => setPreferences((p) => ({ ...p, channels: { ...p.channels, app: e.target.checked } }))} className="h-4 w-4 accent-fuchsia-500" /> Solo dentro de la app</label>
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm font-semibold text-slate-300">Categorías que te interesan</p>
                <div className="flex flex-wrap gap-2">
                  {NOTIFICATION_CATEGORIES.map((category) => (
                    <button key={category} type="button" onClick={() => toggleCategory(category)} className={`rounded-full px-4 py-2 text-xs font-semibold border transition ${preferences.categories.includes(category) ? 'bg-fuchsia-600 border-fuchsia-500 text-white' : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'}`}>
                      {CATEGORY_LABELS[category] || category}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm font-semibold text-slate-300">Estados</p>
                <div className="flex flex-wrap gap-2">
                  {NOTIFICATION_STATES.map((state) => (
                    <button key={state} type="button" onClick={() => toggleState(state)} className={`rounded-full px-4 py-2 text-xs font-semibold border transition ${preferences.states.includes(state) ? 'bg-fuchsia-600 border-fuchsia-500 text-white' : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'}`}>
                      {STATE_LABELS[state] || state}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm font-semibold text-slate-300">Recordatorios de tus eventos agendados</p>
                <div className="space-y-2 text-sm text-slate-300">
                  <label className="flex items-center gap-3"><input type="checkbox" checked={preferences.reminders.dayBefore} onChange={(e) => setPreferences((p) => ({ ...p, reminders: { ...p.reminders, dayBefore: e.target.checked } }))} className="h-4 w-4 accent-fuchsia-500" /> Un día antes</label>
                  <label className="flex items-center gap-3"><input type="checkbox" checked={preferences.reminders.dayOf} onChange={(e) => setPreferences((p) => ({ ...p, reminders: { ...p.reminders, dayOf: e.target.checked } }))} className="h-4 w-4 accent-fuchsia-500" /> El mismo día del evento</label>
                </div>
              </div>

              <button onClick={handleSave} className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-3 text-sm font-bold text-white transition hover:opacity-90">
                Guardar preferencias
              </button>
              {saved && <p className="text-center text-sm font-medium text-emerald-400">Preferencias guardadas.</p>}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
