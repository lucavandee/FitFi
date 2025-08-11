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