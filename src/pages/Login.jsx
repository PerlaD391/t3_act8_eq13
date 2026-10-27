import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../services/api';
import Icon from '../components/Icon';

export default function Login({ setUser, setRole }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState("Admin");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) return setError('Llena todos los campos');
    
    setLoading(true);
    setError('');
    try {
      const data = await loginUser(username, password);
      setUser(data);
      setRole(selectedRole);
      localStorage.setItem('user', JSON.stringify(data));
      localStorage.setItem('role', selectedRole);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
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
            <span className="mb-2 block text-sm font-semibold text-slate-300">Tipo de Cuenta</span>
            <div className="relative">
              <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)} className="w-full appearance-none rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-violet-500">
                <option value="Admin">Administrador</option>
                <option value="Empresa">Empresa Organizadora</option>
                <option value="Artista">Artista / Expositor</option>
                <option value="Cliente">Cliente / Público General</option>
              </select>
              <Icon name="chevronDown" size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
            </div>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-300">Usuario</span>
            <span className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/40 px-4 py-3 focus-within:border-violet-500 transition-all">
              <Icon name="user" size={19} className="text-slate-500" />
              <input type="text" placeholder="Ej. emilys" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-600" />
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
          
          <button disabled={loading} type="submit" className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-3.5 text-sm font-bold text-white transition hover:opacity-90 shadow-[0_0_15px_rgba(139,92,246,0.4)] disabled:opacity-50">
            {loading ? 'Entrando...' : `Entrar como ${selectedRole}`} <Icon name="chevronRight" size={18} />
          </button>
        </form>
      </section>
    </main>
  );
}