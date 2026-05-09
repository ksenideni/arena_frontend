import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Бэкенд деплоится отдельно (см. .env.example, переменная VITE_API_BASE).
// Прокси ниже — удобство для dev: если VITE_API_BASE пустой, фронт ходит
// на тот же origin (5173), а Vite перебрасывает /api на :8080.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        ws: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
})
