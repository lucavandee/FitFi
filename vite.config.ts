import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import fitfiBoltGuard from "./src/plugins/fitfiBoltGuard"
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const disableThird = String(env.VITE_DISABLE_THIRD_PARTY ?? 'true').toLowerCase() === 'true';
  
  return {
    plugins: [react(), fitfiBoltGuard()],
    base: '/',
    resolve: {
      dedupe: ['react', 'react-dom', 'react-helmet-async'],
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json'],
      alias: [
        { find: '@', replacement: path.resolve(__dirname, 'src') },
        // Shim AppSignal/Chameleon (alle varianten)
        ...(disableThird ? [
          { find: /^@appsignal\/.*/, replacement: path.resolve(__dirname, 'src/shims/appsignal.ts') },
          { find: /^appsignal(\/.*)?$/, replacement: path.resolve(__dirname, 'src/shims/appsignal.ts') },
          { find: /^chameleon(-js)?(\/.*)?$/, replacement: path.resolve(__dirname, 'src/shims/chameleon.ts') },
        ] : []),
      ],
    },
    define: { 
      'process.env.NODE_ENV': JSON.stringify(mode),
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL || ''),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY || ''),
      'import.meta.env.VITE_USE_SUPABASE': JSON.stringify(env.VITE_USE_SUPABASE || 'false'),
      'import.meta.env.VITE_NOVA_ENABLED': JSON.stringify(env.VITE_NOVA_ENABLED || 'true'),
      'import.meta.env.VITE_GTAG_ID': JSON.stringify(env.VITE_GTAG_ID || ''),
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            router: ['react-router-dom'],
            ui: ['lucide-react', '@headlessui/react'],
          },
        },
      },
      chunkSizeWarningLimit: 1000,
    },
    server: {
      port: 3000,
      host: true,
    },
    preview: {
      port: 3000,
      host: true,
    },
  };
});
