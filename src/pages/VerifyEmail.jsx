import { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { resendVerificationEmail, refreshFirebaseUser, signOutFirebase } from '../services/auth';
import Icon from '../components/Icon';

export default function VerifyEmail({ setUser, setRole }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState(location.state?.email || '');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleCheck = async () => {
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const user = await refreshFirebaseUser();
      if (user?.emailVerified) {
        setEmail(user.email || email);
        setMessage('¡Correo verificado! Ya puedes entrar.');
        setTimeout(() => navigate('/dashboard'), 1200);
      } else {
        setError('Aún no está verificado. Revisa tu correo (también la carpeta de spam) y vuelve a intentarlo.');
      }
    } catch (err) {
      setError(err.message || 'No se pudo comprobar la verificación.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setMessage('');
    try {
      await resendVerificationEmail();
      setCooldown(60);
      setMessage('Correo de verificación reenviado. Revisa tu bandeja de entrada.');
    } catch (err) {
      setError(err.message || 'No se pudo reenviar el correo.');
    }
  };

  const handleLogout = async () => {
    await signOutFirebase();
    setUser(null);
    navigate('/');
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-10 bg-[#050505]">
      <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-violet-600/20 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-fuchsia-600/20 blur-[120px]" />
      <section className="relative z-10 w-full max-w-[460px] rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl sm:p-10 text-center">
        <span className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 shadow-[0_0_20px_rgba(139,92,246,0.4)]">
          <Icon name="mail" size={26} className="text-white" />
        </span>
        <h1 className="text-2xl font-bold text-white">Verifica tu correo</h1>
        <p className="mt-3 text-sm text-slate-400 leading-relaxed">
          Te enviamos un correo de verificación{email ? <> a <strong className="text-violet-400">{email}</strong></> : ''}.
          Haz clic en el enlace del correo para activar tu cuenta y poder iniciar sesión.
        </p>
        {message && <p className="mt-4 text-sm font-medium text-emerald-400">{message}</p>}
        {error && <p className="mt-4 text-sm font-medium text-red-400">{error}</p>}
        <div className="mt-8 space-y-3">
          <button disabled={loading} onClick={handleCheck} className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-3.5 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-50">
            {loading ? 'Comprobando...' : 'Ya verifiqué mi correo'}
          </button>
          <button disabled={cooldown > 0} onClick={handleResend} className="w-full rounded-xl bg-white/5 px-5 py-3 text-sm font-semibold text-white border border-white/10 hover:bg-white/10 transition disabled:opacity-50">
            {cooldown > 0 ? `Reenviar correo en ${cooldown}s` : 'Reenviar correo de verificación'}
          </button>
          <button onClick={handleLogout} className="w-full py-2 text-sm text-slate-400 hover:text-white transition">
            Salir y volver al inicio de sesión
          </button>
        </div>
        <p className="mt-6 text-xs text-slate-500">
          ¿No llegó? Revisa la carpeta de spam o promociones. El enlace caduca, por eso puedes reenviarlo.
        </p>
        <p className="mt-4 text-sm text-slate-400">
          <Link to="/" className="font-semibold text-fuchsia-400 hover:text-fuchsia-300">Volver al inicio de sesión</Link>
        </p>
      </section>
    </main>
  );
}
