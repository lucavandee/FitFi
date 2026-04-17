/**
 * Shared CORS helper for Supabase edge functions.
 *
 * Replaces the previous `Access-Control-Allow-Origin: *` wildcard with an
 * explicit allowlist. Any origin not on the list receives `null` for the
 * Allow-Origin header, which browsers will block.
 *
 * Stripe webhooks are server-to-server and do not use CORS, so the wildcard
 * removal does not affect them — the headers are only consulted by browsers.
 */

const ALLOWED_ORIGINS: ReadonlySet<string> = new Set([
  "https://fitfi.ai",
  "https://www.fitfi.ai",
  "https://fitfi.netlify.app",
  // Local development
  "http://localhost:5173",
  "http://localhost:4173",
  "http://localhost:8888",
]);

const BASE_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Client-Info, Apikey",
  "Access-Control-Max-Age": "86400",
  "Vary": "Origin",
};

export function buildCorsHeaders(
  req: Request,
  extraHeaders: Record<string, string> = {},
): Record<string, string> {
  const origin = req.headers.get("Origin") ?? "";
  const allowOrigin = ALLOWED_ORIGINS.has(origin) ? origin : "null";

  return {
    ...BASE_HEADERS,
    ...extraHeaders,
    "Access-Control-Allow-Origin": allowOrigin,
  };
}

export function isOriginAllowed(req: Request): boolean {
  const origin = req.headers.get("Origin");
  if (!origin) return true; // server-to-server (no Origin header)
  return ALLOWED_ORIGINS.has(origin);
}
