import type { Product } from "../engine/types";
import { isValidImageUrl } from "../utils/imageUtils";

async function fetchZalandoProducts(): Promise<Product[]> {
  try {
    const url = `${import.meta.env.BASE_URL}data/zalandoProducts.json`;
    console.log(`[ZalandoAdapter] Fetching from: ${url}`);

    const response = await fetch(url);
    if (!response.ok) throw new Error("Zalando productdata niet geladen");

    let json = [];
    try {
      json = await response.json();
    } catch (err) {
      console.warn(
        "[ZalandoAdapter] Could not parse zalandoProducts.json:",
        err,
      );
      return [];
    }

    return convertZalandoProducts(json);
  } catch (error) {
    console.error("[ZalandoAdapter] Fout bij laden producten:", error);
    return [];
  }
}

/**
 * Converts Zalando product format to FitFi Product format
 * and filters out products with invalid image URLs
 * @param zalandoProducts - Products in Zalando format
 * @returns Products in FitFi format with valid images
 */
function convertZalandoProducts(zalandoProducts: any[]): Product[] {
  if (
    !zalandoProducts ||
    !Array.isArray(zalandoProducts) ||
    zalandoProducts.length === 0
  ) {
    return [];
  }

  console.log(`[ZalandoAdapter] Processing ${zalandoProducts.length} products`);

  // First, convert all products
  const convertedProducts = zalandoProducts.map((product) => {
    // Convert price from string to number
    let price: number | undefined;
    if (product.price) {
      // Handle different price formats (19.99, 19,99, €19.99, etc.)
      const priceString = product.price
        .toString()
        .replace("€", "")
        .replace(",", ".")
        .trim();
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
      styleTags: product.tags || ["casual"],
      description:
        product.description ||
        `${product.name} van ${product.brand || "Zalando"}`,
      price: Number(product.price ?? 0),
      brand: product.brand,
      affiliateUrl: product.affiliateUrl,
      season: product.seasons || ["spring", "summer", "autumn", "winter"],
    };
  });

  // Then, filter out products with invalid image URLs
  const validProducts = convertedProducts.filter((product) => {
    const isValid = product.imageUrl && isValidImageUrl(product.imageUrl);

    if (!isValid) {
      console.warn(
        `⚠️ Broken image gefilterd: ${product.imageUrl} (${product.name})`,
      );
    }

    return isValid;
  });

  console.log(
    `[ZalandoAdapter] Filtered out ${convertedProducts.length - validProducts.length} products with invalid images`,
  );
  console.log(
    `[ZalandoAdapter] Returning ${validProducts.length} valid products`,
  );

  return validProducts;
}

/**
 * Gets Zalando products converted to FitFi format
 * @returns Promise that resolves to an array of FitFi Products with valid images
 */
export async function getZalandoProducts(): Promise<Product[]> {
  try {
    const products = await fetchZalandoProducts();

    if (products.length === 0) {
      console.warn("No Zalando products found");
      return [];
    }

    console.log(
      "[FitFi] Zalando fallback actief – producten geladen:",
      products.length,
    );
    return products;
  } catch (error) {
    console.error("Error getting Zalando products:", error);
    return [];
  }
}
