import { useState, useEffect } from 'react';

interface ABVariantOptions {
  testName: string;
  variants?: string[];
  defaultVariant?: string;
}

/**
 * Hook for A/B testing variants
 * Returns consistent variant for user session
 */
export function useABVariant(
  testName: string, 
  options: ABVariantOptions = {}
): string {
  const {
    variants = ['control', 'variant_a'],
    defaultVariant = 'control'
  } = options;

  const [variant, setVariant] = useState<string>(defaultVariant);

  useEffect(() => {
    // Get or create session-based variant
    const storageKey = `fitfi_ab_${testName}`;
    
    try {
      let storedVariant = sessionStorage.getItem(storageKey);
      
      if (!storedVariant || !variants.includes(storedVariant)) {
        // Assign new variant based on user ID hash or random
        const userId = localStorage.getItem('fitfi_user_id') || 'anonymous';
        const hash = simpleHash(userId + testName);
        const variantIndex = hash % variants.length;
        storedVariant = variants[variantIndex];
        
        sessionStorage.setItem(storageKey, storedVariant);
        
        // Track variant assignment
        if (typeof window.gtag === 'function') {
          window.gtag('event', 'ab_variant_assigned', {
            event_category: 'ab_testing',
            event_label: testName,
            variant: storedVariant,
            user_id: userId
          });
        }
      }
      
      setVariant(storedVariant);
    } catch (error) {
      console.warn('[useABVariant] Storage failed, using default:', error);
      setVariant(defaultVariant);
    }
  }, [testName, variants, defaultVariant]);

  return variant;
}

/**
 * Simple hash function for consistent variant assignment
 */
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}