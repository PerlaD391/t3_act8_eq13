
==============================
CulturaVibe — Actividad 8: Consumo de APIs
==============================

**Materia:** Programación Web
**Integrantes:**
- Gallardo Vasquez Perla Danae
- Lemus Sánchez Ricardo
Equipo: 13

## Descripción del Proyecto
CulturaVibe es un sistema de eventos culturales en México construido con React y Vite. Muestra la cartelera real de Ticketmaster (solo los eventos con boletos a la venta, de más de 2,000 eventos en los próximos 6 meses), con búsqueda, filtros por categoría y por estado, orden por fecha o precio, y paginación reflejada en la URL. Los usuarios pueden crear una cuenta, agendar eventos, ver sus recordatorios y comprar boletos en Ticketmaster. Todo con un diseño moderno en modo oscuro (Dark Mode).

## Enlace del Proyecto Desplegado
El sistema está funcionando en vivo en el VPS de Contabo (Ubuntu):

**[http://13.140.226.55/t3_act8_eq13/](http://13.140.226.55/t3_act8_eq13/)**

## Credenciales de Prueba
- **Usuario:** `emilys`
- **Contraseña:** `emilyspass`

También se puede crear una cuenta real desde "Crear cuenta": llega un correo de verificación y solo se puede entrar después de verificarlo.

## Funcionalidades
- **Catálogo de eventos:** todos los eventos de Ticketmaster en México, cargados por rangos de fecha (la API no deja paginar más de 1,000 resultados en una sola consulta). Búsqueda con pausa al escribir, filtro por categoría y por estado (CDMX, Nuevo León, Jalisco, Sinaloa, Estado de México, Puebla, Guerrero, Morelos), orden por fecha o precio, y límite de 12, 24 o 48 eventos por página que se guarda.
- **Detalle del evento:** fecha y hora, sede con ciudad y estado, precio del boleto, artistas, botón para comprar boletos en Ticketmaster, agendar con confirmación y enlace a Google Calendar, y compartir por WhatsApp o copiando el enlace.
- **Mis eventos:** todos los eventos agendados, próximos y pasados, con opción de quitarlos.
- **Artistas:** artistas reales de la cartelera (foto, género, eventos próximos) con buscador, y artesanos destacados.
- **Registro con Firebase:** cuentas de Cliente o Empresa/Artista con verificación por correo, perfil en Firestore y preferencias de notificaciones (canales, categorías, estados y recordatorios).
- **Seguridad en el login:** tras 5 intentos fallidos con el mismo usuario, la cuenta se bloquea 15 minutos en ese navegador.
- **Dashboard:** total real de eventos, artistas en cartelera y recordatorios de los eventos agendados para los próximos 7 días.

## APIs Utilizadas
1. **Eventos:** Ticketmaster Discovery API (`https://app.ticketmaster.com/discovery/v2`) a través del proxy `/api-ticketmaster` del VPS (en desarrollo local, Vite redirige esa ruta a Ticketmaster).
2. **Autenticación de prueba:** `https://dummyjson.com/auth/login` (DummyJSON) para validar las credenciales de prueba y obtener foto de perfil y nombre.
3. **Cuentas reales:** Firebase Authentication (correo y contraseña, con verificación por correo) y Cloud Firestore para el perfil y las preferencias.

## Configuración local
```bash
npm install
npm run dev
```

Copia `.env.example` a `.env` y llena los valores. El archivo `.env` nunca se sube al repositorio.

## Variables de entorno (.env)
```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_TICKETMASTER_API_KEY=
```

La configuración de Firebase se copia desde Firebase Console > Configuración del proyecto > Tus apps > Web (ver `FIREBASE_SETUP.md`). La llave de Ticketmaster se genera en la cuenta de desarrollador de Ticketmaster.

## Seguridad: la llave de Ticketmaster
La llave de Ticketmaster **no va en el código**, solo en el `.env`. La llave que estaba antes en `src/services/api.js` quedó expuesta en el historial de git, así que hay que generar una nueva en Ticketmaster (rotarla) y usar esa en el `.env`, tanto en local como al compilar para el VPS. Sin llave, la app muestra los eventos de respaldo.

## Despliegue en el VPS
```bash
npm run build
scp -r .\dist\* root@13.140.226.55:/var/www/html/t3_act8_eq13/
```

El build debe hacerse con el `.env` presente (las variables `VITE_*` se incrustan al compilar). El servidor del VPS ya tiene configurado el proxy `/api-ticketmaster` hacia Ticketmaster.

## Tecnologías y Buenas Prácticas
- **React + Vite** para el frontend.
- **React Router DOM** para la navegación y protección de rutas.
- **Tailwind CSS** para los estilos visuales.
- Separación de responsabilidades en carpetas: `/components`, `/pages`, `/services`.
- Llamadas a la API centralizadas en `src/services/api.js`.
- Manejo de errores visible para el usuario y validación de campos en el Login.
