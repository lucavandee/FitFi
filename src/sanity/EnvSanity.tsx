import { ENV } from '@/env';

function mask(v?: string){ return v ? `${v.slice(0,6)}…${v.slice(-6)}` : 'missing' }

export default function EnvSanity(){
  const info = {
    SUPABASE_URL: ENV.SUPABASE_URL || 'missing',
    SUPABASE_ANON_KEY: ENV.SUPABASE_ANON_KEY ? 'present ('+mask(ENV.SUPABASE_ANON_KEY)+')' : 'missing',
    SOURCE_HINT: (() => {
      if ((import.meta as any).env?.VITE_SUPABASE_URL) return 'import.meta.env';
      if ((window as any).__FITFI_ENV__?.SUPABASE_URL) return 'window.__FITFI_ENV__';
      const hasMeta = !!document.querySelector('meta[name="supabase-url"]');
      return hasMeta ? 'meta[name]' : 'unknown';
    })(),
  };
  return (
    <div style={{padding:'16px', fontFamily:'ui-sans-serif'}}>
      <h1>Env Sanity</h1>
      <pre>{JSON.stringify(info, null, 2)}</pre>
      <p>Nova function: <code>/.netlify/functions/nova</code></p>
    </div>
  );
}