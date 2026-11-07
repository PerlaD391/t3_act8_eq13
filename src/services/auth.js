// Cuentas de usuario con Firebase Auth + Firestore.
// - Registro con correo y contraseña, verificación por correo.
// - Perfil con rol (Cliente / Empresa / Artista) y preferencias de
//   notificaciones (canales, categorías, estados y recordatorios).
// - Sin Firebase configurado, todo queda desactivado y la app usa el
//   login de prueba de DummyJSON (ver src/services/api.js).
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  updateProfile,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from './firebase';

export { onAuthStateChanged, isFirebaseConfigured };

export const NOTIFICATION_CATEGORIES = ['Music', 'Arts & Theatre', 'Miscellaneous'];
export const NOTIFICATION_STATES = ['CDMX', 'NL', 'JAL', 'SIN', 'MEX', 'PUE', 'GRO', 'MOR'];

export const defaultPreferences = () => ({
  channels: { email: true, sms: false, app: true },
  categories: ['Music', 'Arts & Theatre', 'Miscellaneous'],
  states: ['all'],
  reminders: { dayBefore: true, dayOf: true },
});

const prefsKey = (uid) => `notification-prefs:${uid || 'local'}`;

export const loadPreferences = async (uid) => {
  if (isFirebaseConfigured && db && uid) {
    try {
      const snap = await getDoc(doc(db, 'users', uid));
      if (snap.exists() && snap.data().preferences) return snap.data().preferences;
    } catch (error) {
      console.warn('No se pudieron leer las preferencias de Firestore.', error);
    }
  }
  try {
    const stored = JSON.parse(localStorage.getItem(prefsKey(uid)) || 'null');
    if (stored) return { ...defaultPreferences(), ...stored };
  } catch {
    // Preferencias guardadas corruptas: se usan las de por defecto.
  }
  return defaultPreferences();
};

export const savePreferences = async (uid, preferences) => {
  localStorage.setItem(prefsKey(uid), JSON.stringify(preferences));
  if (isFirebaseConfigured && db && uid) {
    try {
      await setDoc(doc(db, 'users', uid), { preferences }, { merge: true });
    } catch (error) {
      console.warn('No se pudieron guardar las preferencias en Firestore.', error);
    }
  }
};

export const registerWithFirebase = async ({ name, email, phone, role, password, preferences }) => {
  if (!isFirebaseConfigured) throw new Error('Firebase no está configurado. Revisa FIREBASE_SETUP.md');
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  const user = credential.user;
  await updateProfile(user, { displayName: name });
  await sendEmailVerification(user);
  const profile = {
    name,
    email,
    phone: phone || '',
    role,
    emailVerified: false,
    preferences: preferences || defaultPreferences(),
    createdAt: new Date().toISOString(),
  };
  try {
    await setDoc(doc(db, 'users', user.uid), profile);
  } catch (error) {
    console.warn('No se pudo guardar el perfil en Firestore.', error);
  }
  localStorage.setItem(prefsKey(user.uid), JSON.stringify(profile.preferences));
  return { user, profile };
};

export const loginWithFirebase = async (email, password) => {
  if (!isFirebaseConfigured) throw new Error('Firebase no está configurado. Revisa FIREBASE_SETUP.md');
  const credential = await signInWithEmailAndPassword(auth, email, password);
  await credential.user.reload();
  const user = credential.user;
  let profile = null;
  try {
    const snap = await getDoc(doc(db, 'users', user.uid));
    if (snap.exists()) profile = snap.data();
  } catch (error) {
    console.warn('No se pudo leer el perfil en Firestore.', error);
  }
  return { user, profile, emailVerified: user.emailVerified };
};

export const resendVerificationEmail = async () => {
  if (!auth?.currentUser) throw new Error('No hay sesión activa para reenviar la verificación.');
  await sendEmailVerification(auth.currentUser);
};

export const refreshFirebaseUser = async () => {
  if (!auth?.currentUser) return null;
  await auth.currentUser.reload();
  return auth.currentUser;
};

export const signOutFirebase = async () => {
  if (isFirebaseConfigured && auth) {
    try {
      await signOut(auth);
    } catch (error) {
      console.warn('No se pudo cerrar la sesión de Firebase.', error);
    }
  }
  localStorage.removeItem('user');
  localStorage.removeItem('role');
};

export const getFirebaseProfile = async (uid) => {
  if (!isFirebaseConfigured || !db || !uid) return null;
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    return snap.exists() ? snap.data() : null;
  } catch (error) {
    console.warn('No se pudo leer el perfil en Firestore.', error);
    return null;
  }
};
