# Firebase para CulturaVibe

Esta guía deja el registro real con verificación por correo funcionando.
Sin estos pasos, la app sigue funcionando con el login de prueba de
DummyJSON (`emilys` / `emilyspass`) y el registro muestra un aviso de
que Firebase no está configurado.

## 1. Crear el proyecto

1. Entra a [Firebase Console](https://console.firebase.google.com/) con tu
   cuenta de Google.
2. **Agregar proyecto** → nombre: `culturavibe` → sigue los pasos (puedes
   desactivar Google Analytics).
3. En el proyecto, ve a **Compilación > Authentication > Comenzar**.
4. En **Método de acceso**, activa **Correo electrónico/contraseña**.

## 2. Activar la base de datos (perfiles y preferencias)

1. Ve a **Compilación > Firestore Database > Crear base de datos**.
2. Elige **Comenzar en modo de producción**.
3. En **Reglas**, usa estas (cada usuario solo lee y escribe su propio perfil):

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 3. Copiar la configuración web

1. Ve a **Configuración del proyecto** (engrane) → **Tus apps** →
   **Agregar app > Web** (`</>`).
2. Registra la app con el apodo `culturavibe-web`.
3. Copia los valores de `firebaseConfig` a un archivo `.env` en la raíz
   del proyecto (usa `.env.example` como plantilla):

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

4. En el VPS, esas mismas variables deben estar en el entorno al hacer
   el build (`npm run build`), o en un archivo `.env` en el servidor.
   El `.env` ya está en `.gitignore`: no se sube al repositorio.

## 4. Probar el registro

1. `npm install` y `npm run dev`.
2. Abre la app → **Crear cuenta** → llena nombre, correo, teléfono
   (opcional), rol y contraseña.
3. Firebase manda el correo de verificación a ese correo. Haz clic en
   el enlace, vuelve a la app y pulsa **Ya verifiqué mi correo**.
4. Ya dentro, en **Configuración** puedes cambiar las notificaciones:
   canales (correo, SMS, app), categorías, estados y recordatorios.

## 5. ¿Y los SMS?

El registro y la verificación son por **correo** con Firebase Auth.

- El campo de teléfono y la preferencia de SMS ya están guardados en el
  perfil, pero **enviar SMS de verdad necesita un servicio aparte**
  (por ejemplo Twilio, o Firebase Phone Auth con facturación y
  reCAPTCHA). No se puede mandar SMS solo desde el navegador, porque la
  llave secreta del servicio no debe ir en el código que ve el usuario.
- Cuando actives ese servicio, los avisos se mandan desde el servidor
  (Cloud Functions o tu VPS) leyendo las preferencias guardadas en
  Firestore.

## 6. Correos de verificación

Firebase manda el correo desde su remitente por defecto
(`noreply@<proyecto>.firebaseapp.com`). Para mandar desde tu propio
dominio o con tu nombre, ve a **Authentication > Plantillas > Verificación
de correo electrónico** y personalízala ahí.
