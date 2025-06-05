// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  preview: {
    // libera esse hostname para o servidor de preview
    allowedHosts: ['utfprsustentavelfront.onrender.com']
  }
})
