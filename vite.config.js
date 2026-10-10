import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => ({
  // base: './' est obligatoire pour Capacitor (protocole capacitor:// sur l'appareil)
  base: './',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  esbuild: mode === 'production'
    ? { pure: ['console.log', 'console.info', 'console.debug'] } // garde warn/error pour le diagnostic
    : {},
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
      },
      output: {
        // Bibliothèques stables dans des fichiers séparés : mieux mis en cache entre deux déploiements
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          supabase: ['@supabase/supabase-js'],
          leaflet: ['leaflet', 'react-leaflet'],
        },
      },
    },
  },
  server: {
    port: 5173,
    strictPort: false,
    host: true,
  },
}));
