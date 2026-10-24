import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// base relatif : l'application fonctionne aussi bien en local que sur GitHub Pages.
export default defineConfig({
  base: './',
  plugins: [react()],
})
