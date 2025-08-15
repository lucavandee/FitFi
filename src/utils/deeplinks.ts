type Partner = 'zalando'|'amazon'|'bol';

const UTM = 'utm_source=fitfi&utm_medium=ai&utm_campaign=nova';

export function buildDeeplink(partner: Partner, q: string) {
  const query = encodeURIComponent(q.trim());
  switch (partner) {
    case 'zalando':
      // generieke zoek-URL
      return `https://www.zalando.nl/catalog/?q=${query}&${UTM}`;
    case 'amazon': {
      const tag = import.meta.env.VITE_AMAZON_TAG ? `&tag=${encodeURIComponent(import.meta.env.VITE_AMAZON_TAG)}` : '';
      return `https://www.amazon.nl/s?k=${query}${tag}&${UTM}`;
    }
    case 'bol':
      return `https://www.bol.com/nl/nl/s/?searchtext=${query}&${UTM}`;
    default:
      return `https://www.google.com/search?q=${query}+kleding`;
  }
}

export function getDefaultPartner(): Partner {
  const p = (import.meta.env.VITE_DEFAULT_SHOP_PARTNER || 'zalando').toLowerCase();
  return (['zalando','amazon','bol'].includes(p) ? (p as Partner) : 'zalando');
}

/**
 * Safe affiliate URL builder with UTM fallback
 * Always adds UTM parameters, only adds affiliate params when env present
 */
export function buildAffiliateUrl(originalUrl: string, partner?: string): string {
  if (!originalUrl) return originalUrl;
  
  try {
    const url = new URL(originalUrl);
    
    // Always add UTM parameters from config
    const defaultUtm = {
      utm_source: 'fitfi',
      utm_medium: 'affiliate', 
      utm_campaign: 'style-recs'
    };
    
    Object.entries(defaultUtm).forEach(([key, value]) => {
      if (!url.searchParams.has(key)) {
        url.searchParams.set(key, value);
      }
    });
    
    // Only add affiliate parameters if environment variable is present
    const shopPartner = import.meta.env.VITE_DEFAULT_SHOP_PARTNER;
    if (shopPartner && partner) {
      const affiliateConfig = {
        zalando: { param: 'wmc', id: 'fitfi_affiliate' },
        amazon: { param: 'tag', id: import.meta.env.VITE_AMAZON_TAG || 'fitfi-21' },
        bol: { param: 'partnerId', id: 'fitfi' }
      };
      
      const config = affiliateConfig[partner as keyof typeof affiliateConfig];
      if (config && !url.searchParams.has(config.param)) {
        url.searchParams.set(config.param, config.id);
      }
    }
    
    return url.toString();
  } catch (error) {
    console.warn('[AffiliateUrl] Invalid URL, returning original:', originalUrl);
    return originalUrl;
  }
}

/**
 * Extract partner from URL hostname
 */
export function detectPartner(url: string): string | null {
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    if (hostname.includes('zalando')) return 'zalando';
    if (hostname.includes('amazon')) return 'amazon';
    if (hostname.includes('bol.com')) return 'bol';
    return null;
  } catch {
    return null;
  }
}