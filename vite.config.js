import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  // La app se sirve en el VPS bajo /t3_act8_eq13/.
  base: '/t3_act8_eq13/',
  // Proxy solo para desarrollo local: en el VPS la ruta /api-ticketmaster
  // ya existe en el servidor; aquí Vite la redirige a Ticketmaster para
  // que el catálogo también traiga los eventos reales en localhost.
  server: {
    proxy: {
      '/api-ticketmaster': {
        target: 'https://app.ticketmaster.com/discovery/v2',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-ticketmaster/, ''),
      },
    },
  },
})