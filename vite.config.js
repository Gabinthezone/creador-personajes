import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  // IMPORTANTE: Reemplaza 'creador-personajes' por el nombre exacto de tu repo en GitHub
  base: '/creador-personajes/', 
})
