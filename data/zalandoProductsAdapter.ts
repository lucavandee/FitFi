import type { Product } from "../engine/types";

export async function fetchZalandoProducts(): Promise<Product[]> {
  try {
    const response = await fetch("/data/zalandoProducts.json");
    if (!response.ok) throw new Error("Zalando productdata niet geladen");
    const json = await response.json();
    return convertZalandoProducts(json);
  } catch (error) {
    console.error("[ZalandoAdapter] Fout bij laden producten:", error);
    return [];
  }
}

/**
 * Converts Zalando product format to FitFi Product format
 * @param zalandoProducts - Products in Zalando format
 * @returns Products in FitFi format
 */
function convertZalandoProducts(zalandoProducts: any[]): Product[] {
  if (!zalandoProducts || !Array.isArray(zalandoProducts) || zalandoProducts.length === 0) {
    return [];
  }

  return zalandoProducts.map(product => {
    // Convert price from string to number
    let price: number | undefined;
    if (product.price) {
      // Handle different price formats (19.99, 19,99, €19.99, etc.)
      const priceString = product.price.toString().replace('€', '').replace(',', '.').trim();
      price = parseFloat(priceString);
      if (isNaN(price)) {
        price = undefined;
      }
    }

    return {
      id: product.id,
      name: product.name,
      imageUrl: product.imageUrl,
      type: product.category, // Use category as type
      category: product.category,
      styleTags: product.tags || ['casual'],
      description: product.description || `${product.name} van ${product.brand || 'Zalando'}`,
      price: price,
      brand: product.brand,
      affiliateUrl: product.affiliateUrl,
      season: product.seasons || ['spring', 'summer', 'autumn', 'winter']
    };
  });
}

/**
 * Gets Zalando products converted to FitFi format
 * @returns Promise that resolves to an array of FitFi Products
 */
export async function getZalandoProducts(): Promise<Product[]> {
  try {
    const products = await fetchZalandoProducts();
    
    if (products.length === 0) {
      console.warn('No Zalando products found');
      return [];
    }
    
    console.log('[FitFi] Zalando fallback actief – producten geladen:', products.length);
    return products;
  } catch (error) {
    console.error('Error getting Zalando products:', error);
    return [];
  }
}

export default {
  getZalandoProducts
};