type Partner = 'amazon' | 'awin' | 'none';

export function getDefaultPartner(): Partner {
  const p = (import.meta.env.VITE_DEFAULT_SHOP_PARTNER || '').toLowerCase();
  if (p === 'amazon') return 'amazon';
  if (p === 'awin') return 'awin';
  return 'none';
}

export function detectPartner(url: string): Partner | null {
  if (!url) return null;
  
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    
    if (hostname.includes('amazon')) return 'amazon';
    if (hostname.includes('awin')) return 'awin';
    
    return null;
  } catch {
    return null;
  }
}

export function buildAffiliateUrl(rawUrl: string, partner?: Partner): string {
  if (!rawUrl) return rawUrl;
  
  const p = partner || getDefaultPartner();

  if (p === 'amazon') {
    const tag = import.meta.env.VITE_AMAZON_TAG;
    if (!tag) return rawUrl;
    try { 
      const u = new URL(rawUrl); 
      if (!u.searchParams.get('tag')) u.searchParams.set('tag', tag); 
      return u.toString(); 
    } catch { 
      return rawUrl; 
    }
  }

  if (p === 'awin') {
    const mid = import.meta.env.VITE_AWIN_MID;
    const aff = import.meta.env.VITE_AWIN_AFFID;
    if (!mid || !aff) return rawUrl;
    return `https://www.awin1.com/cread.php?awinmid=${mid}&awinaffid=${aff}&ued=${encodeURIComponent(rawUrl)}`;
  }

  return rawUrl;
}

export function buildDeeplink(partner: Partner, query: string): string;
export function buildDeeplink(rawUrl?: string): string | undefined;
export function buildDeeplink(partnerOrUrl?: Partner | string, query?: string): string | undefined {
  // Handle the two-parameter signature (partner, query)
  if (typeof partnerOrUrl === 'string' && partnerOrUrl !== undefined && query !== undefined) {
    const partner = partnerOrUrl as Partner;
    
    if (partner === 'amazon') {
      const tag = import.meta.env.VITE_AMAZON_TAG;
      const baseUrl = `https://www.amazon.nl/s?k=${encodeURIComponent(query)}`;
      if (!tag) return baseUrl;
export function buildDeeplink(partnerOrUrl?: Partner | string, query?: string): string | undefined {
  // Handle the two different call signatures
  if (typeof partnerOrUrl === 'string' && partnerOrUrl && !query) {
    // Legacy signature: buildDeeplink(rawUrl)
    return buildDeeplinkLegacy(partnerOrUrl);
  }
  
  if (typeof partnerOrUrl === 'string' && query !== undefined) {
    // New signature: buildDeeplink(partner, query)
    const partner = partnerOrUrl as Partner;
    return buildDeeplinkWithPartner(partner, query);
  }
  
  return partnerOrUrl;
}

function buildDeeplinkLegacy(rawUrl?: string): string | undefined {
  if (!rawUrl) return rawUrl;
  const p = getDefaultPartner();

  if (p === 'amazon') {
    const tag = import.meta.env.VITE_AMAZON_TAG;
    if (!tag) return rawUrl;
    try { const u = new URL(rawUrl); if (!u.searchParams.get('tag')) u.searchParams.set('tag', tag); return u.toString(); } catch { return rawUrl; }
  }

  if (p === 'awin') {
    const mid = import.meta.env.VITE_AWIN_MID;
    const aff = import.meta.env.VITE_AWIN_AFFID;
    if (!mid || !aff) return rawUrl;
    return `https://www.awin1.com/cread.php?awinmid=${mid}&awinaffid=${aff}&ued=${encodeURIComponent(rawUrl)}`;
  }

  return rawUrl;
}
function buildDeeplinkWithPartner(partner: Partner, query: string): string {
  if (partner === 'amazon') {
    const tag = import.meta.env.VITE_AMAZON_TAG;
    const baseUrl = `https://www.amazon.nl/s?k=${encodeURIComponent(query)}`;
    if (tag) {
      return `${baseUrl}&tag=${tag}`;
    }
    return baseUrl;
  }
  
  if (partner === 'awin') {
    const mid = import.meta.env.VITE_AWIN_MID;
    const aff = import.meta.env.VITE_AWIN_AFFID;
    const targetUrl = `https://www.zalando.nl/dames/?q=${encodeURIComponent(query)}`;
    if (mid && aff) {
      return `https://www.awin1.com/cread.php?awinmid=${mid}&awinaffid=${aff}&ued=${encodeURIComponent(targetUrl)}`;
    }
    return targetUrl;
  }
  
  // Fallback for 'none' or unknown partners
  return `https://www.zalando.nl/dames/?q=${encodeURIComponent(query)}`;
}
