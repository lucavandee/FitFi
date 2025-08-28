export const SITE_ORIGIN =
  typeof window !== 'undefined'
    ? window.location.origin
    : (import.meta as any)?.env?.VITE_SITE_URL || 'http://localhost:8888';

export const AUTH_REDIRECT = `${SITE_ORIGIN}/auth/callback`;