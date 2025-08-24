import { disableMigrations, muteThirdParty } from "@/utils/env";

const MIGR = /\/api\/supabase\/migrations\//i;
const THIRD = /appsignal|chameleon\.io|appsignal-endpoint\.net/i;

export function installFetchGuards() {
  if (typeof window === "undefined" || typeof window.fetch !== "function")
    return;
  const orig = window.fetch.bind(window);
  window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
    try {
      const url = typeof input === "string" ? input : (input as URL).toString();
      if (disableMigrations && MIGR.test(url)) {
        return Promise.resolve(
          new Response(
            JSON.stringify({ skipped: true, reason: "migrations_disabled" }),
            { status: 200, headers: { "Content-Type": "application/json" } },
          ) as any,
        );
      }
      if (muteThirdParty && THIRD.test(url)) {
        return Promise.resolve(new Response(null, { status: 204 }) as any);
      }
    } catch {}
    return orig(input as any, init);
  };
}
