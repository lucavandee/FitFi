/**
 * Enhanced fetch utility with content-type validation and error handling
 */

/**
 * Fetches data from a URL with proper error handling and content-type validation
 * @param url - The URL to fetch from
 * @returns The parsed response data
 */
export const safeFetch = async <T>(url: string): Promise<T> => {
  const response = await fetch(url);
  const contentType = response.headers.get("content-type") || "";

  if (!response.ok) {
    throw new Error(`[❌ Fetch Error] ${response.status}: ${response.statusText}`);
  }

  if (contentType.includes("application/json")) {
    return await response.json();
  } else {
    const text = await response.text();
    console.warn("[⚠️ JSON Error] Unexpected content type:", contentType, "\nPreview:", text.slice(0, 100));
    throw new Error("Expected JSON but received something else");
  }
};

/**
 * Fetches data with fallback if the fetch fails or returns non-JSON
 * @param url - The URL to fetch from
 * @param fallback - Fallback data if fetch fails
 * @returns Fetched or fallback data
 */
export const safeFetchWithFallback = async <T>(url: string, fallback: T): Promise<T> => {
  try {
    return await safeFetch<T>(url);
  } catch (error) {
    console.warn(`[⚠️ safeFetchWithFallback] Using fallback: ${url}`, error);
    return fallback;
  }
};
