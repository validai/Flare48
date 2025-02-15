import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Load environment variables
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

export default defineConfig({
  plugins: [react()],
  root: '.',
  build: {
    outDir: 'dist',
  },
  server: {
    port: 5173, // Development port for Vite (Frontend)
    open: true, // Opens browser automatically
    proxy: {
      '/api': {
        target: API_URL,
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ''), // Removes '/api' prefix
      },
    },
  },
});
