import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Alias '@' → '/src'; geen node:path, conform freeze.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  // Bewust geen SSR/extra rollup externals — client-only SPA.
});