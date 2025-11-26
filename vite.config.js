import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 4000,          // <<< change this number to any port you want
    open: true,          // auto-open browser (optional)
    host: true           // allows LAN/mobile access (optional)
  }
})
