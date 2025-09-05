export interface ProductQuery {
  gender?: "male" | "female" | "unisex";
  types?: string[];   // ["jeans","shirt"]
  colors?: string[];  // ["white","navy"]
  maxPrice?: number;
}

export default function filterAndSortProducts(list: Product[], query: ProductQuery = {}): Product[] {
  const filtered = list.filter(p => {
    if (query.gender && p.gender && p.gender !== query.gender && p.gender !== "unisex") return false;
    if (query.types?.length && p.type && !query.types.includes(p.type)) return false;
    if (query.colors?.length && p.color && !query.colors.includes(p.color)) return false;
    if (typeof query.maxPrice === "number" && typeof p.price === "number" && p.price > query.maxPrice) return false;
    return true;
  });
  return filtered.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
}