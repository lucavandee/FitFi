export function getSafeImageUrl(url?: string): string | undefined {
  if (!url || typeof url !== 'string') return undefined;
  
  const trimmed = url.trim();
  if (!trimmed) return undefined;
  
  // Must be valid HTTP/HTTPS URL or relative path
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('/')) {
    return trimmed;
  }
  
  return undefined;
}

export function isValidImageUrl(url?: string): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (!trimmed) return false;
  
  // Must be HTTPS or relative path
  if (!trimmed.startsWith('https://') && !trimmed.startsWith('/')) return false;
  
  // Must end with image extension
  return /\.(png|jpe?g|webp|gif|svg)(\?.*)?$/i.test(trimmed);
}

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

export function sanitizeImageUrl(url?: string, category?: string): string {
  const safeUrl = getSafeImageUrl(url);
  
  if (!safeUrl || !isValidImageUrl(safeUrl)) {
    return getFallbackImageForCategory(category);
  }
  
  return safeUrl;
}