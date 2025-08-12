import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useUser } from '../context/UserContext';
import { ABTestVariant } from '../types/achievements';

// Get singleton client
const sb = supabase();

interface ABTestConfig {
  testName: string;
  variants: Array<{
    name: string;
    weight: number;
  }>;
}

export function useABTesting(testConfig: ABTestConfig) {
  const { user } = useUser();
  const [variant, setVariant] = useState<string>('control');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    assignVariant();
  }, [user?.id, testConfig.testName]);

  const assignVariant = async () => {
    if (!user?.id) return;

    if (!sb) {
      console.warn('[ABTesting] Supabase not available, using control variant');
      setVariant('control');
      setIsLoading(false);
      return;
    }

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
      }
    } catch (error) {
      console.error('A/B testing error:', error);
      setVariant('control'); // Fallback to control
    } finally {
      setIsLoading(false);
    }
  };

  const trackConversion = async (conversionData: Record<string, any> = {}) => {
    if (!user?.id) return;

    try {
      await supabase
        .from('ab_test_variants')
        .update({
          converted: true,
          conversion_data: conversionData
        })
        .eq('user_id', user.id)
        .eq('test_name', testConfig.testName);

      // Track in analytics
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'ab_test_conversion', {
          event_category: 'ab_testing',
          event_label: `${testConfig.testName}_${variant}`,
          custom_parameter_1: variant
        });
      }
    } catch (error) {
      console.error('A/B test conversion tracking error:', error);
    }
  };

  return {
    variant,
    isLoading,
    trackConversion
  };
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