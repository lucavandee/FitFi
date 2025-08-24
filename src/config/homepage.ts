/**
 * Homepage configuration flags for streamlined content management
 * Toggle sections on/off without deleting code
 */

export const HOMEPAGE_FLAGS = {
  // Core sections (always shown)
  showHero: true,
  showNovaStyleSwipe: true,

  // Optional sections (can be toggled)
  showHowItWorks: true,
  showSocialProof: true,
  showFeatures: true,
  showPreviewCarousel: true,
  showFoundersBlock: true,
  showUGCGallery: true,
  showClosingCTA: true,

  // Future sections (disabled by default)
  showBlogTeasers: false,
  showExtraFeatureGrid: false,
  showTestimonialCarousel: false,
  showPricingPreview: false,
  showPartnerLogos: false,

  // Development flags
  showDebugInfo: false,
  enableAnalytics: true,
} as const;

/**
 * Get flag value with environment override support
 * @param flag - Flag name from HOMEPAGE_FLAGS
 * @returns Boolean flag value
 */
export function getHomepageFlag(flag: keyof typeof HOMEPAGE_FLAGS): boolean {
  // Allow environment overrides for specific flags
  const envKey = `VITE_HOMEPAGE_${flag.toUpperCase()}`;
  const envValue = import.meta.env[envKey];

  if (envValue !== undefined) {
    return envValue.toString().toLowerCase() === "true";
  }

  return HOMEPAGE_FLAGS[flag];
}

/**
 * Check if any optional sections are enabled
 * @returns Boolean indicating if homepage has optional content
 */
export function hasOptionalSections(): boolean {
  return (
    getHomepageFlag("showBlogTeasers") ||
    getHomepageFlag("showExtraFeatureGrid") ||
    getHomepageFlag("showTestimonialCarousel") ||
    getHomepageFlag("showPricingPreview") ||
    getHomepageFlag("showPartnerLogos")
  );
}

export default HOMEPAGE_FLAGS;
