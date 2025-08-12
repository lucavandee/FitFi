// src/config/dataConfig.ts
export const DATA_CONFIG = {
  USE_SUPABASE: import.meta.env.VITE_USE_SUPABASE === 'true',
  SUPABASE: {
    url: import.meta.env.VITE_SUPABASE_URL ?? "",
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY ?? "",
    tables: {
      products: "products",
      outfits: "outfits",
      users: "users",
      tribes: "tribes",
      tribeMembers: "tribe_members",
      tribePosts: "tribe_posts",
      tribe_members: "tribe_members",
      tribe_posts: "tribe_posts",
      tribe_post_likes: "tribe_post_likes",
      tribe_post_comments: "tribe_post_comments",
    },
  },
  LOCAL_JSON: {
    products: "/data/bolt/products.json",
    outfits: "/data/bolt/outfits.json",
    user: "/data/bolt/user.json",
    tribes: "/data/bolt/tribes.json",
  },
  AFFILIATE: {
    defaultUtm: {
      utm_source: "fitfi",
      utm_medium: "affiliate",
      utm_campaign: "style-recs",
    },
    providers: {
      generic: { param: "aff_id", id: "fitfi" },
      amazon:  { param: "tag",    id: "dormiqnl-21" }, // pas aan indien nodig
      zalando: { param: "wmc",    id: "affiliate" },   // placeholder; geen scraping
    },
  },
} as const;

export type DataConfig = typeof DATA_CONFIG;