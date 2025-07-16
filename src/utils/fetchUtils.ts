/**
 * Enhanced fetch utility with content-type validation and fallback support
 */

/**
 * Fetches data from a URL with proper error handling
 * @param url - The URL to fetch from
 * @returns The parsed response data
 */
export const safeFetch = async <T>(url: string): Promise<T> => {
  try {
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
  } catch (error) {
    console.error(`[❌ Fetch Error] ${url}:`, error);
    throw error;
  }
};

/**
 * Fetches data with retry logic on failure
 * @param url - The URL to fetch from
 * @param retries - Number of retry attempts
 * @param delay - Delay between retries (ms)
 * @returns The parsed response data
 */
export const fetchWithRetry = async <T>(
  url: string,
  retries: number = 2,
  delay: number = 1000
): Promise<T> => {
  let lastError: Error;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await safeFetch<T>(url);
    } catch (error) {
      lastError = error as Error;
      console.warn(`[⚠️ Retry ${attempt + 1}/${retries + 1}] Failed to fetch ${url}:`, error);

      if (attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt)));
      }
    }
  }

  throw lastError!;
};

/**
 * Fetches data with fallback if the fetch fails or returns non-JSON
 * @param url - The URL to fetch from
 * @param fallback - Fallback data if fetch fails
 * @param retries - Number of retries before using fallback
 * @returns Fetched or fallback data
 */
export const safeFetchWithFallback = async <T>(
  url: string,
  fallback: T,
  retries: number = 1
): Promise<T> => {
  try {
    return await fetchWithRetry<T>(url, retries);
  } catch (error) {
    console.warn(`[⚠️ safeFetchWithFallback] Using fallback for ${url}:`, error);
    return fallback;
  }
};

// Optional: default export for grouped imports
export default {
  safeFetch,
  fetchWithRetry,
  safeFetchWithFallback,
};
