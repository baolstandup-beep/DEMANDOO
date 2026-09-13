import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  // base: './' est obligatoire pour Capacitor (protocole capacitor:// sur l'appareil)
  base: './',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    strictPort: false, // Vite try 5173, if taken, it tries 5174, etc. But we want to make sure it's 5173 if possible. Let's kill whatever is on 5173 first if needed.
    host: true,
  },
});
