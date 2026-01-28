import type { Plugin } from 'vite';

/**
 * Development CSP plugin
 * Mirrors the production CSP from public/_headers for local development
 */
export default function devCSP(): Plugin {
  return {
    name: 'fitfi-dev-csp',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        // Set CSP headers for development (mirrors production _headers)
        res.setHeader(
          'Content-Security-Policy',
          [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://*.supabase.co",
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            "font-src 'self' https://fonts.gstatic.com",
            "img-src 'self' data: https: blob:",
            "connect-src 'self' https://*.supabase.co https://www.google-analytics.com https://analytics.google.com https://www.googletagmanager.com https://www.google.lk https://images.pexels.com https://example.com https://fonts.googleapis.com https://fonts.gstatic.com",
            "frame-src 'none'",
            "frame-ancestors 'self'",
            "object-src 'none'",
            "base-uri 'self'",
            "form-action 'self'",
          ].join('; ')
        );
        next();
      });
    },
  };
}
