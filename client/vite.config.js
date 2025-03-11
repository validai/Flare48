import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: "./",
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    proxy: {
      "/api": "http://localhost:5000",
    }
  },
  preview: {
    allowedHosts: [
      'flare48.onrender.com',
      'flare48-6c1x.onrender.com',
      'flare48-j45i.onrender.com',
      'localhost'
    ],
  }
})
