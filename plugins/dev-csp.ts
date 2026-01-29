import type { Plugin } from 'vite';

/**
 * Development CSP plugin
 * Mirrors the production CSP from public/_headers for local development
 * In dev mode, relaxed to allow Bolt webcontainer iframe preview
 */
export default function devCSP(): Plugin {
  return {
    name: 'fitfi-dev-csp',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        // In dev mode, allow Bolt/webcontainer preview iframe embedding
        const isDev = process.env.NODE_ENV !== 'production';

        // CORS headers for dev preview (allows iframe embedding)
        if (isDev) {
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        }

        // Set CSP headers for development (mirrors production _headers)
        res.setHeader(
          'Content-Security-Policy',
          [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://analytics.google.com https://*.supabase.co",
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            "font-src 'self' https://fonts.gstatic.com",
            "img-src 'self' data: https: blob:",
            "connect-src 'self' https://*.supabase.co https://www.google-analytics.com https://analytics.google.com https://www.googletagmanager.com https://www.google.lk https://images.pexels.com https://example.com https://fonts.googleapis.com https://fonts.gstatic.com ws: wss:",
            "frame-src 'none'",
            isDev ? "frame-ancestors *" : "frame-ancestors 'self'", // Allow iframe in dev for Bolt
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
