import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/figma-004/',
  server: {
    port: 5173,
    host: true,
  },
})
