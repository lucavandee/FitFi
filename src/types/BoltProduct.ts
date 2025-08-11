/**
 * BoltProduct type definition
 * Represents a product in the Bolt format with enriched data for AI-matching
 */
export type BoltProduct = {
  id: string; // unique, slug-form
  title: string;
  brand: string;
  type: 'blazer' | 'sneaker' | 'trui' | 'broek' | 'jurk' | 'jas' | 'shirt' | 'blouse' | 'rok' | 'accessoire' | 'schoenen' | 'tas' | 'vest' | 'top' | 'jeans' | 'sweater' | 'hoodie' | 'overhemd' | 'kostuum' | 'zwemkleding' | 'ondergoed' | 'pyjama' | 'sokken' | 'legging' | 'jumpsuit' | 'cardigan' | 'colbert' | 'bermuda' | 'short' | 'joggingbroek' | 'other';
  gender: 'male' | 'female';
  color: string;
  dominantColorHex: string;
  styleTags: string[]; // max 3 from: "smart", "clean", "italian", "street", "sporty", "minimal", etc.
  season: 'spring' | 'summer' | 'fall' | 'winter' | 'all_season';
  archetypeMatch: {
    [archetypeId: string]: number; // max 2 with scores between 0.1 - 1.0
  };
  material: string; // if unknown, estimate based on brand/type
  price: number;
  imageUrl: string;
  affiliateUrl: string;
  source: 'zalando';
};
