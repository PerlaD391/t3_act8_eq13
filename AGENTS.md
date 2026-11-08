# CulturaVibe

Sistema de eventos culturales en México (Actividad 8, Programación Web, equipo 13).
React 19 + Vite + Tailwind CSS v4 + React Router. Modo oscuro. Archivos `.jsx`
(`src/main.jsx`, `src/App.jsx`, `vite.config.js`).

## Qué hace

- Catálogo de eventos reales de **Ticketmaster** (México): carga por rangos de
  fecha porque la API no deja paginar más allá de 1,000 resultados por consulta
  (`página × tamaño < 1,000`). Solo muestra eventos con boletos a la venta.
- Filtro por estado, buscador, orden (fecha/precio) y límite por página
  persistente (12/24/48). Detalle con estado/ciudad, precio, artistas reales
  y botón de compra a Ticketmaster. Agenda propia ("Mis eventos") en
  `localStorage`.
- Login con cuenta de prueba DummyJSON (`emilys` / `emilyspass`) y cuentas
  reales con **Firebase Auth** (registro con verificación por correo, perfil en
  Firestore, preferencias de notificaciones). Bloqueo de login tras 5 intentos
  fallidos por 15 minutos (solo en el navegador).
- Sin datos inventados: si Ticketmaster no responde, el catálogo muestra un
  mensaje de error, no eventos de respaldo.

## Comandos

- `npm run dev` — desarrollo local (el proxy `/api-ticketmaster` de
  `vite.config.js` redirige a Ticketmaster).
- `npm run build` — compila a `dist/` (Vite incrusta las variables `VITE_*`
  del `.env` en ese momento).
- `npm run preview` — sirve el build local.

## Variables de entorno (`.env`, nunca en el repo)

- `VITE_TICKETMASTER_API_KEY` — llave de Ticketmaster (sin ella el catálogo
  sale vacío). Rotarla si quedó expuesta en el historial de git.
- `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`,
  `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`,
  `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID` — proyecto de
  Firebase (ver `FIREBASE_SETUP.md`).

## Despliegue (VPS Contabo, Ubuntu)

Se compila en local y se sube el `dist` con
`scp -r .\dist\* root@13.140.226.55:/var/www/html/t3_act8_eq13/`.
La app se sirve en `http://13.140.226.55/t3_act8_eq13/` (el `base` de
`vite.config.js` es `/t3_act8_eq13/` y el proxy `/api-ticketmaster` ya existe
en el servidor). Antes de compilar, confirmar la rama
(`git branch --show-current` = `mejoras-todos-eventos`) y verificar el
paquete con `findstr /C:"culturavibe-events-per-page" dist\assets\*.js`.

## Estructura

- `src/services/api.js` — Ticketmaster (carga por ventanas, dedupe, filtro
  onsale) y login DummyJSON.
- `src/services/auth.js` — Firebase Auth + Firestore (registro, verificación,
  perfil, preferencias, cambio de contraseña).
- `src/services/firebase.js` — inicialización de Firebase desde el `.env`.
- `src/pages/` — Dashboard, Catalog, EventDetail, Artists, MisEventos,
  Settings, Login, Register, VerifyEmail.
- `src/components/` — Layout, EventCard, Icon.
