import { DATA_CONFIG } from '@/config/dataConfig';

/**
 * Affiliate link builder utilities
 */

interface AffiliateParams {
  url: string;
  provider?: 'generic' | 'amazon' | 'zalando';
  customParams?: Record<string, string>;
}

interface AffiliateResult {
  url: string;
  provider: string;
  params: Record<string, string>;
}

/**
 * Build affiliate link with UTM parameters
 */
export function buildAffiliateLink({
  url,
  provider = 'generic',
  customParams = {}
}: AffiliateParams): AffiliateResult {
  try {
    const urlObj = new URL(url);
    
    // Add default UTM parameters
    Object.entries(DATA_CONFIG.AFFILIATE.defaultUtm).forEach(([key, value]) => {
      urlObj.searchParams.set(key, value);
    });
    
    // Add provider-specific parameters
    const providerConfig = DATA_CONFIG.AFFILIATE.providers[provider];
    if (providerConfig) {
      urlObj.searchParams.set(providerConfig.param, providerConfig.id);
    }
    
    // Add custom parameters
    Object.entries(customParams).forEach(([key, value]) => {
      urlObj.searchParams.set(key, value);
    });
    
    // Add FitFi tracking parameter
    urlObj.searchParams.set('fitfi_ref', 'app');
    
    return {
      url: urlObj.toString(),
      provider,
      params: Object.fromEntries(urlObj.searchParams.entries())
    };
  } catch (error) {
    console.warn('[AffiliateUtils] Invalid URL, returning original:', url);
    return {
      url,
      provider,
      params: {}
    };
  }
}

/**
 * Detect provider from URL
 */
export function detectProvider(url: string): 'generic' | 'amazon' | 'zalando' {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    
    if (hostname.includes('amazon.')) {
      return 'amazon';
    }
    
    if (hostname.includes('zalando.')) {
      return 'zalando';
    }
    
    return 'generic';
  } catch {
    return 'generic';
  }
}

/**
 * Enhance product with affiliate link
 */
export function enhanceProductWithAffiliate<T extends { url?: string; affiliateUrl?: string }>(
  product: T,
  customParams?: Record<string, string>
): T & { affiliateUrl: string } {
  const originalUrl = product.url || product.affiliateUrl || '#';
  
  if (originalUrl === '#' || !originalUrl.startsWith('http')) {
    return {
      ...product,
      affiliateUrl: originalUrl
    };
  }
  
  const provider = detectProvider(originalUrl);
  const { url: affiliateUrl } = buildAffiliateLink({
    url: originalUrl,
    provider,
    customParams
  });
  
  return {
    ...product,
    affiliateUrl
  };
}

/**
 * Track affiliate click
 */
export function trackAffiliateClick(
  productId: string,
  provider: string,
  url: string
): void {
  // Track in analytics
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'affiliate_click', {
      event_category: 'ecommerce',
      event_label: provider,
      custom_parameter_1: productId,
      custom_parameter_2: url
    });
  }
  
  // Track in console for debugging
  console.log('[AffiliateUtils] Click tracked:', {
    productId,
    provider,
    url: url.substring(0, 100) + '...'
  });
}