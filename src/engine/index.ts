export type Season = "spring" | "summer" | "autumn" | "winter" | "all_season";

export type Product = {
  id: string;
  title: string;
  name?: string;
  brand?: string;
  price?: number;
  original_price?: number;
  imageUrl?: string;
  url?: string;
  retailer?: string;
  category?: string;
  description?: string;
  tags?: string[];
};

export type Outfit = {
  id: string;
  title?: string;
  products?: Product[];
  image?: string;
  tags?: string[];
  season?: Season;
};