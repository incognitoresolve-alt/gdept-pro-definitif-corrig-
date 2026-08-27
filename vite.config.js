import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { configDefaults } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  test: {
    // functions/ a ses propres tests + sa propre config Vitest (voir
    // functions/vitest.config.js), exécutés dans un job CI séparé où
    // functions/node_modules n'est pas installé ici.
    exclude: [...configDefaults.exclude, 'functions/**'],
  },
})