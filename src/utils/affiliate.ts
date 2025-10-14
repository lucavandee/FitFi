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
