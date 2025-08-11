/**
 * Utility functions for referral system
 */

/**
 * Get referral code from URL parameters
 */
function getReferralCodeFromUrl(): string | null {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('ref');
}

/**
 * Set referral code in cookie
 */
function setReferralCookie(code: string): void {
  const expires = new Date();
  expires.setDate(expires.getDate() + 30); // 30 days
  
  document.cookie = `ref_code=${code}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
}

/**
 * Get referral code from cookie
 */
function getReferralCookie(): string | null {
  const cookies = document.cookie.split(';');
  
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'ref_code') {
      return value ?? null;
    }
  }
  
  return null;
}

/**
 * Clear referral cookie
 */
function clearReferralCookie(): void {
  document.cookie = 'ref_code=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
}

/**
 * Process referral on page load
 */
export function processReferralOnLoad(): void {
  const referralCode = getReferralCodeFromUrl();
  
  if (referralCode) {
    // Set cookie for later use during signup
    setReferralCookie(referralCode);
    
    // Track referral click
    fetch(`/api/referral/register?code=${referralCode}`)
      .then(response => {
        if (response.ok) {
          console.log('Referral click tracked');
        }
      })
      .catch(error => {
        console.error('Error tracking referral click:', error);
      });
  }
}

/**
 * Generate referral URL
 */
function generateReferralUrl(code: string): string {
  const baseUrl = window.location.origin;
  return `${baseUrl}?ref=${code}`;
}

