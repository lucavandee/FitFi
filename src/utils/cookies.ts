/**
 * Cookie settings utility for FitFi
 * Works with common CMPs (Cookiebot, OneTrust) and falls back to /cookies page
 */

/**
 * Opens cookie settings modal or navigates to cookie policy page
 * @returns true if CMP modal was opened, false if fallback was used
 */
export function openCookieSettings(): boolean {
  const w = window as any;
  
  try {
    // Try Cookiebot first
    if (w?.Cookiebot?.renew) { 
      w.Cookiebot.renew(); 
      return true; 
    }
    
    // Try OneTrust
    if (w?.OneTrust?.ToggleInfoDisplay) { 
      w.OneTrust.ToggleInfoDisplay(); 
      return true; 
    }
    
    // Try generic CookieConsent
    if (w?.CookieConsent?.renew) { 
      w.CookieConsent.renew(); 
      return true; 
    }
    
    // Try other common CMP methods
    if (w?.cookieControl?.open) {
      w.cookieControl.open();
      return true;
    }
    
    if (w?.tarteaucitron?.userInterface?.openPanel) {
      w.tarteaucitron.userInterface.openPanel();
      return true;
    }
  } catch (error) {
    console.warn('[CookieSettings] CMP method failed:', error);
  }
  
  // Fallback: navigate to cookie page
  try { 
    window.location.href = '/cookies'; 
    return false;
  } catch (error) {
    console.error('[CookieSettings] Fallback navigation failed:', error);
    return false;
  }
}

/**
 * Check if any CMP is available
 * @returns true if a CMP is detected
 */
export function isCMPAvailable(): boolean {
  const w = window as any;
  return !!(
    w?.Cookiebot?.renew ||
    w?.OneTrust?.ToggleInfoDisplay ||
    w?.CookieConsent?.renew ||
    w?.cookieControl?.open ||
    w?.tarteaucitron?.userInterface?.openPanel
  );
}

/**
 * Get current cookie consent status (if available from CMP)
 * @returns consent status object or null if not available
 */
export function getCookieConsent(): {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
} | null {
  const w = window as any;
  
  try {
    // Cookiebot
    if (w?.Cookiebot?.consent) {
      return {
        necessary: true, // Always true
        analytics: w.Cookiebot.consent.statistics,
        marketing: w.Cookiebot.consent.marketing
      };
    }
    
    // OneTrust
    if (w?.OneTrust?.GetDomainData) {
      const groups = w.OneTrust.GetDomainData().Groups;
      return {
        necessary: true,
        analytics: groups?.some((g: any) => g.GroupName?.includes('Analytics') && g.Status === 'active'),
        marketing: groups?.some((g: any) => g.GroupName?.includes('Marketing') && g.Status === 'active')
      };
    }
  } catch (error) {
    console.warn('[CookieSettings] Could not get consent status:', error);
  }
  
  return null;
}