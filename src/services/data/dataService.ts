export type CacheStats = { hits: number; misses: number; size: number };

export async function fetchProducts(): Promise<any[]> { 
  return []; 
}

export async function fetchOutfits(): Promise<any[]> { 
  return []; 
}

export async function fetchUser(): Promise<any | null> { 
  return null; 
}

export function clearCache(): void {}

export function getCacheStats(): CacheStats { 
  return { hits: 0, misses: 0, size: 0 }; 
}

export function getRecentErrors(): any[] { 
  return []; 
}

export async function healthCheck(): Promise<{ ok: true }> { 
  return { ok: true }; 
}