import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main:  resolve(__dirname, 'index.html'),
        app:   resolve(__dirname, 'app.html'),
        admin: resolve(__dirname, 'admin.html'),
        legal: resolve(__dirname, 'legal.html'),
      },
    },
  },
})
