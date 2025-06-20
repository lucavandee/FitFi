import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Forceer de automatische JSX-runtime voor React 17+ syntax
      jsxRuntime: 'automatic',
      // Expliciet importSource voor consistentie
      jsxImportSource: 'react',
    }),
  ],
  optimizeDeps: {
    // Exclude lucide-react from dependency pre-bundling
    exclude: ['lucide-react'],
  },
  resolve: {
    // Optioneel: alias configuratie voor overzichtelijke imports
    alias: {
      '@': '/src',
    },
  },
  server: {
    // Optioneel: configureer dev server poort en open browser
    port: 3000,
    open: true,
  },
  build: {
    // Public base path of environment afhandelen
    outDir: 'dist',
    sourcemap: true,
  },
});
