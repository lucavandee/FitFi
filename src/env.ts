type Maybe<T> = T | undefined | null;

function fromMeta(name: string): string | '' {
  const el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
  return (el?.content || '').trim();
}

const win: any = (typeof window !== 'undefined' ? window : {}) as any;

export const ENV = {
  SUPABASE_URL:
    (import.meta as any).env?.VITE_SUPABASE_URL as Maybe<string> ||
    win.__FITFI_ENV__?.SUPABASE_URL ||
    fromMeta('supabase-url') ||
    '',
  SUPABASE_ANON_KEY:
    (import.meta as any).env?.VITE_SUPABASE_ANON_KEY as Maybe<string> ||
    win.__FITFI_ENV__?.SUPABASE_ANON_KEY ||
    fromMeta('supabase-anon-key') ||
    '',
  OPENAI_API_KEY:
    (import.meta as any).env?.VITE_OPENAI_API_KEY as Maybe<string> ||
    win.__FITFI_ENV__?.OPENAI_API_KEY ||
    '',
};

// Nuttige masked logging in dev
export function logEnvOnce() {
  if (ENV.__logged) return;
  const mask = (v: string) => (v ? `${v.slice(0,6)}…${v.slice(-6)}` : 'missing');
  // @ts-ignore
  ENV.__logged = true;
  if (import.meta?.env?.DEV) {
    console.info('[ENV] SUPABASE_URL =', ENV.SUPABASE_URL || 'missing');
    console.info('[ENV] SUPABASE_ANON_KEY =', mask(ENV.SUPABASE_ANON_KEY));
  }
}