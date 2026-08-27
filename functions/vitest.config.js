const { defineConfig } = require('vitest/config');

// Sans ce fichier, Vitest remonte à la racine du repo et charge vite.config.js
// (frontend), qui a besoin de vite/@vitejs/plugin-react — non installés quand
// functions/ est testé isolément (CI : job séparé, npm ci uniquement ici).
module.exports = defineConfig({
  test: {
    environment: 'node',
  },
});
