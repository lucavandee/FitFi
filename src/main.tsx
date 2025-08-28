import React from 'react';
import ReactDOM from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from '@/providers/AuthProvider';
import App from './App';
import './index.css';
import { StrictMode } from 'react'

function getPathname(): string {
  try {
    const p = (globalThis as any)?.location?.pathname;
    return typeof p === 'string' ? p : '/';
  } catch {
    return '/';
  }
}

async function loadRoot(): Promise<React.FC> {
  const pathname = getPathname();

  if (pathname.startsWith('/__auth-sanity')) {
    const m = await import('@/sanity/AuthSanity');
    return m.default as any;
  }
  if (pathname.startsWith('/__nova-sanity')) {
    const m = await import('@/sanity/NovaSanity');
    return m.default as any;
  }
  if (pathname.startsWith('/__env-sanity')) {
    const m = await import('@/sanity/EnvSanity');
    return m.default as any;
  }
  if (pathname.startsWith('/__auth-diagnose')) {
    const m = await import('@/sanity/AuthDiagnose');
    return m.default as any;
  }

  return App as any;
}

async function bootstrap() {
  const Root = await loadRoot();
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