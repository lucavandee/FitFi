export type CookiePrefs = {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  consented: boolean;
};

export const CONSENT_KEY = "fitfi.cookiePrefs.v1";

const DEFAULT_PREFS: CookiePrefs = {
  necessary: true,
  analytics: false,
  marketing: false,
  consented: false,
};

export function getCookiePrefs(): CookiePrefs {
  try {
    const raw = window.localStorage.getItem(CONSENT_KEY);
    if (!raw) return { ...DEFAULT_PREFS };
    const parsed = JSON.parse(raw);
    return {
      necessary: true,
      analytics: !!parsed.analytics,
      marketing: !!parsed.marketing,
      consented: !!parsed.consented,
    };
  } catch {
    return { ...DEFAULT_PREFS };
  }
}

export function setCookiePrefs(prefs: Partial<CookiePrefs>) {
  try {
    const current = getCookiePrefs();
    const next: CookiePrefs = { ...current, ...prefs, necessary: true };

    if (current.analytics && !next.analytics) {
      removeAnalyticsCookies();
    }

    const json = JSON.stringify(next);
    window.localStorage.setItem(CONSENT_KEY, json);
    window.dispatchEvent(new StorageEvent("storage", { key: CONSENT_KEY, newValue: json }));
  } catch {}
}

export function removeAnalyticsCookies() {
  const names = ["_ga", "_gid", "_gat", "_gat_gtag"];
  const hostname = window.location.hostname;
  const domains = [
    hostname,
    `.${hostname}`,
    hostname.replace(/^www\./, ""),
    `.${hostname.replace(/^www\./, "")}`,
  ];

  names.forEach((name) => {
    domains.forEach((domain) => {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${domain}`;
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    });
  });

  document.cookie.split(";").forEach((c) => {
    const name = c.split("=")[0].trim();
    if (name.startsWith("_ga_")) {
      domains.forEach((domain) => {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${domain}`;
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      });
    }
  });
}

export function withdrawConsent() {
  setCookiePrefs({ analytics: false, marketing: false, consented: false });
  removeAnalyticsCookies();
}

export function shouldShowConsentBanner(): boolean {
  try {
    const raw = window.localStorage.getItem(CONSENT_KEY);
    if (!raw) return true;
    return !JSON.parse(raw)?.consented;
  } catch {
    return true;
  }
}
