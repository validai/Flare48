import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'


export default defineConfig({
  plugins: [react(),tailwindcss()],
  base: "./",
  server: {
    proxy: {
      "/api": "http://localhost:5000",
    }
  },
  preview: {
    allowedHosts: ['flare48-6c1x.onrender.com', 'localhost'],
  }
})
