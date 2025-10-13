import { useEffect } from 'react';
import { getCookiePrefs } from '@/utils/consent';
import { useLocation } from 'react-router-dom';

const AWIN_MERCHANT_ID = import.meta.env.VITE_AWIN_MERCHANT_ID;
const AWIN_ENABLED = import.meta.env.VITE_AWIN_ENABLED === 'true';

const ALLOWED_PAGES = ['/results', '/outfits', '/dashboard'];

export default function AwinMasterTag() {
  const location = useLocation();
  const prefs = getCookiePrefs();

  useEffect(() => {
    if (!AWIN_ENABLED || !AWIN_MERCHANT_ID) {
      return;
    }

    const isAllowedPage = ALLOWED_PAGES.some(page => location.pathname.startsWith(page));
    if (!isAllowedPage) {
      return;
    }

    if (!prefs.marketing) {
      return;
    }

    const existingScript = document.getElementById('awin-mastertag');
    if (existingScript) {
      return;
    }

    const script = document.createElement('script');
    script.id = 'awin-mastertag';
    script.async = true;
    script.src = `https://www.dwin1.com/${AWIN_MERCHANT_ID}.js`;
    script.setAttribute('data-consent', 'marketing');

    document.head.appendChild(script);

    return () => {
      const scriptToRemove = document.getElementById('awin-mastertag');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [location.pathname, prefs.marketing]);

  return null;
}
