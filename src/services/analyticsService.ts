/**
 * Analytics service for tracking user interactions with outfit explanations
 * This service provides a centralized way to track events related to explanations
 */

// Event categories
export enum EventCategory {
  ENGAGEMENT = 'engagement',
  CONVERSION = 'conversion',
  EXPLANATION = 'explanation'
}

// Event types
export enum EventType {
  // Explanation events
  EXPLANATION_GENERATED = 'explanation_generated',
  EXPLANATION_VIEWED = 'explanation_viewed',
  EXPLANATION_CLICKED = 'explanation_clicked',
  EXPLANATION_EXPANDED = 'explanation_expanded',
  EXPLANATION_SHARED = 'explanation_shared',
  
  // Outfit events
  OUTFIT_CLICK = 'outfit_click',
  OUTFIT_LIKE = 'outfit_like',
  OUTFIT_DISLIKE = 'outfit_dislike',
  OUTFIT_SAVE = 'outfit_save',
  OUTFIT_SHARE = 'outfit_share',
  
  // Product events
  PRODUCT_CLICK = 'product_click',
  PRODUCT_VIEW = 'product_view',
  PRODUCT_SAVE = 'product_save'
}

/**
 * Tracks an explanation event in the analytics system
 * @param eventType - Type of event
 * @param outfitId - Outfit ID
 * @param outfitTitle - Outfit title
 * @param outfitArchetype - Outfit archetype
 * @param explanation - The explanation text
 */
export const trackExplanationEvent = (
  eventType: EventType,
  outfitId: string,
  outfitTitle: string,
  outfitArchetype: string,
  explanation: string
): void => {
  // Use Google Analytics if available
  if (typeof window.gtag === 'function') {
    window.gtag('event', eventType, {
      event_category: EventCategory.EXPLANATION,
      event_label: outfitId,
      outfit_id: outfitId,
      outfit_title: outfitTitle,
      outfit_archetype: outfitArchetype,
      explanation_length: explanation.length,
      explanation_preview: explanation.substring(0, 50) + '...'
    });
  }
  
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`📊 Analytics: ${eventType} (${EventCategory.EXPLANATION})`, {
      outfitId,
      outfitTitle,
      outfitArchetype,
      explanation: explanation.substring(0, 50) + '...'
    });
  }
};

/**
 * Tracks an outfit interaction event
 * @param eventType - Type of event
 * @param outfit - The outfit object
 */
export const trackOutfitEvent = (
  eventType: EventType,
  outfit: {
    id: string;
    title: string;
    archetype?: string;
    matchPercentage?: number;
  }
): void => {
  // Use Google Analytics if available
  if (typeof window.gtag === 'function') {
    window.gtag('event', eventType, {
      event_category: EventCategory.ENGAGEMENT,
      event_label: outfit.id,
      outfit_id: outfit.id,
      outfit_title: outfit.title,
      outfit_archetype: outfit.archetype || 'unknown',
      match_percentage: outfit.matchPercentage || 0
    });
  }
  
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`📊 Analytics: ${eventType} (${EventCategory.ENGAGEMENT})`, {
      outfitId: outfit.id,
      outfitTitle: outfit.title,
      outfitArchetype: outfit.archetype || 'unknown',
      matchPercentage: outfit.matchPercentage || 0
    });
  }
};

/**
 * Tracks a product interaction event
 * @param eventType - Type of event
 * @param product - The product object
 */
export const trackProductEvent = (
  eventType: EventType,
  product: {
    id: string;
    name: string;
    brand?: string;
    price?: number;
    category?: string;
  }
): void => {
  // Use Google Analytics if available
  if (typeof window.gtag === 'function') {
    window.gtag('event', eventType, {
      event_category: EventCategory.ENGAGEMENT,
      event_label: product.id,
      item_id: product.id,
      item_name: product.name,
      item_brand: product.brand || 'unknown',
      item_category: product.category || 'unknown',
      price: product.price || 0,
      currency: 'EUR'
    });
  }
  
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`📊 Analytics: ${eventType} (${EventCategory.ENGAGEMENT})`, {
      productId: product.id,
      productName: product.name,
      productBrand: product.brand || 'unknown',
      productCategory: product.category || 'unknown',
      price: product.price || 0
    });
  }
};

export default {
  trackExplanationEvent,
  trackOutfitEvent,
  trackProductEvent,
  EventCategory,
  EventType
};