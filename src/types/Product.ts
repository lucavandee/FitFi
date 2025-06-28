export interface Product {
  id: string;
  name: string;
  image_url: string;
  description: string;
  affiliate_url: string;
  gender: 'male' | 'female';
  type: string;
  url?: string;
  brand?: string;
  price?: string;
  sizes: string[];
  tags: string[];
  created_at: string;
}