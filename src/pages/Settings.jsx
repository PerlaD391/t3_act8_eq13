import { useEffect, useState } from 'react';
import Icon from '../components/Icon';
import {
  loadPreferences,
  savePreferences,
  defaultPreferences,
  NOTIFICATION_CATEGORIES,
  NOTIFICATION_STATES,
  getFirebaseProfile,
  updateFirebaseProfile,
  changeFirebasePassword,
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

export default function Settings({ user, role, setUser }) {
  const [preferences, setPreferences] = useState(defaultPreferences());
  const [saved, setSaved] = useState(false);
  const [loadingPrefs, setLoadingPrefs] = useState(true);

  // Perfil editable.
  const displayName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.name || 'Usuario';
  const [editName, setEditName] = useState(displayName);
  const [editPhone, setEditPhone] = useState(user?.phone || '');
  const [memberSince, setMemberSince] = useState('');
  const [profileMsg, setProfileMsg] = useState('');
  const [profileError, setProfileError] = useState('');

  // Contraseña (solo cuentas de Firebase).
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    loadPreferences(user?.firebaseUid)
      .then(setPreferences)
      .finally(() => setLoadingPrefs(false));
  }, [user?.firebaseUid]);

  useEffect(() => {
    setEditName(displayName);
    setEditPhone(user?.phone || '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.email, user?.firebaseUid]);

  useEffect(() => {
    if (!user?.firebaseUid) return;
    getFirebaseProfile(user.firebaseUid)
      .then((profile) => {
        if (profile?.createdAt) {
          setMemberSince(new Date(profile.createdAt).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' }));
        }
      })
      .catch(() => {});
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

  const handleSaveProfile = async () => {
    setProfileError('');
    setProfileMsg('');
    const name = editName.trim();
    if (!name) {
      setProfileError('Escribe tu nombre.');
      return;
    }
    try {
      if (user?.firebaseUid) {
        await updateFirebaseProfile({ name, phone: editPhone.trim() });
      }
      const [firstName, ...rest] = name.split(' ');
      const updated = { ...user, firstName: firstName || '', lastName: rest.join(' '), phone: editPhone.trim() };
      localStorage.setItem('user', JSON.stringify(updated));
      setUser?.(updated);
      setProfileMsg('Perfil actualizado.');
    } catch {
      setProfileError('No se pudo guardar el perfil. Inténtalo de nuevo.');
    }
  };

  const handleChangePassword = async () => {
    setPasswordError('');
    setPasswordMsg('');
    if (newPassword.length < 6) {
      setPasswordError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Las contraseñas no coinciden.');
      return;
    }
    try {
      await changeFirebasePassword(newPassword);
      setNewPassword('');
      setConfirmPassword('');
      setPasswordMsg('Contraseña actualizada.');
    } catch (err) {
      if (err?.code === 'auth/requires-recent-login') {
        setPasswordError('Por seguridad, cierra sesión y vuelve a entrar para cambiar tu contraseña.');
      } else if (err?.code === 'auth/weak-password') {
        setPasswordError('La contraseña debe tener al menos 6 caracteres.');
      } else {
        setPasswordError('No se pudo cambiar la contraseña. Inténtalo de nuevo.');
      }
    }
  };

  return (
    <div className="mx-auto max-w-[1440px]">
      <div className="mb-8">
        <p className="mb-1 text-sm font-bold tracking-widest text-fuchsia-500 uppercase">Sistema</p>
        <h2 className="text-3xl font-extrabold text-white">Configuración de la Cuenta</h2>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Perfil */}
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
              {memberSince && <p className="text-xs text-slate-400">Miembro desde {memberSince}</p>}
            </div>
          </div>

          <div className="space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-300">Nombre completo</span>
              <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-violet-500" />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-300">Teléfono (para avisos por SMS)</span>
              <input type="tel" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} placeholder="Ej. 55 1234 5678" className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-violet-500" />
            </label>
            <div className="border-b border-white/5 pb-2">
              <p className="text-xs text-slate-500 uppercase">Correo Electrónico</p>
              <p className="text-white">{user?.email || '—'}</p>
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
            {profileError && <p className="text-sm font-medium text-red-400">{profileError}</p>}
            {profileMsg && <p className="text-sm font-medium text-emerald-400">{profileMsg}</p>}
            <button onClick={handleSaveProfile} className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-3 text-sm font-bold text-white transition hover:opacity-90">
              Guardar perfil
            </button>
            {!user?.firebaseUid && <p className="text-center text-xs text-slate-500">Con la cuenta de prueba, los cambios solo se guardan en este navegador.</p>}
          </div>
        </section>

        {/* Contraseña */}
        <section className="rounded-3xl border border-white/5 bg-white/5 p-8 backdrop-blur-md">
          <div className="mb-6 flex items-center gap-3">
            <Icon name="lock" size={28} className="text-fuchsia-400" />
            <div>
              <h3 className="text-xl font-bold text-white">Cambiar contraseña</h3>
              <p className="text-sm text-slate-400">Solo para cuentas creadas con correo y contraseña.</p>
            </div>
          </div>
          {user?.firebaseUid ? (
            <div className="space-y-4">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-300">Nueva contraseña</span>
                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Mínimo 6 caracteres" className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-violet-500" />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-300">Confirmar nueva contraseña</span>
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repite la contraseña" className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-violet-500" />
              </label>
              {passwordError && <p className="text-sm font-medium text-red-400">{passwordError}</p>}
              {passwordMsg && <p className="text-sm font-medium text-emerald-400">{passwordMsg}</p>}
              <button onClick={handleChangePassword} className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-3 text-sm font-bold text-white transition hover:opacity-90">
                Cambiar contraseña
              </button>
            </div>
          ) : (
            <p className="text-sm text-slate-400 leading-relaxed">
              Estás usando la cuenta de prueba. Para cambiar contraseña, crea una cuenta con tu correo desde “Crear cuenta” y verifícala.
            </p>
          )}
        </section>

        {/* Notificaciones y recordatorios */}
        <section className="rounded-3xl border border-white/5 bg-white/5 p-8 backdrop-blur-md lg:col-span-2">
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
