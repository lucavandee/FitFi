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
 * Process referral on page load
 */
export function processReferralOnLoad(): void {
  const referralCode = getReferralCodeFromUrl();
  
  if (referralCode) {
    // Set cookie for later use during signup
    const expires = new Date();
    expires.setDate(expires.getDate() + 30);
    document.cookie = `ref_code=${referralCode}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
    
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

