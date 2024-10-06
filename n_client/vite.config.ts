import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',  // Listens on all network interfaces
    port: 3000,        // Port number (you can change this if needed)
    headers: {
      'Permissions-Policy': 'camera=(self)',
    },
  },
})
