// plugins/host-sweep.ts
// Vite plugin: centraliseert hostgebruik en waarschuwt voor losse '?ref=' patterns.
// - Vervangt 'https://fitfi.ai' hardcodes door de ingestelde host (env / fallback).
// - Geeft waarschuwingen bij '?ref=' zodat devs de helpers gebruiken.
// Styling blijft onaangeroerd.

import type { Plugin } from "vite";

type Options = {
  host?: string; // bv. 'https://fitfi.ai'
};

export default function hostSweep(opts?: Options): Plugin {
  const configuredHost = (opts?.host || "https://fitfi.ai").replace(/\/+$/, "");
  const hostRe = /https?:\/\/fitfi\.ai\/?/gi;
  const refRe = /(\?|\&)ref=/g;

  return {
    name: "fitfi-host-sweep",
    enforce: "pre",
    transform(code, id) {
      // Alleen onze bronbestanden
      if (!id.includes("/src/")) return null;

      let out = code;
      let touched = false;

      // 1) Hardcoded host vervangen door env-host (string-naar-string, geen styling impact)
      if (hostRe.test(out)) {
        out = out.replace(hostRe, configuredHost + "/");
        touched = true;
        this.warn(`[host-sweep] Host gerewritten naar ${configuredHost} in: ${id}`);
      }

      // 2) Losse '?ref=' signaleren (liever urls/share helpers)
      if (refRe.test(out)) {
        this.warn(
          `[host-sweep] '?ref=' gedetecteerd in: ${id}. Gebruik urls.buildReferralUrl()/share.makeInviteShare() i.p.v. string-concat.`
        );
      }

      return touched ? { code: out, map: null } : null;
    },
  };
}