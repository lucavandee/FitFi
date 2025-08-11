export function getSafeImageUrl(url?: string): string | undefined {
  if (!url) return undefined;
  const u = url.trim();
  if (!u) return undefined;
  // blokkeer mixed content en data die likely fout is
  if (u.startsWith('http:')) return undefined;
  return u;
}

/**
 * Check if URL is a valid HTTPS image URL
 */
export function isValidImageUrl(url?: string): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (!trimmed) return false;
  
  // Must be HTTPS
  if (!trimmed.startsWith('https://')) return false;
  
  // Must end with image extension
  return /\.(png|jpe?g|webp|gif|svg)(\?.*)?$/i.test(trimmed);
}

/**
 * Get fallback image for specific categories
 */
export function getFallbackImageForCategory(category?: string): string {
  const fallbacks: Record<string, string> = {
    'top': '/images/fallbacks/top.jpg',
    'bottom': '/images/fallbacks/bottom.jpg',
    'footwear': '/images/fallbacks/footwear.jpg',
    'accessory': '/images/fallbacks/accessory.jpg',
    'outerwear': '/images/fallbacks/outerwear.jpg',
    'default': '/images/fallbacks/default.jpg'
  };
  
  return fallbacks[category || 'default'] || fallbacks.default;
}

/**
 * Sanitize and validate image URL with category-specific fallback
 */
export function sanitizeImageUrl(url?: string, category?: string): string {
  const safeUrl = getSafeImageUrl(url);
  
  if (!safeUrl || !isValidImageUrl(safeUrl)) {
    return getFallbackImageForCategory(category);
  }
  
  return safeUrl;
}