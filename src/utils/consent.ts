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

/** Laat andere delen van de app consent bijwerken. */
export function setCookiePrefs(prefs: Partial<CookiePrefs>) {
  try {
    const current = getCookiePrefs();
    const next = { ...current, ...prefs, necessary: true };
    window.localStorage.setItem(KEY, JSON.stringify(next));
    // trigger storage listeners cross-tab
    window.dispatchEvent(new StorageEvent("storage", { key: KEY, newValue: JSON.stringify(next) }));
  } catch {}
}