import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  root: 'client',
  build: {
    outDir: 'dist',
  },
  server: {
    port: 5173, // Development port for Vite (Frontend)
    proxy: {
      '/api': {
        target: 'http://localhost:3000', // Backend API now runs on port 3000
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
