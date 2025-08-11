// src/services/affiliateLinkBuilder.ts
import { DATA_CONFIG } from "@/config/dataConfig";

export type AffiliateProviderKey = keyof typeof DATA_CONFIG.AFFILIATE.providers;

export function buildAffiliateUrl(rawUrl: string, provider: AffiliateProviderKey = "generic"): string {
  try {
    const url = new URL(rawUrl);
    const cfg = DATA_CONFIG.AFFILIATE;
    const prov = cfg.providers[provider] ?? cfg.providers.generic;

    if (prov?.param && prov?.id) url.searchParams.set(prov.param, prov.id);

    const { utm_source, utm_medium, utm_campaign } = cfg.defaultUtm;
    url.searchParams.set("utm_source", utm_source);
    url.searchParams.set("utm_medium", utm_medium);
    url.searchParams.set("utm_campaign", utm_campaign);

    return url.toString();
  } catch {
    return rawUrl; // nooit crashen op ongeldige URL
  }
}

/**
 * Enhanced affiliate link builder with tracking and validation
 */
export interface AffiliateOptions {
  provider?: AffiliateProviderKey;
  customParams?: Record<string, string>;
  trackingId?: string;
  campaignOverride?: string;
}

/**
 * Build affiliate URL with enhanced options
 */
export function buildEnhancedAffiliateUrl(
  rawUrl: string, 
  options: AffiliateOptions = {}
): string {
  const {
    provider = "generic",
    customParams = {},
    trackingId,
    campaignOverride
  } = options;

  try {
    const url = new URL(rawUrl);
    const cfg = DATA_CONFIG.AFFILIATE;
    const prov = cfg.providers[provider] ?? cfg.providers.generic;

    // Add provider-specific affiliate parameter
    if (prov?.param && prov?.id) {
      url.searchParams.set(prov.param, prov.id);
    }

    // Add UTM parameters
    const { utm_source, utm_medium, utm_campaign } = cfg.defaultUtm;
    url.searchParams.set("utm_source", utm_source);
    url.searchParams.set("utm_medium", utm_medium);
    url.searchParams.set("utm_campaign", campaignOverride || utm_campaign);

    // Add tracking ID if provided
    if (trackingId) {
      url.searchParams.set("fitfi_track", trackingId);
    }

    // Add custom parameters
    Object.entries(customParams).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });

    // Add timestamp for tracking
    url.searchParams.set("fitfi_ts", Date.now().toString());

    return url.toString();
  } catch (error) {
    console.warn('[AffiliateLinkBuilder] Invalid URL, returning original:', rawUrl);
    return rawUrl; // nooit crashen op ongeldige URL
  }
}

/**
 * Detect affiliate provider from URL
 */
export function detectAffiliateProvider(url: string): AffiliateProviderKey {
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
 * Validate affiliate URL
 */
export function isValidAffiliateUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'https:' && urlObj.hostname.length > 0;
  } catch {
    return false;
  }
}

/**
 * Extract affiliate parameters from URL
 */
export function extractAffiliateParams(url: string): Record<string, string> {
  try {
    const urlObj = new URL(url);
    const params: Record<string, string> = {};
    
    // Extract UTM parameters
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach(param => {
      const value = urlObj.searchParams.get(param);
      if (value) params[param] = value;
    });
    
    // Extract FitFi tracking parameters
    ['fitfi_track', 'fitfi_ts'].forEach(param => {
      const value = urlObj.searchParams.get(param);
      if (value) params[param] = value;
    });
    
    return params;
  } catch {
    return {};
  }
}

/**
 * Clean affiliate URL (remove tracking parameters)
 */
export function cleanAffiliateUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    
    // Remove tracking parameters
    const trackingParams = [
      'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term',
      'fitfi_track', 'fitfi_ts', 'ref', 'aff_id', 'tag', 'wmc'
    ];
    
    trackingParams.forEach(param => {
      urlObj.searchParams.delete(param);
    });
    
    return urlObj.toString();
  } catch {
    return url;
  }
}

/**
 * Track affiliate click for analytics
 */
export function trackAffiliateClick(
  url: string, 
  provider: AffiliateProviderKey,
  productId?: string,
  userId?: string
): void {
  try {
    // Track in Google Analytics
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'affiliate_click', {
        event_category: 'ecommerce',
        event_label: provider,
        custom_parameter_1: productId,
        custom_parameter_2: userId,
        affiliate_provider: provider,
        product_id: productId
      });
    }
    
    // Track in telemetry
    if (typeof track === 'function') {
      track('affiliate_click', {
        provider,
        productId,
        userId,
        url: url.substring(0, 100) + '...' // Truncate for privacy
      });
    }
    
    console.log('[AffiliateLinkBuilder] Click tracked:', {
      provider,
      productId,
      url: url.substring(0, 50) + '...'
    });
  } catch (error) {
    console.warn('[AffiliateLinkBuilder] Tracking failed:', error);
  }
}