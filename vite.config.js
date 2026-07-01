import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  base: mode === 'staging' ? '/staging/' : '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.js', 'src/**/*.test.jsx'],
    setupFiles: ['src/test/setup.js'],
  },
  server: {
    host: true,
    port: 5173,
    allowedHosts: [
      'localhost',
      'buggy.localhost',
      'cronjob.localhost',
      'ghoulhr.localhost',
      '.localhost',
      'peopleaiq.com',
      '*.peopleaiq.com',
      '*.localhost',
    ]
  }
}))
