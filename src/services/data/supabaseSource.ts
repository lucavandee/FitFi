import type { BoltProduct, Outfit, FitFiUserProfile, Tribe, TribeChallenge, TribeChallengeSubmission, TribeRanking } from "./types";

// Supabase stubs - fallback naar lege arrays/null wanneer USE_SUPABASE=false
// Deze functies kunnen later uitgebreid worden met echte Supabase queries

export async function sb_fetchProducts(): Promise<BoltProduct[]> { 
  return []; 
}

export async function sb_fetchOutfits(): Promise<Outfit[]> { 
  return []; 
}

export async function sb_fetchUser(): Promise<FitFiUserProfile | null> { 
  return null; 
}

export async function sb_fetchTribes(): Promise<Tribe[]> { 
  return []; 
}

export async function sb_fetchTribeBySlug(_slug: string): Promise<Tribe | null> { 
  return null; 
}

export async function sb_getTribeChallenges(_tribeId?: string): Promise<TribeChallenge[]> { 
  return []; 
}

export async function sb_getChallengeSubmissions(_challengeId: string): Promise<TribeChallengeSubmission[]> { 
  return []; 
}

export async function sb_getTribeRanking(_tribeId: string): Promise<TribeRanking[]> { 
  return []; 
}