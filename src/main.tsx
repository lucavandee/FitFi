import React from 'react';
import ReactDOM from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from '@/providers/AuthProvider';
import App from './App';
import './index.css';

async function bootstrap() {
  // Laad sanity routes dynamisch (zonder top-level await)
  // Altijd een string; fallback naar '/'
  // Altijd een string; fallback naar '/'
  const currentPathname: string = String(
    (typeof globalThis !== 'undefined' && (globalThis as any)?.location?.pathname) ?? '/'
  );

  // Dynamische import van sanity routes (zonder top-level await)
  try {
    if (currentPathname.startsWith('/__auth-sanity')) {
      const m = await import('@/sanity/AuthSanity'); Root = m.default as any;
    } else if (currentPathname.startsWith('/__nova-sanity')) {
      const m = await import('@/sanity/NovaSanity'); Root = m.default as any;
    } else if (currentPathname.startsWith('/__env-sanity')) {
      const m = await import('@/sanity/EnvSanity'); Root = m.default as any;
    } else if (currentPathname.startsWith('/__auth-diagnose')) {
      const m = await import('@/sanity/AuthDiagnose'); Root = m.default as any;
    }
  } catch (e) {
    console.error('Sanity route dynamic import failed:', e);
      const m = await import('@/sanity/EnvSanity'); Root = m.default as any;
    } else if (currentPathname.slice(0, '/__auth-diagnose'.length) === '/__auth-diagnose') {
      const m = await import('@/sanity/AuthDiagnose'); Root = m.default as any;
    }
  } catch (e) {
    console.error('Sanity route dynamic import failed:', e);
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