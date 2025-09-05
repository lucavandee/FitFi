// Globale, lichte shims – expliciet, geen 'any' waar het niet hoeft.
declare module "*.svg" {
  const content: React.FC<React.SVGProps<SVGSVGElement>>;
  export default content;
}
declare module "*.png" { const src: string; export default src; }
declare module "*.jpg" { const src: string; export default src; }
declare module "*.jpeg" { const src: string; export default src; }
declare module "*.webp" { const src: string; export default src; }

// Basisdomein voor FitFi – licht gehouden om type-errors te voorkomen
interface Product {
  id: string;
  title: string;
  brand?: string;
  imageUrl?: string;
  price?: number;
  url?: string;
  tags?: string[];
  gender?: "male" | "female" | "unisex";
  color?: string;
  type?: string; // e.g., "blazer", "jeans"
}

interface Outfit {
  id: string;
  name: string;
  items: Product[];
  score?: number; // 0-100
  explanation?: string;
}

interface Tribe {
  id: string;
  name: string;
  description?: string;
}

declare const __APP_ENV__: string;