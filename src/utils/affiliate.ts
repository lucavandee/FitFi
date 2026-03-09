import { supabase } from '@/lib/supabase';

function hashString(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36).padStart(8, '0').slice(0, 8);
}

function getSessionId(): string {
  const key = 'fitfi_session_id';
  let sessionId = sessionStorage.getItem(key);

  if (!sessionId) {
    sessionId = `${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
    sessionStorage.setItem(key, sessionId);
  }

  return sessionId;
}

export interface ClickRefParams {
  outfitId: string;
  slot: number;
  userId?: string;
}

export function buildClickRef(params: ClickRefParams): string {
  const { outfitId, slot } = params;
  const sessionId = getSessionId();
  const sessionHash = hashString(sessionId);

  return `ff_${outfitId}_${slot}_${sessionHash}`;
}

export async function logAffiliateClick(params: {
  clickRef: string;
  outfitId: string;
  productUrl: string;
  userId?: string;
  merchantName?: string;
}): Promise<void> {
  try {
    const { error } = await supabase
      .from('affiliate_clicks')
      .insert({
        click_ref: params.clickRef,
        outfit_id: params.outfitId,
        product_url: params.productUrl,
        user_id: params.userId || null,
        merchant_name: params.merchantName || null,
        session_id: getSessionId(),
        clicked_at: new Date().toISOString(),
      });

    if (error) {
      console.warn('[AffiliateClick] Failed to log:', error);
    }
  } catch (err) {
    console.warn('[AffiliateClick] Exception:', err);
  }
}

export function buildAwinUrl(
  originalUrl: string,
  clickRef: string,
  merchantId?: string
): string {
  try {
    const url = new URL(originalUrl);

    url.searchParams.set('utm_source', 'fitfi');
    url.searchParams.set('utm_medium', 'affiliate');
    url.searchParams.set('utm_campaign', 'awin');

    if (clickRef) {
      url.searchParams.set('clickref', clickRef);
    }

    if (merchantId) {
      url.searchParams.set('awc', merchantId);
    }

    return url.toString();
  } catch (error) {
    console.warn('[AwinUrl] Invalid URL:', originalUrl);
    return originalUrl;
  }
}

export function isAffiliateConsentGiven(): boolean {
  try {
    const raw = localStorage.getItem('ff_cookie_prefs');
    if (!raw) return false;
    const prefs = JSON.parse(raw);
    return !!prefs.marketing;
  } catch {
    return false;
  }
}

export function resolveProductUrl(product: {
  affiliateUrl?: string;
  productUrl?: string;
  url?: string;
  affiliate_url?: string;
  product_url?: string;
}): string | null {
  const raw =
    product.affiliateUrl ||
    product.affiliate_url ||
    product.productUrl ||
    product.product_url ||
    product.url ||
    null;
  if (!raw || raw === '#') return null;
  try {
    const u = new URL(raw);
    if (u.protocol === 'http:' || u.protocol === 'https:') return raw;
  } catch {
    /* invalid URL */
  }
  return null;
}

export interface OpenProductLinkParams {
  product: {
    id: string;
    name?: string;
    retailer?: string;
    price?: number;
    affiliateUrl?: string;
    productUrl?: string;
    url?: string;
    affiliate_url?: string;
    product_url?: string;
  };
  outfitId?: string;
  slot?: number;
  userId?: string;
  source?: string;
}

export async function openProductLink(params: OpenProductLinkParams): Promise<boolean> {
  const { product, outfitId, slot = 1, userId, source } = params;
  const baseUrl = resolveProductUrl(product);

  if (!baseUrl) return false;

  try {
    const { isProductLinkBroken } = await import('@/services/linkHealth/linkHealthService');
    if (isProductLinkBroken(product.id)) {
      return false;
    }
  } catch {
    /* link health service not loaded yet — proceed anyway */
  }

  try {
    const { track } = await import('@/utils/telemetry');
    track('product_click', {
      product_id: product.id,
      product_name: product.name,
      retailer: product.retailer,
      price: product.price,
      outfit_id: outfitId,
      position: slot,
      source: source || 'product_link',
    });

    if (isAffiliateConsentGiven()) {
      const clickRef = buildClickRef({
        outfitId: outfitId || product.id,
        slot,
        userId,
      });
      const affiliateUrl = buildAwinUrl(baseUrl, clickRef);

      logAffiliateClick({
        clickRef,
        outfitId: outfitId || product.id,
        productUrl: affiliateUrl,
        userId,
        merchantName: product.retailer,
      });

      window.open(affiliateUrl, '_blank', 'noopener,noreferrer');
    } else {
      const url = new URL(baseUrl);
      url.searchParams.set('utm_source', 'fitfi');
      url.searchParams.set('utm_medium', 'referral');
      window.open(url.toString(), '_blank', 'noopener,noreferrer');
    }

    return true;
  } catch {
    window.open(baseUrl, '_blank', 'noopener,noreferrer');
    return true;
  }
}

let _linkHealthModule: { isProductLinkBroken: (id: string) => boolean } | null = null;

import('@/services/linkHealth/linkHealthService')
  .then((m) => { _linkHealthModule = m; })
  .catch(() => {});

export function isProductShoppable(product: {
  id: string;
  affiliateUrl?: string;
  productUrl?: string;
  url?: string;
  affiliate_url?: string;
  product_url?: string;
}): boolean {
  if (!resolveProductUrl(product)) return false;
  if (_linkHealthModule?.isProductLinkBroken(product.id)) return false;
  return true;
}
