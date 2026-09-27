/**
 * Shared CORS helper for Supabase edge functions.
 *
 * Replaces the previous `Access-Control-Allow-Origin: *` wildcard with an
 * explicit allowlist. An origin that is not on the list gets no
 * Allow-Origin header at all, so the browser blocks the read.
 *
 * Why not the literal string "null" (the previous behaviour, fixed after the
 * plan 2 final review on 27 September 2026): a browser sends `Origin: null`
 * itself from a sandboxed iframe, a data: or file: context and some
 * cross-origin redirects. Answering "null" therefore matched exactly what
 * such a context sent, and the browser allowed it to read the response.
 * That is the well-known "null origin whitelisted" hole, and it undid the
 * allowlist for precisely the contexts an attacker controls.
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
  const headers: Record<string, string> = { ...BASE_HEADERS, ...extraHeaders };

  // Only an allowlisted origin is echoed back. No header for anything else,
  // including a request without an Origin header: those are server-to-server
  // calls that ignore CORS anyway.
  if (ALLOWED_ORIGINS.has(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
  }

  return headers;
}

export function isOriginAllowed(req: Request): boolean {
  const origin = req.headers.get("Origin");
  if (!origin) return true; // server-to-server (no Origin header)
  return ALLOWED_ORIGINS.has(origin);
}
