// src/types/product.ts
export type Currency = 'EUR' | 'USD' | string;
export type Availability = 'in_stock' | 'out_of_stock' | 'unknown';

export type ProductPrice = {
  current: number;
  original?: number;
};

export type Gender = 'male' | 'female' | 'unisex';

export type Product = {
  id: string;
  retailer: string;
  retailer_sku?: string;
  title: string;
  image: string;
  url: string;
  price: ProductPrice;
  currency: Currency;
  availability: Availability;
  gender: Gender;
  category?: string;
  sizes?: string[];
  color?: string;
  badges?: string[];
  reason?: string;
};