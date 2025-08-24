type Partner = 'amazon' | 'awin' | 'none';

function _getEnvPartner(): Partner {
  const p = (import.meta.env.VITE_DEFAULT_SHOP_PARTNER || '').toLowerCase();
  if (p === 'amazon') return 'amazon';
  if (p === 'awin') return 'awin';
  return 'none';
}

export function getDefaultPartner(): Partner {
  return _getEnvPartner();
}

export function detectPartner(url?: string): Partner {
  if (!url) return getDefaultPartner();
  
  if (url.includes('amazon.')) return 'amazon';
  if (url.includes('awin1.com')) return 'awin';
  
  return getDefaultPartner();
}

export function buildDeeplink(rawUrl?: string): string | undefined {
  if (!rawUrl) return rawUrl;
  const p = _getEnvPartner();

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

export const buildAffiliateUrl = buildDeeplink;