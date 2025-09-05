// Globale type-augmentaties om ruis uit de build te halen. Houdt alles optioneel;
// we zetten later strakke types op de echte services/schemas.

type ID = string;

declare global {
  interface Product {
    id?: ID;
    name?: string;
    brand?: string;
    price?: number;
    imageUrl?: string;
    affiliateUrl?: string;
    category?: string;
    [k: string]: any;
  }

  interface Outfit {
    id?: ID;
    title?: string;
    name?: string; // some mocks gebruiken "name"
    occasion?: string;
    description?: string;
    image?: string;
    tags?: string[];
    archetype?: string;
    season?: "spring" | "summer" | "autumn" | "winter" | string;
    items?: Product[];
    products?: Product[];
    matchPercentage?: number;
    explanation?: string;
    [k: string]: any;
  }

  interface Tribe {
    id?: ID;
    slug?: string;
    title?: string;
    name?: string;
    description?: string;
    cover_img?: string;
    member_count?: number;
    is_member?: boolean;
    user_role?: "owner" | "moderator" | "member" | string | null;
    [k: string]: any;
  }

  interface TribeChallenge {
    id?: ID;
    tribeId?: ID;
    status?: string;
    createdAt?: string;
    title?: string;
    [k: string]: any;
  }

  interface TribePost {
    id: ID;
    tribeId: ID;
    userId: ID;
    content?: string;
    imageUrl?: string;
    likesCount?: number;
    commentsCount?: number;
    createdAt: string;
    [k: string]: any;
  }

  interface TribeMember {
    userId: ID;
    tribeId: ID;
    role: "member" | "moderator" | "owner" | null;
    [k: string]: any;
  }

  // Analytics helper
  function track(event: string, data?: Record<string, any>): void;
  function w(event: string, data?: Record<string, any>): void;
}

// Shims voor third-party of interne modules die types misten
declare module "sonner" {
  export const toast: {
    success: (m: string) => void;
    error: (m: string) => void;
    info: (m: string) => void;
    message: (m: string) => void;
  };
  export default toast;
}

declare module "@/lib/nova" {
  export type NovaMessage = any;
  export type NovaMode = "default" | "explain" | "debug" | string;
  export function streamNova(...args: any[]): AsyncGenerator<any>;
}

// Laat TS weten dat zowel default als named supabase bestaan (runtime heeft default).
declare module "@/lib/supabaseClient" {
  const supabase: any;
  export default supabase;
  export { supabase };
}

export {};