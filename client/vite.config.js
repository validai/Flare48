import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()], // ❌ Remove tailwindcss() from here
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
