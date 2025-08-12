import { useMemo, useCallback } from 'react';

interface ABTestingOptions {
  testName: string;
  variants: Array<{ name: string; weight: number }>;
}

export function useABTesting(options: ABTestingOptions) {
/**
 * Deterministic A/B testing hook that works with or without Supabase
 * Uses stable hash-based variant assignment as fallback
 */
  const variant = useABVariant(options.testName);
  
  const trackConversion = (data?: any) => {
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'ab_conversion', {
        test_name: options.testName,
  };
  
  return { variant, trackConversion };
}

export type Variant = 'control' | 'v1' | 'v2';

/** Dependency-loze hash (djb2-variant), deterministisch en snel */
function djb2Hash(input: string): number {
  let hash = 5381;
  for (let i = 0; i < input.length; i++) {
    hash = ((hash << 5) + hash) ^ input.charCodeAt(i);
  }
  return hash >>> 0; // forceer positief
}

function pickVariant(seed: string): Variant {
  const n = djb2Hash(seed) % 3;
  return n === 0 ? 'control' : n === 1 ? 'v1' : 'v2';
}

/**
 * Pure client-side A/B:
 * - Geen DB calls.
 * - Deterministisch per (testName,userId).
 * - trackClick/markExposure sturen naar gtag als beschikbaar; anders console.debug (no-crash).
 */
export function useABVariant(testName: string, userId?: string | null) {
  const variant = useMemo<Variant>(() => {
    const seed = `${testName}:${userId ?? 'guest'}`;
  }, [testName, userId]);
  }, [user?.id, testConfig.testName]);
  const trackClick = useCallback(
    (label: string, extra?: Record<string, any>) => {
    const userId = user?.id || 'guest';
    const sb = getSupabase();
      // @ts-ignore
    // Try Supabase first if available
    if (sb && user?.id) {
      try {
        // Check if user already has a variant assigned
        const { data: existingVariant } = await sb
          .from('ab_test_variants')
          .select('*')
          .eq('user_id', user.id)
          .eq('test_name', testConfig.testName)
          .single();

        if (existingVariant) {
          setVariant(existingVariant.variant);
          setIsLoading(false);
          return;
        }

        // Assign new variant based on weights
        const assignedVariant = selectVariantByWeight(testConfig.variants);

        // Store in database
        const { error } = await sb
          .from('ab_test_variants')
          .insert({
            user_id: user.id,
            test_name: testConfig.testName,
            variant: assignedVariant
          });

        if (!error) {
          setVariant(assignedVariant);
          setIsLoading(false);
          return;
        }
      } catch (error) {
        console.warn('[ABTesting] Supabase failed, using deterministic fallback:', error);
      }
    }

    // Fallback: deterministic hash-based assignment
    const deterministicVariant = getDeterministicVariant(userId, testConfig.testName, testConfig.variants);
    setVariant(deterministicVariant);
    setIsLoading(false);
    
    console.log(`[ABTesting] Using deterministic variant for ${testConfig.testName}: ${deterministicVariant}`);
  };

  const trackConversion = async (conversionData: Record<string, any> = {}) => {
    const sb = getSupabase();
    
    // Track in Supabase if available
    if (sb && user?.id) {
      try {
        await sb
          .from('ab_test_variants')
          .update({
            converted: true,
            conversion_data: conversionData
          })
          .eq('user_id', user.id)
          .eq('test_name', testConfig.testName);
      } catch (error) {
        console.warn('[ABTesting] Conversion tracking failed:', error);
      }
    }

    // Always track in analytics
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'ab_test_conversion', {
        event_category: 'ab_testing',
        event_label: `${testConfig.testName}_${variant}`,
        variant: variant,
        test_name: testConfig.testName,
        user_id: user?.id || 'guest',
        ...conversionData
      });
    }
  };

  return {
    variant,
    isLoading,
    trackConversion
  };
}

/**
 * Simple A/B variant hook for quick testing
 * @param testName - Name of the test
 * @param variants - Array of variant names (default: ['control', 'variant_a'])
 * @returns Current variant for the user
 */
export function useABVariant(
  testName: string, 
  variants: string[] = ['control', 'variant_a']
): string {
  const { user } = useUser();
  const [variant, setVariant] = useState<string>('control');

  useEffect(() => {
    const userId = user?.id || 'guest';
    const deterministicVariant = getDeterministicVariant(
      userId, 
      testName, 
      variants.map(name => ({ name, weight: 1 })) // Equal weights
    );
    setVariant(deterministicVariant);
  }, [user?.id, testName, variants.join(',')]);

  return variant;
}

/**
 * Get deterministic variant based on stable hash
 * @param userId - User ID or 'guest'
 * @param testName - Test name for salt
 * @param variants - Available variants with weights
 * @returns Assigned variant name
 */
function getDeterministicVariant(
  userId: string,
  testName: string,
  variants: Array<{ name: string; weight: number }>
): string {
  // Create stable hash from userId + testName
  const hashInput = `${userId}_${testName}`;
  const hash = simpleHash(hashInput);
  
  // Use weighted selection
  const totalWeight = variants.reduce((sum, v) => sum + v.weight, 0);
  const normalizedHash = (hash % 1000) / 1000; // Normalize to 0-1
  const targetWeight = normalizedHash * totalWeight;
  
  let currentWeight = 0;
  for (const variant of variants) {
    currentWeight += variant.weight;
    if (targetWeight <= currentWeight) {
      return variant.name;
    }
  }
  
  // Fallback to first variant
  return variants[0]?.name || 'control';
}

/**
 * Simple hash function for deterministic variant assignment
 * @param str - String to hash
 * @returns Positive integer hash
 */
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
      } else {
        // Save heatmap data
        const heatmapArray = Array.from(this.heatmapData.values());
        if (heatmapArray.length > 0) {
          await sb
        // eslint-disable-next-line no-console
        console.debug('[ab/cta_click]', payload);
        }
      }
    },
    [testName, userId, variant]
  );

  const markExposure = useCallback(() => {
    const payload = { test_name: testName, variant, user_id: userId ?? 'guest' };
    // @ts-ignore
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      // @ts-ignore
      window.gtag('event', 'ab_exposure', payload);
    } else {
      // eslint-disable-next-line no-console
import { getSupabase } from '../lib/supabase';
      console.debug('[ab/exposure]', payload);
  }, [testName, userId, variant]);