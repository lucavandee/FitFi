export async function fetchProductImage(retailer, productId) {
  try {
    switch (retailer) {
      case "zalando":
        // Zalando public API endpoint
        const zalandoResponse = await fetch(`https://www.zalando.nl/api/products/${productId}`);
        if (!zalandoResponse.ok) throw new Error('Zalando API error');
        return await zalandoResponse.json();
        
      case "hmnl":
        // H&M NL public API
        const hmResponse = await fetch(`https://www2.hm.com/nl_nl/productpage.${productId}.json`);
        if (!hmResponse.ok) throw new Error('H&M API error');
        return await hmResponse.json();
        
      case "wehkamp":
        // Wehkamp public API
        const wehkampResponse = await fetch(`https://api.wehkamp.nl/api/v2/catalog/products/${productId}`);
        if (!wehkampResponse.ok) throw new Error('Wehkamp API error');
        return await wehkampResponse.json();
        
      case "asos":
        // ASOS NL public API
        const asosResponse = await fetch(`https://www.asos.com/api/product/catalogue/v3/stockprice?productIds=${productId}`);
        if (!asosResponse.ok) throw new Error('ASOS API error');
        return await asosResponse.json();
        
      case "aboutyou":
        // About You NL public API
        const aboutYouResponse = await fetch(`https://api.aboutyou.de/v1/products/${productId}`);
        if (!aboutYouResponse.ok) throw new Error('About You API error');
        return await aboutYouResponse.json();
        
      default:
        throw new Error(`Unknown retailer: ${retailer}`);
    }
  } catch (error) {
    console.error(`Failed to fetch product image for ${retailer}:`, error);
    throw error;
  }
}

// Helper function to extract image URL from API response
export function extractImageUrl(retailer, apiResponse) {
  try {
    switch (retailer) {
      case "zalando":
        return apiResponse.media?.images?.[0]?.url || null;
        
      case "hmnl":
        return apiResponse.product?.mainImage?.url || apiResponse.images?.[0]?.url || null;
        
      case "wehkamp":
        return apiResponse.images?.[0]?.url || apiResponse.media?.images?.[0]?.url || null;
        
      case "asos":
        return apiResponse.products?.[0]?.imageUrl || apiResponse.media?.[0]?.url || null;
        
      case "aboutyou":
        return apiResponse.images?.[0]?.url || apiResponse.media?.images?.[0]?.url || null;
        
      default:
        return null;
    }
  } catch (error) {
    console.error(`Failed to extract image URL for ${retailer}:`, error);
    return null;
  }
}

// Cache management for API responses
const imageCache = new Map();
const CACHE_DURATION = 1000 * 60 * 30; // 30 minutes

export async function fetchProductImageCached(retailer, productId) {
  const cacheKey = `${retailer}_${productId}`;
  const cached = imageCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  
  try {
    const data = await fetchProductImage(retailer, productId);
    imageCache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });
    return data;
  } catch (error) {
    // Return cached data if available, even if expired
    if (cached) {
      return cached.data;
    }
    throw error;
  }
}