export function hasConsent(): boolean {
  if (typeof localStorage === 'undefined') return false;
  return localStorage.getItem('fitfi-cookie-consent') === 'accepted';
}

export function setConsent(value: 'accepted' | 'declined'): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem('fitfi-cookie-consent', value);
}

export function getConsentChoice(): string | null {
  if (typeof localStorage === 'undefined') return null;
  return localStorage.getItem('fitfi-cookie-consent');
}
