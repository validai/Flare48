import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

import tailwindcss from '@tailwindcss/vite'


// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss()],
  base: "./", // Ensures correct asset paths in production
  server: {
    proxy: {
      "/api": "http://localhost:5000", // Use only for local development
    }
  },
  preview: {
    allowedHosts: ['flare48.onrender.com', 'localhost'], // Add your Render domain here
  }
})
