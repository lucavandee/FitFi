export async function loadLocalJSON<T = unknown>(path: string): Promise<T> {
  const res = await fetch(path, { cache: "no-store" });
  if (!res.ok)
    throw new Error(`Failed to fetch local JSON: ${path} (${res.status})`);
  return (await res.json()) as T;
}
