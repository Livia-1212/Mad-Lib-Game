import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'


export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    proxy: {
      '/submit': 'http://localhost:8000',
      '/results': 'http://localhost:8000'
    }
  }
})
