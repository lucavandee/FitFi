import React from 'react';
import ReactDOM from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from '@/providers/AuthProvider';
import App from './App';
import './index.css';

async function bootstrap() {
  // Laad sanity routes dynamisch (zonder top-level await)

  // ✅ Forceer altijd string (coercion) en fallback naar '/'
  const currentPathname: string = String(
    (typeof globalThis !== 'undefined' && (globalThis as any)?.location?.pathname) ?? '/'
  );

  // Veilige prefix-check (werkt altijd op strings)
  if (is('/__auth-sanity')) {
    const m = await import('@/sanity/AuthSanity'); Root = (m.default as any);
  } else if (is('/__nova-sanity')) {
    const m = await import('@/sanity/NovaSanity'); Root = (m.default as any);
  } else if (is('/__env-sanity')) {
    const m = await import('@/sanity/EnvSanity'); Root = (m.default as any);
  } else if (is('/__auth-diagnose')) {
    const m = await import('@/sanity/AuthDiagnose'); Root = (m.default as any);
  } else if (path.startsWith('/__auth-sanity')) {
    const m = await import('@/sanity/AuthSanity'); Root = (m.default as any);
  } else if (path.startsWith('/__nova-sanity')) {
    const m = await import('@/sanity/NovaSanity'); Root = (m.default as any);
  } else if (path.startsWith('/__env-sanity')) {
    const m = await import('@/sanity/EnvSanity'); Root = (m.default as any);
  }
  if (path.startsWith('/__env-sanity')) {
    const m = await import('@/sanity/EnvSanity'); Root = (m.default as any);
  } else if (path.startsWith('/__auth-sanity')) {
    const m = await import('@/sanity/AuthSanity'); Root = (m.default as any);
  }

  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <HelmetProvider>
        <AuthProvider>
          <Root />
        </AuthProvider>
      </HelmetProvider>
    </React.StrictMode>
  );
}

bootstrap();