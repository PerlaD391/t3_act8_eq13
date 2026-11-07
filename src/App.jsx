import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import Dashboard from './pages/Dashboard';
import Catalog from './pages/Catalog';
import EventDetail from './pages/EventDetail'; // <-- NUEVO
import MisEventos from './pages/MisEventos';
import Artists from './pages/Artists';
import Settings from './pages/Settings';
import { subscribeToAuthChanges, isFirebaseConfigured, getFirebaseProfile } from './services/auth';

export default function App() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState('Admin');
  const [loading, setLoading] = useState(true);
  const [pendingVerification, setPendingVerification] = useState(false);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      const storedRole = localStorage.getItem('role');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
        setRole(storedRole || 'Admin');
      }
    } catch {
      // Si los datos guardados están corruptos, se borran y se vuelve al login.
      localStorage.removeItem('user');
      localStorage.removeItem('role');
    }
    setLoading(false);
  }, []);

  // Con Firebase, la sesión se restaura desde Auth: solo se entra si el
  // correo está verificado; si no, se pide verificar.
  useEffect(() => {
    if (!isFirebaseConfigured) return undefined;
    const unsubscribe = subscribeToAuthChanges(async (firebaseUser) => {
      if (!firebaseUser) {
        setPendingVerification(false);
        return;
      }
      await firebaseUser.reload();
      if (!firebaseUser.emailVerified) {
        setPendingVerification(true);
        return;
      }
      setPendingVerification(false);
      const profile = await getFirebaseProfile(firebaseUser.uid);
      const displayName = profile?.name || firebaseUser.displayName || '';
      const [firstName, ...rest] = displayName.split(' ');
      const userData = {
        firstName: firstName || '',
        lastName: rest.join(' '),
        email: firebaseUser.email,
        image: firebaseUser.photoURL || '',
        phone: profile?.phone || '',
        firebaseUid: firebaseUser.uid,
      };
      setUser(userData);
      setRole(profile?.role || 'Cliente');
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('role', profile?.role || 'Cliente');
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-[#050505] text-white"><p className="animate-pulse text-lg font-bold text-fuchsia-500">Cargando CulturaVibe...</p></div>;

  return (
    <BrowserRouter basename="/t3_act8_eq13">
      <Routes>
        <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : pendingVerification ? <Navigate to="/verify" replace /> : <Login setUser={setUser} setRole={setRole} />} />
        <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <Register />} />
        <Route path="/verify" element={user ? <Navigate to="/dashboard" replace /> : <VerifyEmail setUser={setUser} setRole={setRole} />} />
        <Route path="/dashboard" element={user ? <Layout user={user} role={role} setUser={setUser}><Dashboard /></Layout> : pendingVerification ? <Navigate to="/verify" replace /> : <Navigate to="/" replace />} />
        <Route path="/catalog" element={user ? <Layout user={user} role={role} setUser={setUser}><Catalog /></Layout> : pendingVerification ? <Navigate to="/verify" replace /> : <Navigate to="/" replace />} />

        {/* NUEVA RUTA PARA EL DETALLE DEL EVENTO */}
        <Route path="/event/:id" element={user ? <Layout user={user} role={role} setUser={setUser}><EventDetail /></Layout> : pendingVerification ? <Navigate to="/verify" replace /> : <Navigate to="/" replace />} />

        <Route path="/mis-eventos" element={user ? <Layout user={user} role={role} setUser={setUser}><MisEventos /></Layout> : pendingVerification ? <Navigate to="/verify" replace /> : <Navigate to="/" replace />} />

        <Route path="/artists" element={user ? <Layout user={user} role={role} setUser={setUser}><Artists /></Layout> : pendingVerification ? <Navigate to="/verify" replace /> : <Navigate to="/" replace />} />
        <Route path="/settings" element={user ? <Layout user={user} role={role} setUser={setUser}><Settings user={user} role={role} /></Layout> : pendingVerification ? <Navigate to="/verify" replace /> : <Navigate to="/" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
