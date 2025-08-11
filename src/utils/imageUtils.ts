/**
 * Eenvoudige validators en fallbacks voor images.
 */

export function isValidImageUrl(url?: string | null): boolean {
  if (!url || typeof url !== "string") return false;
  const trimmed = url.trim();
  if (!/^https?:\/\//i.test(trimmed)) return false;
  // Sta gangbare formaten + querystrings toe
  return /\.(png|jpe?g|webp|gif|svg)(\?.*)?$/i.test(trimmed);
}

export function getFallbackImage(width = 600, height = 800): string {
  return `https://via.placeholder.com/${width}x${height}`;
}

export function getFallbackImageForCategory(category?: string) {
  const map: Record<string,string> = {
    top: '/images/fallbacks/top.jpg',
    bottom: '/images/fallbacks/bottom.jpg',
    footwear: '/images/fallbacks/footwear.jpg',
    accessory: '/images/fallbacks/accessory.jpg',
    default: '/images/fallbacks/default.jpg',
  };
  return map[category || 'default'] || map.default;
}

export function getSafeImageUrl(url?: string, category?: string) {
  if (!url || typeof url !== 'string') return getFallbackImageForCategory(category);
  // Fix common bad urls (data shape differences)
  const clean = url.replace(/^http:\/\//, 'https://').trim();
  return clean || getFallbackImageForCategory(category);
}