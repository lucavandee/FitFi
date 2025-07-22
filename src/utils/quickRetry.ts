/**
 * Quick retry utility for FitFi
 * Intelligently retries only missing data instead of full reload
 */

import { UserProfile } from '../context/UserContext';
import { Outfit, Product } from '../engine';
import { getOutfits, getRecommendedProducts } from '../services/DataRouter';

export interface RetryOptions {
  retryOutfits?: boolean;
  retryProducts?: boolean;
  retryProfile?: boolean;
  maxAttempts?: number;
  backoffMs?: number;
}

export interface RetryResult {
  success: boolean;
  outfits?: Outfit[];
  products?: Product[];
  errors: string[];
  attempts: number;
  duration: number;
}

export interface MissingData {
  outfits: boolean;
  products: boolean;
  profile: boolean;
}

/**
 * Analyze what data is missing
 */
export function analyzeMissingData(
  outfits: Outfit[],
  products: Product[],
  profile: any
): MissingData {
  return {
    outfits: !outfits || outfits.length === 0,
    products: !products || products.length === 0,
    profile: !profile || !profile.type
  };
}

/**
 * Quick retry for missing data only
 */
export async function quickRetry(
  user: UserProfile,
  currentOutfits: Outfit[],
  currentProducts: Product[],
  currentProfile: any,
  options: RetryOptions = {}
): Promise<RetryResult> {
  const startTime = Date.now();
  const {
    maxAttempts = 3,
    backoffMs = 1000
  } = options;
  
  const missing = analyzeMissingData(currentOutfits, currentProducts, currentProfile);
  const errors: string[] = [];
  let attempts = 0;
  
  // Determine what needs to be retried
  const needsRetry = {
    outfits: options.retryOutfits !== false && missing.outfits,
    products: options.retryProducts !== false && missing.products,
    profile: options.retryProfile !== false && missing.profile
  };
  
  console.log('[🔄 QuickRetry] Analyzing missing data:', missing);
  console.log('[🔄 QuickRetry] Will retry:', needsRetry);
  
  let newOutfits = currentOutfits;
  let newProducts = currentProducts;
  
  // Track retry attempt
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'quick_retry_start', {
      event_category: 'error_recovery',
      event_label: 'missing_data',
      missing_outfits: missing.outfits,
      missing_products: missing.products,
      missing_profile: missing.profile
    });
  }
  
  // Retry outfits if needed
  if (needsRetry.outfits) {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      attempts++;
      
      try {
        console.log(`[🔄 QuickRetry] Retrying outfits (attempt ${attempt}/${maxAttempts})`);
        
        const outfits = await getOutfits(user, { count: 3 });
        
        if (outfits && outfits.length > 0) {
          newOutfits = outfits;
          console.log(`[✅ QuickRetry] Successfully loaded ${outfits.length} outfits`);
          break;
        } else {
          throw new Error('No outfits returned');
        }
      } catch (error) {
        const errorMsg = `Outfits attempt ${attempt}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        errors.push(errorMsg);
        console.error(`[❌ QuickRetry] ${errorMsg}`);
        
        // Wait before next attempt (exponential backoff)
        if (attempt < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, backoffMs * attempt));
        }
      }
    }
  }
  
  // Retry products if needed
  if (needsRetry.products) {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      attempts++;
      
      try {
        console.log(`[🔄 QuickRetry] Retrying products (attempt ${attempt}/${maxAttempts})`);
        
        const products = await getRecommendedProducts(user, 6);
        
        if (products && products.length > 0) {
          newProducts = products;
          console.log(`[✅ QuickRetry] Successfully loaded ${products.length} products`);
          break;
        } else {
          throw new Error('No products returned');
        }
      } catch (error) {
        const errorMsg = `Products attempt ${attempt}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        errors.push(errorMsg);
        console.error(`[❌ QuickRetry] ${errorMsg}`);
        
        // Wait before next attempt (exponential backoff)
        if (attempt < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, backoffMs * attempt));
        }
      }
    }
  }
  
  const duration = Date.now() - startTime;
  const success = (!needsRetry.outfits || newOutfits.length > 0) && 
                  (!needsRetry.products || newProducts.length > 0);
  
  // Track retry result
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'quick_retry_complete', {
      event_category: 'error_recovery',
      event_label: success ? 'success' : 'failure',
      duration_ms: duration,
      attempts,
      errors_count: errors.length
    });
  }
  
  console.log(`[🔄 QuickRetry] Completed in ${duration}ms with ${attempts} attempts. Success: ${success}`);
  
  return {
    success,
    outfits: newOutfits,
    products: newProducts,
    errors,
    attempts,
    duration
  };
}

