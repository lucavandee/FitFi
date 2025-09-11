// src/services/shop/types.ts
export type Availability = "in_stock" | "out_of_stock" | "unknown";

export type RailProduct = {
  id: string; // merchant:sku of uuid
  retailer: "zalando" | "bijenkorf" | "other";
  retailer_sku?: string;
  title: string;
  image: string; // absolute URL
  url: string;   // outbound deeplink (gaat via shop-redirect function)
  price: { current: number; original?: number };
  currency: "EUR";
  availability?: Availability;
  sizes?: string[];
  color?: string;
  reason?: string; // why this matches the outfit
  badges?: string[]; // e.g. ["Aanrader","Nieuw"]
};