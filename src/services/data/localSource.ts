export async function readLocalJSON<T>(_path: string, fallback: T): Promise<T> {
  // JSON in /dist bevat ellipses; gebruik fallback
  return fallback;
}