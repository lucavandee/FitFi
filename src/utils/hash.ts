/**
 * FNV-1a, 32 bits. Twee losse ingangen naar hetzelfde algoritme:
 *
 *   hashString  bestond al, gebruikt door image.ts (seed voor plaatje-
 *               varianten). Blijft ongewijzigd, gedrag mag niet veranderen.
 *   fnv1a32     nieuw, gebruikt door answersSeed.ts (seed voor de engine uit
 *               de quiz-antwoorden).
 *
 * Ze geven voor elke input hetzelfde getal. Plan 3 bouwt hierop verder en
 * verwacht dat dezelfde antwoorden overal in de keten dezelfde seed geven.
 * hash.test.ts bewaakt dat expliciet: geeft fnv1a32 ooit een ander getal dan
 * hashString, dan faalt die test.
 */
export function hashString(input: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < input.length; i++) { h ^= input.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

export function fnv1a32(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

/**
 * sha256 als hex-string. Gebruikt WebCrypto (globalThis.crypto.subtle), dat
 * zowel in de browser als in Node 19+ beschikbaar is (Node 22 in deze repo,
 * ook onder vitest met environment: node, zie vitest.config.ts).
 */
export async function sha256Hex(input: string): Promise<string> {
  const bytes = new TextEncoder().encode(input);
  const digest = await globalThis.crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}