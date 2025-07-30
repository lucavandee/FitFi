// Homepage section visibility flags
export const HOME_SECTIONS = {
  HERO: true,
  SOCIAL_PROOF: true,
  HOW_IT_WORKS: true,
  FEATURES: true,
  PREVIEW_CAROUSEL: true,
  STYLE_ARCHETYPES: true,
  FOUNDERS_CLUB: true,
  UGC_GALLERY: true,
  CLOSING_CTA: true,
  FAQ: false, // Moved to /pricing#faq
  PRICING_CTA: false // Hidden on mobile home
} as const;

// Mobile-specific flags
export const MOBILE_FLAGS = {
  HIDE_FAQ_ON_HOME: true,
  HIDE_PRICING_CTA_ON_HOME: true,
  SHOW_KPI_BADGES_IN_HERO: true,
  ENABLE_HORIZONTAL_FLOW: true,
  SHOW_BACK_TO_TOP_FAB: true
} as const;

export default HOME_SECTIONS;