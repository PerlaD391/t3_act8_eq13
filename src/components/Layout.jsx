import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Icon from './Icon';
import { signOutFirebase } from '../services/auth';

export default function Layout({ children, user, role, setUser }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await signOutFirebase();
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    navigate('/');
  };

  const navItems = [
    { label: "Panel Principal", icon: "home", path: "/dashboard" },
    { label: "Calendario de Eventos", icon: "calendar", path: "/catalog" },
    { label: "Mis Eventos", icon: "ticket", path: "/mis-eventos" },
    { label: "Directorio de Artistas", icon: "users", path: "/artists" },
    { label: "Configuración", icon: "settings", path: "/settings" },
  ];

  const getTitle = () => {
    if (location.pathname === '/catalog') return "Calendario de Eventos";
    if (location.pathname === '/mis-eventos') return "Mis Eventos";
    if (location.pathname === '/artists') return "Directorio de Artistas";
    if (location.pathname === '/settings') return "Configuración";
    return "Panel Principal";
  };

  return (
    <div className="flex min-h-screen bg-[#050505] text-slate-200 font-sans overflow-hidden">
      {menuOpen && <button className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden" onClick={() => setMenuOpen(false)} />}
      
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-[260px] flex-col border-r border-white/5 bg-[#0a0a0a]/90 px-5 py-7 backdrop-blur-xl transition-transform duration-300 lg:translate-x-0 ${menuOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="mb-10 flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-fuchsia-500 to-violet-600 text-white shadow-[0_0_15px_rgba(217,70,239,0.5)]">
              <Icon name="theater" size={22} />
            </span>
            <span className="text-xl font-bold text-white tracking-tight">CulturaVibe</span>
          </div>
          <button onClick={() => setMenuOpen(false)} className="rounded-lg p-1 text-slate-400 hover:text-white lg:hidden"><Icon name="x" /></button>
        </div>
        
        <nav className="flex-1 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path} onClick={() => setMenuOpen(false)}
                className={`group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${isActive ? "bg-white/10 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}>
                <span className={isActive ? "text-fuchsia-400" : "text-slate-500 group-hover:text-fuchsia-400 transition-colors"}><Icon name={item.icon} size={20} /></span>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 min-h-screen lg:pl-[260px]">
        <header className="sticky top-0 z-20 flex h-[80px] items-center justify-between border-b border-white/5 bg-[#050505]/80 px-5 backdrop-blur-xl sm:px-8">
          <div className="flex items-center gap-3">
            <button onClick={() => setMenuOpen(true)} className="rounded-xl border border-white/10 p-2 text-slate-300 lg:hidden hover:bg-white/5 transition-colors"><Icon name="menu" /></button>
            <h1 className="text-xl font-bold tracking-[-.02em] text-white">{getTitle()}</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-white">{user?.firstName} {user?.lastName}</p>
              <p className="text-[11px] font-bold text-fuchsia-400 uppercase tracking-wider flex items-center justify-end gap-1">{role === "Admin" && <Icon name="star" size={12}/>}{role}</p>
            </div>
            <img src={user?.image} alt="Avatar" className="h-10 w-10 rounded-full border border-white/20 object-cover shadow-lg" />
            <button onClick={handleLogout} className="rounded-xl p-2 text-slate-400 transition hover:bg-red-500/10 hover:text-red-400"><Icon name="logout" size={20} /></button>
          </div>
        </header>
        <main className="p-5 sm:p-8 lg:p-10 flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}