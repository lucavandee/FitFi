export interface OutfitItem {
  id: string;
  title: string;
  image: string;
  price: number;
  brand: string;
  url: string;            // affiliate link (optioneel)
  tags: string[];
}

export interface OutfitResponse {
  items: OutfitItem[];
}