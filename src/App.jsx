import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect, lazy, Suspense } from 'react';
import Layout from './components/Layout';
import Login from './pages/Login';
// Las páginas se cargan bajo demanda para que el paquete inicial sea más
// ligero (antes todo iba en un solo archivo de ~884 kB).
const Register = lazy(() => import('./pages/Register'));
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Catalog = lazy(() => import('./pages/Catalog'));
const EventDetail = lazy(() => import('./pages/EventDetail'));
const MisEventos = lazy(() => import('./pages/MisEventos'));
const Artists = lazy(() => import('./pages/Artists'));
const Settings = lazy(() => import('./pages/Settings'));
// Firebase se importa de forma dinámica (ver el efecto de abajo) para que
// su código no vaya en el paquete inicial: solo se carga cuando hace falta.

const PageLoading = () => (
  <div className="flex min-h-screen items-center justify-center bg-[#050505] text-white">
    <p className="animate-pulse text-lg font-bold text-fuchsia-500">Cargando CulturaVibe...</p>
  </div>
);

export default function App() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState('Cliente');
  const [loading, setLoading] = useState(true);
  const [pendingVerification, setPendingVerification] = useState(false);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      const storedRole = localStorage.getItem('role');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
        setRole(storedRole || 'Cliente');
      }
    } catch {
      // Si los datos guardados están corruptos, se borran y se vuelve al login.
      localStorage.removeItem('user');
      localStorage.removeItem('role');
    }
    setLoading(false);
  }, []);

  // Con Firebase, la sesión se restaura desde Auth: solo se entra si el
  // correo está verificado; si no, se pide verificar. La importación es
  // dinámica para no meter Firebase en el paquete inicial, y solo se hace
  // si el usuario guardado es de Firebase (la cuenta de prueba no lo
  // necesita).
  useEffect(() => {
    let hasFirebaseUser = false;
    try {
      hasFirebaseUser = Boolean(JSON.parse(localStorage.getItem('user') || 'null')?.firebaseUid);
    } catch {
      hasFirebaseUser = false;
    }
    if (!hasFirebaseUser) return undefined;
    let unsubscribe;
    let cancelled = false;
    import('./services/auth').then(async (auth) => {
      if (cancelled || !auth.isFirebaseConfigured) return;
      unsubscribe = auth.subscribeToAuthChanges(async (firebaseUser) => {
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
        const profile = await auth.getFirebaseProfile(firebaseUser.uid);
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
    });
    return () => {
      cancelled = true;
      if (unsubscribe) unsubscribe();
    };
  }, []);

  if (loading) return <PageLoading />;

  return (
    <BrowserRouter basename="/t3_act8_eq13">
      <Suspense fallback={<PageLoading />}>
      <Routes>
        <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : pendingVerification ? <Navigate to="/verify" replace /> : <Login setUser={setUser} setRole={setRole} />} />
        <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <Register />} />
        <Route path="/verify" element={user ? <Navigate to="/dashboard" replace /> : <VerifyEmail setUser={setUser} setRole={setRole} />} />
        <Route path="/dashboard" element={user ? <Layout user={user} role={role} setUser={setUser}><Dashboard /></Layout> : pendingVerification ? <Navigate to="/verify" replace /> : <Navigate to="/" replace />} />
        <Route path="/catalog" element={user ? <Layout user={user} role={role} setUser={setUser}><Catalog /></Layout> : pendingVerification ? <Navigate to="/verify" replace /> : <Navigate to="/" replace />} />

        <Route path="/event/:id" element={user ? <Layout user={user} role={role} setUser={setUser}><EventDetail /></Layout> : pendingVerification ? <Navigate to="/verify" replace /> : <Navigate to="/" replace />} />

        <Route path="/mis-eventos" element={user ? <Layout user={user} role={role} setUser={setUser}><MisEventos /></Layout> : pendingVerification ? <Navigate to="/verify" replace /> : <Navigate to="/" replace />} />

        <Route path="/artists" element={user ? <Layout user={user} role={role} setUser={setUser}><Artists /></Layout> : pendingVerification ? <Navigate to="/verify" replace /> : <Navigate to="/" replace />} />
        <Route path="/settings" element={user ? <Layout user={user} role={role} setUser={setUser}><Settings user={user} role={role} setUser={setUser} /></Layout> : pendingVerification ? <Navigate to="/verify" replace /> : <Navigate to="/" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
