// /src/utils/consent.ts
export type CookiePrefs = {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
};

const KEY = "ff_cookie_prefs";

export function getCookiePrefs(): CookiePrefs {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return { necessary: true, analytics: false, marketing: false };
    const parsed = JSON.parse(raw);
    return {
      necessary: true,
      analytics: !!parsed.analytics,
      marketing: !!parsed.marketing,
    };
  } catch {
    return { necessary: true, analytics: false, marketing: false };
  }
}

export function setCookiePrefs(prefs: Partial<CookiePrefs>) {
  try {
    const current = getCookiePrefs();
    const next = { ...current, ...prefs, necessary: true };
    const json = JSON.stringify(next);
    window.localStorage.setItem(KEY, json);
    // trigger cross-tab listeners
    window.dispatchEvent(new StorageEvent("storage", { key: KEY, newValue: json }));
  } catch {}
}