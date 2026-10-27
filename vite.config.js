import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// Si instalaste Tailwind CSS v4, deja esta línea. Si no lo usas, bórrala.
import tailwindcss from '@tailwindcss/vite' 

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  // ⚠️ IMPORTANTE: Cambia "eqXX" por el número de tu equipo (ej. '/t3_act8_eq05/')
  // Esto es necesario para que funcione en el VPS
  base: '/t3_act8_eq13/', 
})