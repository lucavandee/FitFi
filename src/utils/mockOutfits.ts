import dutchProducts from '@/data/dutchProducts';
import { getSafeImageUrl } from '@/utils/image';

type Product = {
  id: string; name: string; imageUrl: string; brand?: string;
  price?: number; season?: string[]; type?: string; category?: string;
};

export type SimpleOutfit = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  products: Product[];
  archetype: string;
  tags: string[];
};

function pick<T>(arr: T[], n: number): T[] {
  if (n <= 0) return [];
  const copy = arr.slice();
  const out: T[] = [];
  while (out.length < n && copy.length) {
    const i = Math.floor(Math.random() * copy.length);
    out.push(copy.splice(i,1)[0]);
  }
  return out;
}

function toOutfit(products: Product[], index: number): SimpleOutfit {
  const firstProductImage = getSafeImageUrl(products[0]?.imageUrl);
  const image = firstProductImage || '/images/outfit-fallback.jpg';
  
  return {
    id: `mock-outfit-${index}-${products[0]?.id ?? Math.random().toString(36).slice(2)}`,
    title: `Stijlvolle look #${index+1}`,
    description: `Geselecteerd op basis van jouw stijlvoorkeuren en het seizoen.`,
    imageUrl: image,
    products,
    archetype: ['casual_chic','urban','klassiek','streetstyle'][index % 4],
    tags: ['mix & match','seizoensproof']
  };
}

export function generateMockOutfits(count: number = 20): SimpleOutfit[] {
  const base: Product[] = (dutchProducts as unknown as Product[]).slice(0, 120);
  const outfits: SimpleOutfit[] = [];
  for (let i = 0; i < count; i++) {
    const items = pick(base, 3 + (i % 3)); // 3–5 items
    outfits.push(toOutfit(items, i));
  }
  return outfits;
}