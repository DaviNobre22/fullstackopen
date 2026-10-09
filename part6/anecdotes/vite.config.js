import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    // a simulated browser, so components can be rendered in the tests
    environment: 'jsdom',
    // lets React Testing Library clean up the rendered components after each test
    globals: true,
  },
})
