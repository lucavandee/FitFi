import { muteThirdParty, appsignalEnabled } from "@/utils/env";

declare global {
  interface Window {
    appsignal?: any;
    chmln?: any;
  }
}

export function installThirdPartyGuards() {
  if (!muteThirdParty && appsignalEnabled) return;
  try {
    window.appsignal = window.appsignal ?? {
      addBreadcrumb() {},
      setUser() {},
      setContext() {},
      instrument() {},
      start() {},
      stop() {},
    };
  } catch {}
  try {
    window.chmln = window.chmln ?? function noop() {};
  } catch {}
}
