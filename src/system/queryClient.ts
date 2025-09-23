// /src/system/queryClient.ts
import { QueryClient } from "@tanstack/react-query";

/**
 * Singleton QueryClient met defensieve defaults.
 * Voorkomt dubbele instanties bij HMR.
 */
let client: QueryClient | null = null;

export default function getQueryClient() {
  if (!client) {
    client = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 1000 * 60 * 5,
          refetchOnWindowFocus: false,
          retry: 1,
        },
        mutations: {
          retry: 0,
        },
      },
    });
  }
  return client;
}