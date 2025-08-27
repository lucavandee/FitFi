import React from 'react';
import ReactDOM from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from '@/providers/AuthProvider';
import App from './App';
import './index.css';

const path = window.location.pathname;
let Root: React.FC = App as any;

async function loadSanity(){
  if (path.startsWith('/__env-sanity')) {
    const m = await import('@/sanity/EnvSanity'); Root = (m.default as any);
  } else if (path.startsWith('/__auth-sanity')) {
    const m = await import('@/sanity/AuthSanity'); Root = (m.default as any);
  } else if (path.startsWith('/__nova-sanity')) {
    const m = await import('@/sanity/NovaSanity'); Root = (m.default as any);
  }
}
await loadSanity();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HelmetProvider>
      <AuthProvider>
        <Root />
      </AuthProvider>
    </HelmetProvider>
  </React.StrictMode>
);