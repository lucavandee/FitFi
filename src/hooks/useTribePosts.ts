export interface TribePost { id: string; tribeId: string; content: string; }
export default function useTribePosts(tribeId?: string) {
  const data: TribePost[] = tribeId ? [] : [];
  return { data, isLoading: false, error: null as unknown };
}