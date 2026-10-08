import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // the backend serves the production build, so build straight into its dist folder
    outDir: '../phonebook-backend/dist',
    emptyOutDir: true,
  },
  server: {
    proxy: {
      // send requests for /api/... to the Express backend
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
})
