import { classifyProduct } from "@/engine/productClassifier";
import type { Product } from "@/engine/types";

/**
 * Versie van de classificatie in product_attributes.classifier_version.
 * Verhoog deze string als productClassifier.ts verandert, en draai
 * scripts/keten/classificeer-attributes.ts opnieuw.
 */
export const CLASSIFIER_VERSIE = "productClassifier-2026-09";

export type AttribuutCategorie = "top" | "bottom" | "footwear" | "outerwear" | "dress" | "accessory";

const ZES: readonly AttribuutCategorie[] = ["top", "bottom", "footwear", "outerwear", "dress", "accessory"];

export interface ClassificatieRij {
  product_id: string;
  category: AttribuutCategorie | null;
  is_fashion: boolean;
}

export interface ProductBron {
  id: string;
  name: string | null;
  description?: string | null;
  category?: string | null;
  type?: string | null;
  is_kids?: boolean | null;
}

/**
 * Van een products-rij naar wat product_attributes over category en
 * is_fashion moet zeggen. Dezelfde classifier als de engine op de client,
 * zodat de database en de client nooit van mening verschillen.
 */
export function classificeerRij(rij: ProductBron): ClassificatieRij {
  if (rij.is_kids === true) {
    return { product_id: rij.id, category: null, is_fashion: false };
  }
  const product: Product = {
    id: rij.id,
    name: rij.name ?? "",
    description: rij.description ?? undefined,
    category: rij.category ?? undefined,
    type: rij.type ?? undefined,
  } as Product;
  const uitkomst = classifyProduct(product);
  if (uitkomst.rejected) {
    return { product_id: rij.id, category: null, is_fashion: false };
  }
  const cat = String(uitkomst.category) as AttribuutCategorie;
  if (!ZES.includes(cat)) {
    return { product_id: rij.id, category: null, is_fashion: false };
  }
  return { product_id: rij.id, category: cat, is_fashion: true };
}
