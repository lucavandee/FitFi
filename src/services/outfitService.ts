/**
 * outfitService.ts
 * ---------------
 * Eén centrale plek om outfits op te halen. Standaard uit /data/mock-outfits.json
 * maar kan eenvoudig worden omgeschakeld naar een externe endpoint.
 */
import type { OutfitResponse } from '../types/outfit';

const MOCK_URL = '/data/mock-outfits.json';

/** In de .env kun je later VITE_OUTFIT_API_URL zetten */
const ENDPOINT = import.meta.env.VITE_OUTFIT_API_URL ?? MOCK_URL;

export const fetchOutfits = async (styleKey: string): Promise<OutfitResponse> => {
  try {
    const res = await fetch(`${ENDPOINT}?style=${encodeURIComponent(styleKey)}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as OutfitResponse;
  } catch (err) {
    console.error('[🔴 outfitService]', err);
    // Fallback: laad altijd de mock
    const res = await fetch(MOCK_URL);
    return (await res.json()) as OutfitResponse;
  }
};