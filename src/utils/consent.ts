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

    // If analytics is being disabled, remove GA cookies
    if (current.analytics && !prefs.analytics) {
      removeAnalyticsCookies();
    }

    const json = JSON.stringify(next);
    window.localStorage.setItem(KEY, json);
    // trigger cross-tab listeners
    window.dispatchEvent(new StorageEvent("storage", { key: KEY, newValue: json }));
  } catch {}
}

/**
 * Remove all Google Analytics cookies
 * Called when user withdraws analytics consent
 */
export function removeAnalyticsCookies() {
  const gaCookies = ['_ga', '_gid', '_gat', '_gat_gtag'];
  const domains = [
    window.location.hostname,
    `.${window.location.hostname}`,
    window.location.hostname.replace(/^www\./, ''),
    `.${window.location.hostname.replace(/^www\./, '')}`
  ];

  gaCookies.forEach(cookieName => {
    domains.forEach(domain => {
      // Remove cookie for each domain variant
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${domain}`;
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    });
  });

  // Also remove GA cookies that match pattern _ga_<container-id>
  const allCookies = document.cookie.split(';');
  allCookies.forEach(cookie => {
    const cookieName = cookie.split('=')[0].trim();
    if (cookieName.startsWith('_ga_')) {
      domains.forEach(domain => {
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${domain}`;
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      });
    }
  });
}

/**
 * Withdraw all consent (reset to defaults)
 * Removes all non-essential cookies
 */
export function withdrawConsent() {
  setCookiePrefs({ analytics: false, marketing: false });
  removeAnalyticsCookies();
}

/**
 * Check if consent banner should be shown
 */
export function shouldShowConsentBanner(): boolean {
  try {
    const raw = window.localStorage.getItem(KEY);
    return !raw; // Show banner if no preferences stored
  } catch {
    return true;
  }
}