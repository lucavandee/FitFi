import { useState, useEffect } from 'react';
import { getSupabase } from '../lib/supabase';
import { useUser } from '../context/UserContext';
import { ABTestVariant } from '../types/achievements';

interface ABTestConfig {
  testName: string;
  variants: Array<{
    name: string;
    weight: number;
  }>;
}

/**
 * Deterministic A/B testing hook that works with or without Supabase
 * Uses stable hash-based variant assignment as fallback
 */
export function useABTesting(testConfig: ABTestConfig) {
  const { user } = useUser();
  const [variant, setVariant] = useState<string>('control');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    assignVariant();
  }, [user?.id, testConfig.testName]);

  const assignVariant = async () => {
    const userId = user?.id || 'guest';
    const sb = getSupabase();

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
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

function selectVariantByWeight(variants: Array<{ name: string; weight: number }>): string {
  const totalWeight = variants.reduce((sum, v) => sum + v.weight, 0);
  const random = Math.random() * totalWeight;
  
  let currentWeight = 0;
  for (const variant of variants) {
    currentWeight += variant.weight;
    if (random <= currentWeight) {
      return variant.name;
    }
  }
  
  return variants[0]?.name || 'control';
}