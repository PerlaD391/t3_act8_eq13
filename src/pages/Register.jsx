import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerWithFirebase, defaultPreferences, isFirebaseConfigured } from '../services/auth';
import Icon from '../components/Icon';

const ROLES = [
  { value: 'Cliente', label: 'Cliente / Público General' },
  { value: 'Empresa', label: 'Empresa Organizadora' },
  { value: 'Artista', label: 'Artista / Expositor' },
];

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('Cliente');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifySms, setNotifySms] = useState(false);
  const [notifyApp, setNotifyApp] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password) return setError('Llena nombre, correo y contraseña.');
    if (password.length < 6) return setError('La contraseña debe tener al menos 6 caracteres.');
    if (password !== confirmPassword) return setError('Las contraseñas no coinciden.');
    if (!isFirebaseConfigured) {
      return setError('El registro real aún no está configurado: falta el proyecto de Firebase. Revisa FIREBASE_SETUP.md');
    }
    setLoading(true);
    setError('');
    try {
      const preferences = {
        ...defaultPreferences(),
        channels: { email: notifyEmail, sms: notifySms, app: notifyApp },
      };
      await registerWithFirebase({ name: name.trim(), email: email.trim(), phone: phone.trim(), role, password, preferences });
      navigate('/verify', { state: { email: email.trim() } });
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') setError('Ese correo ya tiene una cuenta. Inicia sesión o recupera tu contraseña.');
      else if (err.code === 'auth/invalid-email') setError('El correo no tiene un formato válido.');
      else if (err.code === 'auth/weak-password') setError('La contraseña es demasiado débil.');
      else setError(err.message || 'No se pudo crear la cuenta.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-10 bg-[#050505]">
      <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-violet-600/20 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-fuchsia-600/20 blur-[120px]" />
      <section className="relative z-10 w-full max-w-[520px] rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl sm:p-10">
        <div className="mb-8 text-center">
          <span className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 shadow-[0_0_20px_rgba(139,92,246,0.4)]">
            <Icon name="theater" size={26} className="text-white" />
          </span>
          <h1 className="text-[29px] font-bold tracking-[-.035em] text-white">Crear cuenta</h1>
          <p className="mt-2 text-sm text-slate-400">Te mandaremos un correo de verificación para activar tu cuenta.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-300">Nombre completo</span>
            <input type="text" placeholder="Ej. Perla Gallardo" value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-violet-500" />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-300">Correo electrónico</span>
            <input type="email" placeholder="tu@correo.com" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-violet-500" />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-300">Teléfono (opcional, para avisos por SMS)</span>
            <input type="tel" placeholder="Ej. 55 1234 5678" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-violet-500" />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-300">Tipo de cuenta</span>
            <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full appearance-none rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-violet-500">
              {ROLES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-300">Contraseña</span>
              <input type="password" placeholder="Mínimo 6 caracteres" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-violet-500" />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-300">Confirmar contraseña</span>
              <input type="password" placeholder="Repite tu contraseña" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-violet-500" />
            </label>
          </div>

          <fieldset className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <legend className="px-2 text-sm font-semibold text-slate-300">¿Cómo quieres que te avisemos?</legend>
            <div className="space-y-2 text-sm text-slate-300">
              <label className="flex items-center gap-3"><input type="checkbox" checked={notifyEmail} onChange={(e) => setNotifyEmail(e.target.checked)} className="h-4 w-4 accent-fuchsia-500" /> Por correo electrónico</label>
              <label className="flex items-center gap-3"><input type="checkbox" checked={notifySms} onChange={(e) => setNotifySms(e.target.checked)} className="h-4 w-4 accent-fuchsia-500" /> Por SMS (necesitas teléfono y que el envío de SMS esté activo)</label>
              <label className="flex items-center gap-3"><input type="checkbox" checked={notifyApp} onChange={(e) => setNotifyApp(e.target.checked)} className="h-4 w-4 accent-fuchsia-500" /> Solo dentro de la app</label>
            </div>
            <p className="mt-3 text-xs text-slate-500">Podrás cambiar las categorías, los estados y los recordatorios en Configuración.</p>
          </fieldset>

          {error && <p className="text-sm font-medium text-red-400 text-center">{error}</p>}

          <button disabled={loading} type="submit" className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-3.5 text-sm font-bold text-white transition hover:opacity-90 shadow-[0_0_15px_rgba(139,92,246,0.4)] disabled:opacity-50">
            {loading ? 'Creando tu cuenta...' : 'Crear cuenta y enviar verificación'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          ¿Ya tienes cuenta? <Link to="/" className="font-semibold text-fuchsia-400 hover:text-fuchsia-300">Inicia sesión</Link>
        </p>
      </section>
    </main>
  );
}
