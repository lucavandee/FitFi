export function seededPick<T>(list: T[], seed: string): T {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619) >>> 0;
  const idx = h % Math.max(1, list.length);
  return list[idx];
}