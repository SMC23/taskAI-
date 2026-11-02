import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // El backend solo acepta peticiones (CORS) desde http://localhost:5173 (CLIENT_URL).
    // strictPort evita que Vite se mueva en silencio a 5174 si el puerto está ocupado,
    // lo que haría fallar todas las llamadas a la API por CORS.
    port: 5173,
    strictPort: true,
  },
});
