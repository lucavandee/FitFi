export type OutfitItem = {
  role: 'top'|'bottom'|'outerwear'|'shoes'|'accessory';
  name: string;
  color?: string;
  note?: string;
};

export type Outfit = {
  id: string;
  title: string;
  occasion?: string;
  why?: string;
  matchScore: number;       // 0..100
  palette?: string[];       // HEX kleuren
  budget?: 'low'|'mid'|'high';
  items: OutfitItem[];
  shopQuery?: string;       // vrije tekst om door te sturen naar shop/feed
};

export type NovaOutfitsPayload = {
  type: 'outfits';
  version: 1;
  outfits: Outfit[];
};

export function safeParseOutfits(json: string): NovaOutfitsPayload | null {
  try {
    const o = JSON.parse(json);
    if (!o || o.type !== 'outfits' || !Array.isArray(o.outfits)) return null;
    return o as NovaOutfitsPayload;
  } catch { return null; }
}