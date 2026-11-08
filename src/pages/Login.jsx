import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { loginUser } from '../services/api';
import Icon from '../components/Icon';

// Firebase se detecta por las variables del .env (sin importar Firebase,
// para que el login no meta su código en el paquete inicial). Si está
// configurado y se escribe un correo, el login se hace con Firebase.
const FIREBASE_ON = Boolean(
  import.meta.env.VITE_FIREBASE_API_KEY &&
  import.meta.env.VITE_FIREBASE_AUTH_DOMAIN &&
  import.meta.env.VITE_FIREBASE_PROJECT_ID &&
  import.meta.env.VITE_FIREBASE_STORAGE_BUCKET &&
  import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID &&
  import.meta.env.VITE_FIREBASE_APP_ID,
);

// Bloqueo por intentos fallidos: 5 intentos y la cuenta se bloquea 15 minutos.
// Nota: es un bloqueo en el navegador (localStorage), porque DummyJSON no
// tiene bloqueo en el servidor. Borrar los datos del navegador lo reinicia;
// un bloqueo real necesitaría un backend propio.
const MAX_ATTEMPTS = 5;
const LOCK_MINUTES = 15;
const LOCK_MS = LOCK_MINUTES * 60 * 1000;

const attemptsKey = (user) => `login-attempts:${user.trim().toLowerCase()}`;

const readAttempts = (user) => {
  try {
    return JSON.parse(localStorage.getItem(attemptsKey(user)) || '{"count":0,"lockedUntil":0}');
  } catch {
    return { count: 0, lockedUntil: 0 };
  }
};

const formatRemaining = (ms) => {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  return `${minutes}:${seconds}`;
};

export default function Login({ setUser, setRole }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lockedUntil, setLockedUntil] = useState(0);
  const [now, setNow] = useState(Date.now());
  const navigate = useNavigate();

  const isLocked = lockedUntil > now;
  const remainingMs = lockedUntil - now;

  // Actualiza el contador del bloqueo cada segundo mientras esté activo.
  useEffect(() => {
    if (!isLocked) return undefined;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [isLocked]);

  // Al escribir el usuario, revisa si esa cuenta está bloqueada.
  useEffect(() => {
    if (!username.trim()) {
      setLockedUntil(0);
      return;
    }
    const attempts = readAttempts(username);
    setLockedUntil(attempts.lockedUntil || 0);
    setNow(Date.now());
  }, [username]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) return setError('Llena todos los campos');

    const attempts = readAttempts(username);
    if (attempts.lockedUntil && attempts.lockedUntil > Date.now()) {
      setLockedUntil(attempts.lockedUntil);
      return setError(`Cuenta bloqueada por demasiados intentos. Inténtalo de nuevo en ${formatRemaining(attempts.lockedUntil - Date.now())} minutos.`);
    }

    setLoading(true);
    setError('');
    try {
      // Si Firebase está configurado y se escribe un correo, se entra con
      // Firebase (cuenta real verificada). Si no, se usa el login de
      // prueba de DummyJSON con nombre de usuario.
      if (FIREBASE_ON && username.includes('@')) {
        const { loginWithFirebase } = await import('../services/auth');
        const { user, profile, emailVerified } = await loginWithFirebase(username.trim(), password);
        if (!emailVerified) {
          navigate('/verify', { state: { email: username.trim() } });
          return;
        }
        const displayName = profile?.name || user.displayName || '';
        const [firstName, ...rest] = displayName.split(' ');
        const userData = {
          firstName: firstName || '',
          lastName: rest.join(' '),
          email: user.email,
          image: user.photoURL || '',
          firebaseUid: user.uid,
        };
        localStorage.removeItem(attemptsKey(username));
        setUser(userData);
        setRole(profile?.role || 'Cliente');
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('role', profile?.role || 'Cliente');
        navigate('/dashboard');
        return;
      }
      const data = await loginUser(username, password);
      localStorage.removeItem(attemptsKey(username));
      setUser(data);
      // La cuenta de prueba entra como Cliente: el rol ya no se elige en
      // el login (antes cualquiera podía entrar como Admin). Con Firebase
      // el rol es el que se guardó al registrarse.
      setRole('Cliente');
      localStorage.setItem('user', JSON.stringify(data));
      localStorage.setItem('role', 'Cliente');
      navigate('/dashboard');
    } catch (err) {
      const nextCount = (attempts.count || 0) + 1;
      if (nextCount >= MAX_ATTEMPTS) {
        const locked = Date.now() + LOCK_MS;
        localStorage.setItem(attemptsKey(username), JSON.stringify({ count: nextCount, lockedUntil: locked }));
        setLockedUntil(locked);
        setError(`Cuenta bloqueada por ${LOCK_MINUTES} minutos tras ${MAX_ATTEMPTS} intentos fallidos.`);
      } else {
        localStorage.setItem(attemptsKey(username), JSON.stringify({ count: nextCount, lockedUntil: 0 }));
        setError(`${err.message}. Te quedan ${MAX_ATTEMPTS - nextCount} intentos.`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-10 bg-[#050505]">
      <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-violet-600/20 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-fuchsia-600/20 blur-[120px]" />

      <section className="relative z-10 w-full max-w-[460px] rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl sm:p-10">
        <div className="mb-8 text-center">
          <span className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 shadow-[0_0_20px_rgba(139,92,246,0.4)]">
            <Icon name="theater" size={26} className="text-white" />
          </span>
          <h1 className="text-[29px] font-bold tracking-[-.035em] text-white">CulturaVibe</h1>
          <p className="mt-2 text-sm text-slate-400">Prueba con: <strong className="text-violet-400">emilys</strong> / <strong className="text-violet-400">emilyspass</strong></p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-300">Usuario</span>
            <span className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/40 px-4 py-3 focus-within:border-violet-500 transition-all">
              <Icon name="user" size={19} className="text-slate-500" />
              <input type="text" placeholder={FIREBASE_ON ? "tu@correo.com o emilys" : "Ej. emilys"} value={username} onChange={(e) => setUsername(e.target.value)} className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-600" />
            </span>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-300">Contraseña</span>
            <span className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/40 px-4 py-3 focus-within:border-violet-500 transition-all">
              <Icon name="lock" size={19} className="text-slate-500" />
              <input type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-600" />
              <button type="button" className="text-slate-500 hover:text-violet-400" onClick={() => setShowPassword(!showPassword)}>
                <Icon name="eye" size={19} />
              </button>
            </span>
          </label>

          {error && <p className="text-sm font-medium text-red-400 text-center">{error}</p>}
          {isLocked && (
            <p className="text-sm font-semibold text-amber-300 text-center">
              Podrás intentarlo de nuevo en {formatRemaining(remainingMs)}.
            </p>
          )}

          <button disabled={loading || isLocked} type="submit" className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-3.5 text-sm font-bold text-white transition hover:opacity-90 shadow-[0_0_15px_rgba(139,92,246,0.4)] disabled:opacity-50">
            {loading ? 'Entrando...' : isLocked ? 'Cuenta bloqueada' : 'Entrar'} <Icon name="chevronRight" size={18} />
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          ¿No tienes cuenta? <Link to="/register" className="font-semibold text-fuchsia-400 hover:text-fuchsia-300">Crear cuenta</Link>
        </p>
      </section>
    </main>
  );
}
