/**
 * Analytics service for tracking user interactions and errors
 * This service provides a centralized way to track events, errors, and performance metrics
 */

// Event categories
export enum EventCategory {
  ENGAGEMENT = 'engagement',
  CONVERSION = 'conversion',
  ERROR = 'error',
  PERFORMANCE = 'performance',
  ECOMMERCE = 'ecommerce',
  GAMIFICATION = 'gamification'
}

// Event types
export enum EventType {
  // Engagement events
  PAGE_VIEW = 'page_view',
  QUIZ_START = 'quiz_start',
  QUIZ_COMPLETE = 'quiz_complete',
  QUIZ_STEP = 'quiz_step',
  RECOMMENDATION_VIEW = 'recommendation_view',
  OUTFIT_LIKE = 'outfit_like',
  OUTFIT_DISLIKE = 'outfit_dislike',
  OUTFIT_SAVE = 'outfit_save',
  OUTFIT_SHARE = 'outfit_share',
  
  // Conversion events
  PRODUCT_CLICK = 'product_click',
  SHOP_OUTFIT = 'shop_outfit',
  SIGNUP = 'signup',
  LOGIN = 'login',
  PREMIUM_UPGRADE = 'premium_upgrade',
  
  // Error events
  API_ERROR = 'api_error',
  IMAGE_ERROR = 'image_error',
  JS_ERROR = 'js_error',
  
  // Performance events
  PAGE_LOAD = 'page_load',
  API_LATENCY = 'api_latency',
  
  // Gamification events
  POINTS_EARNED = 'points_earned',
  BADGE_EARNED = 'badge_earned',
  LEVEL_UP = 'level_up',
  CHALLENGE_COMPLETE = 'challenge_complete'
}

/**
 * Tracks an event in the analytics system
 * @param eventType - Type of event
 * @param category - Event category
 * @param label - Event label
 * @param value - Event value
 * @param additionalParams - Additional parameters
 */
export const trackEvent = (
  eventType: EventType,
  category: EventCategory,
  label?: string,
  value?: number,
  additionalParams?: Record<string, any>
): void => {
  // Use Google Analytics if available
  if (typeof window.gtag === 'function') {
    window.gtag('event', eventType, {
      event_category: category,
      event_label: label,
      value,
      ...additionalParams
    });
  }
  
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`📊 Analytics: ${eventType} (${category})`, {
      label,
      value,
      ...additionalParams
    });
  }
};

/**
 * Tracks a page view
 * @param pagePath - Page path
 * @param pageTitle - Page title
 */
export const trackPageView = (pagePath: string, pageTitle?: string): void => {
  if (typeof window.gtag === 'function') {
    window.gtag('config', 'G-XXXXXXXXXX', {
      page_path: pagePath,
      page_title: pageTitle || document.title
    });
  }
  
  trackEvent(EventType.PAGE_VIEW, EventCategory.ENGAGEMENT, pagePath);
};

/**
 * Tracks an error
 * @param errorType - Type of error
 * @param errorMessage - Error message
 * @param errorDetails - Additional error details
 */
export const trackError = (
  errorType: 'api' | 'image' | 'js' | 'other',
  errorMessage: string,
  errorDetails?: Record<string, any>
): void => {
  const eventType = errorType === 'api' 
    ? EventType.API_ERROR 
    : errorType === 'image' 
      ? EventType.IMAGE_ERROR 
      : EventType.JS_ERROR;
  
  trackEvent(
    eventType,
    EventCategory.ERROR,
    errorMessage,
    undefined,
    {
      error_type: errorType,
      error_message: errorMessage,
      ...errorDetails
    }
  );
};

/**
 * Tracks a broken image
 * @param imageUrl - URL of the broken image
 * @param componentName - Name of the component where the image is used
 */
export const trackBrokenImage = (imageUrl: string, componentName: string): void => {
  trackError('image', 'Image failed to load', {
    image_url: imageUrl,
    component: componentName
  });
  
  // Store broken image URL in localStorage for future reference
  const brokenImagesKey = 'fitfi-broken-images';
  const brokenImages = JSON.parse(localStorage.getItem(brokenImagesKey) || '[]');
  
  if (!brokenImages.includes(imageUrl)) {
    brokenImages.push(imageUrl);
    localStorage.setItem(brokenImagesKey, JSON.stringify(brokenImages));
  }
};

/**
 * Tracks a product click
 * @param product - Product that was clicked
 * @param source - Source of the click
 */
export const trackProductClick = (
  product: {
    id: string;
    name: string;
    brand: string;
    price: number;
    category: string;
    retailer: string;
  },
  source: string = 'recommendations'
): void => {
  trackEvent(
    EventType.PRODUCT_CLICK,
    EventCategory.ECOMMERCE,
    `${product.retailer}_${product.id}`,
    product.price,
    {
      item_id: product.id,
      item_name: product.name,
      item_brand: product.brand,
      item_category: product.category,
      price: product.price,
      currency: 'EUR',
      source
    }
  );
};

/**
 * Tracks an outfit shop action
 * @param outfit - Outfit that was shopped
 */
export const trackOutfitShop = (
  outfit: {
    id: string;
    title: string;
    totalPrice: number;
    items: Array<{
      id: string;
      name: string;
      brand: string;
      price: number;
      category: string;
    }>;
  }
): void => {
  trackEvent(
    EventType.SHOP_OUTFIT,
    EventCategory.CONVERSION,
    outfit.id,
    outfit.totalPrice,
    {
      outfit_id: outfit.id,
      outfit_title: outfit.title,
      value: outfit.totalPrice,
      currency: 'EUR',
      items: outfit.items.map(item => ({
        item_id: item.id,
        item_name: item.name,
        item_brand: item.brand,
        item_category: item.category,
        price: item.price
      }))
    }
  );
};

export default {
  trackEvent,
  trackPageView,
  trackError,
  trackBrokenImage,
  trackProductClick,
  trackOutfitShop,
  EventCategory,
  EventType
};