/**
 * Smart retry that only retries what's actually missing
 */
export async function smartRetry(
  user: UserProfile,
  currentData: {
    outfits: Outfit[];
    products: Product[];
    profile: any;
  }
): Promise<RetryResult> {
  const missing = analyzeMissingData(currentData.outfits, currentData.products, currentData.profile);
  
  // If nothing is missing, return success immediately
  if (!missing.outfits && !missing.products && !missing.profile) {
    console.log('[🔄 QuickRetry] No missing data, skipping retry');
    return {
      success: true,
      outfits: currentData.outfits,
      products: currentData.products,
      errors: [],
      attempts: 0,
      duration: 0
    };
  }
  
  // Only retry what's missing
  return quickRetry(
    user,
    currentData.outfits,
    currentData.products,
    currentData.profile,
    {
      retryOutfits: missing.outfits,
      retryProducts: missing.products,
      retryProfile: missing.profile,
      maxAttempts: 2, // Fewer attempts for smart retry
      backoffMs: 500  // Faster backoff for smart retry
    }
  );
}

/**
 * Partial data recovery - try to get at least some data
 */
export async function partialRecovery(
  user: UserProfile
): Promise<{
  outfits: Outfit[];
  products: Product[];
  hasPartialData: boolean;
}> {
  console.log('[🔄 QuickRetry] Attempting partial data recovery');
  
  let outfits: Outfit[] = [];
  let products: Product[] = [];
  
  // Try to get at least one outfit
  try {
    const outfitResult = await getOutfits(user, { count: 1 });
    if (outfitResult && outfitResult.length > 0) {
      outfits = outfitResult;
    }
  } catch (error) {
    console.error('[❌ QuickRetry] Failed to get even one outfit:', error);
  }
  
  // Try to get at least some products
  try {
    const productResult = await getRecommendedProducts(user, 3);
    if (productResult && productResult.length > 0) {
      products = productResult;
    }
  } catch (error) {
    console.error('[❌ QuickRetry] Failed to get any products:', error);
  }
  
  const hasPartialData = outfits.length > 0 || products.length > 0;
  
  console.log(`[🔄 QuickRetry] Partial recovery result: ${outfits.length} outfits, ${products.length} products`);
  
  return {
    outfits,
    products,
    hasPartialData
  };
}

/**
 * Progressive retry - start with partial data, then fill in gaps
 */
export async function progressiveRetry(
  user: UserProfile,
  onPartialData?: (outfits: Outfit[], products: Product[]) => void,
  onComplete?: (outfits: Outfit[], products: Product[]) => void
): Promise<RetryResult> {
  const startTime = Date.now();
  let attempts = 0;
  const errors: string[] = [];
  
  console.log('[🔄 QuickRetry] Starting progressive retry');
  
  try {
    // Step 1: Get partial data quickly
    attempts++;
    const partial = await partialRecovery(user);
    
    if (partial.hasPartialData && onPartialData) {
      console.log('[🔄 QuickRetry] Showing partial data to user');
      onPartialData(partial.outfits, partial.products);
    }
    
    // Step 2: Fill in missing data
    const missing = analyzeMissingData(partial.outfits, partial.products, null);
    
    if (missing.outfits || missing.products) {
      console.log('[🔄 QuickRetry] Filling in missing data');
      
      const retryResult = await quickRetry(
        user,
        partial.outfits,
        partial.products,
        null,
        {
          retryOutfits: missing.outfits,
          retryProducts: missing.products,
          maxAttempts: 2,
          backoffMs: 1000
        }
      );
      
      attempts += retryResult.attempts;
      errors.push(...retryResult.errors);
      
      if (onComplete) {
        onComplete(retryResult.outfits || [], retryResult.products || []);
      }
      
      const duration = Date.now() - startTime;
      
      return {
        success: retryResult.success,
        outfits: retryResult.outfits,
        products: retryResult.products,
        errors,
        attempts,
        duration
      };
    } else {
      // We have all the data we need
      if (onComplete) {
        onComplete(partial.outfits, partial.products);
      }
      
      const duration = Date.now() - startTime;
      
      return {
        success: true,
        outfits: partial.outfits,
        products: partial.products,
        errors,
        attempts,
        duration
      };
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    errors.push(errorMsg);
    console.error('[❌ QuickRetry] Progressive retry failed:', error);
    
    const duration = Date.now() - startTime;
    
    return {
      success: false,
      outfits: [],
      products: [],
      errors,
      attempts,
      duration
    };
  }
}

export default {
  analyzeMissingData,
  quickRetry,
  smartRetry,
  partialRecovery,
  progressiveRetry
};