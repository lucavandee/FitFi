// src/types/product.ts
export type Currency = 'EUR' | 'USD' | string;
export type Availability = 'in_stock' | 'out_of_stock' | 'unknown';

export type ProductPrice = {
  current: number;
  original?: number;
};

export type Product = {
  id: string;                         // stable id per retailer
  retailer: string;                   // 'zalando' | 'bijenkorf' | ...
  retailer_sku?: string;
  title: string;
  image: string;                      // absolute URL
  url: string;                        // outbound deeplink (we redirect via function)
  price: ProductPrice;
  currency: Currency;
  availability: Availability;
  sizes?: string[];
  color?: string;
  badges?: string[];                  // bijv. ['Aanrader', 'Nieuw']
  reason?: string;                    // menselijke "waarom past dit"
};