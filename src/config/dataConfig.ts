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
      tribeChallenges: "tribe_challenges",
      tribeChallengeSubmissions: "tribe_challenge_subs",
      tribeRanking: "tribe_ranking"
    }
  },
  AFFILIATE: {
    providers: {
      generic: { param: "aff_id", id: "fitfi" },
      amazon:  { param: "tag",    id: "dormiqnl-21" },
      zalando: { param: "wmc",    id: "affiliate" }
    },
    enableAffiliateParams: !!import.meta.env.VITE_DEFAULT_SHOP_PARTNER,
    trackingOnly: !import.meta.env.VITE_DEFAULT_SHOP_PARTNER
  }
} as const;

export type DataConfig = typeof DATA_CONFIG;
export default DATA_CONFIG;