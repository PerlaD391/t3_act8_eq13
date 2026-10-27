import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Catalog from './pages/Catalog';
import Artists from './pages/Artists';
import Settings from './pages/Settings';

export default function App() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState('Admin');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedRole = localStorage.getItem('role');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setRole(storedRole || 'Admin');
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050505] text-white">
        <p className="animate-pulse text-lg font-bold text-violet-500">Cargando Fantasy Makeup...</p>
      </div>
    );
  }

  return (
    // ⚠️ IMPORTANTE: Cambia "eq13" por el número de tu equipo
    <BrowserRouter basename="/t3_act8_eq13">
      <Routes>
        <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <Login setUser={setUser} setRole={setRole} />} />
        
        <Route path="/dashboard" element={
          user ? <Layout user={user} role={role} setUser={setUser}><Dashboard /></Layout> : <Navigate to="/" replace />
        } />

        <Route path="/catalog" element={
          user ? <Layout user={user} role={role} setUser={setUser}><Catalog /></Layout> : <Navigate to="/" replace />
        } />

        <Route path="/artists" element={
          user ? <Layout user={user} role={role} setUser={setUser}><Artists /></Layout> : <Navigate to="/" replace />
        } />

        <Route path="/settings" element={
          user ? <Layout user={user} role={role} setUser={setUser}><Settings role={role} /></Layout> : <Navigate to="/" replace />
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}