import React, { useEffect } from 'react';

interface CookieConsentProps {
  className?: string;
}

/**
 * Cookie Consent Banner using Cookiebot (IAB TCF 2.2 compliant)
 * Free tier supports 1 domain - perfect for FitFi
 */
const CookieConsent: React.FC<CookieConsentProps> = ({ className = '' }) => {
  useEffect(() => {
    // Load Cookiebot script
    const script = document.createElement('script');
    script.id = 'Cookiebot';
    script.src = 'https://consent.cookiebot.com/uc.js';
    script.setAttribute('data-cbid', 'YOUR-COOKIEBOT-ID'); // Replace with actual Cookiebot ID
    script.setAttribute('data-blockingmode', 'auto');
    script.type = 'text/javascript';
    
    document.head.appendChild(script);
    
    return () => {
      // Cleanup on unmount
      const existingScript = document.getElementById('Cookiebot');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  return (
    <div className={className}>
      {/* Cookiebot banner will be injected here automatically */}
      <div id="CookiebotDeclaration" data-culture="NL" data-framework="IAB"></div>
    </div>
  );
};

export default CookieConsent;