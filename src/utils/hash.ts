/**
 * Deterministic hash utilities for FitFi
 * No dependencies, always works, stable across sessions
 */

/**
 * Deterministic hash function (djb2 variant)
 * Produces consistent hash values for the same input
 * @param input - String to hash
 * @returns Positive integer hash value
 */
export function djb2Hash(input: string): number {
  let hash = 5381;
  for (let i = 0; i < input.length; i++) {
    hash = ((hash << 5) + hash) ^ input.charCodeAt(i);
  }
  // Make positive
  return hash >>> 0;
}

/**
 * Generate stable hash for A/B testing
 * Combines user identifier with test name for consistent assignment
 * @param userId - User ID or 'guest' for anonymous users
 * @param testName - Name of the A/B test
 * @returns Stable hash value for variant assignment
 */
export function getTestHash(userId: string, testName: string): number {
  const input = `${userId}_${testName}_fitfi_2025`;
  return djb2Hash(input);
}

/**
 * Map hash to variant index with weighted distribution
 * @param hash - Hash value from getTestHash
 * @param weights - Array of weights for each variant
 * @returns Index of selected variant
 */
export function hashToVariantIndex(hash: number, weights: number[]): number {
  if (weights.length === 0) return 0;
  
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  if (totalWeight <= 0) return 0;
  
  // Normalize hash to 0-1 range
  const normalizedHash = (hash % 10000) / 10000;
  const targetWeight = normalizedHash * totalWeight;
  
  let currentWeight = 0;
  for (let i = 0; i < weights.length; i++) {
    currentWeight += weights[i];
    if (targetWeight <= currentWeight) {
      return i;
    }
  }
  
  // Fallback to first variant
  return 0;
}

/**
 * Simple equal-weight variant selection
 * @param hash - Hash value
 * @param variantCount - Number of variants
 * @returns Variant index (0-based)
 */
export function hashToEqualVariant(hash: number, variantCount: number): number {
  if (variantCount <= 0) return 0;
  return hash % variantCount;
}

/**
 * Generate session-stable hash for temporary assignments
 * Uses sessionStorage to maintain consistency within session
 * @param key - Unique key for the hash
 * @returns Stable hash for current session
 */
export function getSessionHash(key: string): number {
  const storageKey = `fitfi_session_hash_${key}`;
  
  try {
    const stored = sessionStorage.getItem(storageKey);
    if (stored) {
      const parsed = parseInt(stored, 10);
      if (!isNaN(parsed)) {
        return parsed;
      }
    }
  } catch (error) {
    // Ignore storage errors
  }
  
  // Generate new hash
  const sessionId = Date.now().toString() + Math.random().toString(36);
  const hash = djb2Hash(`${key}_${sessionId}`);
  
  try {
    sessionStorage.setItem(storageKey, hash.toString());
  } catch (error) {
    // Ignore storage errors
  }
  
  return hash;
}

/**
 * Validate hash input to prevent injection
 * @param input - Input string to validate
 * @returns Sanitized input string
 */
export function sanitizeHashInput(input: string): string {
  if (typeof input !== 'string') {
    return 'invalid_input';
  }
  
  // Remove potentially problematic characters
  return input
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .substring(0, 100) // Limit length
    .toLowerCase();
}

/**
 * Test hash function consistency
 * @returns Test results for debugging
 */
export function testHashConsistency(): {
  isConsistent: boolean;
  testResults: Array<{ input: string; hash1: number; hash2: number; matches: boolean }>;
} {
  const testInputs = [
    'user123_test_a',
    'guest_homepage_cta',
    'user456_pricing_test',
    'anonymous_feature_flag'
  ];
  
  const testResults = testInputs.map(input => {
    const hash1 = djb2Hash(input);
    const hash2 = djb2Hash(input);
    return {
      input,
      hash1,
      hash2,
      matches: hash1 === hash2
    };
  });
  
  const isConsistent = testResults.every(result => result.matches);
  
  return {
    isConsistent,
    testResults
  };
}