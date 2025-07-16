/**
 * Enhanced fetch utility with content-type validation and error handling
 */

/**
 * Fetches data from a URL with proper error handling and content-type validation
 * @param url - The URL to fetch from
 * @param options - Fetch options
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
 * Fetches JSON data with retry logic
 * @param url - The URL to fetch from
 * @param options - Fetch options
 * @param retries - Number of retries
 * @returns The parsed response data
 */
export async function fetchWithRetry<T>(
  url: string, 
  options?: RequestInit, 
  retries: number = 3
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await safeFetch<T>(url);
    } catch (error) {
      lastError = error as Error;
      console.warn(`[⚠️ Retry] Fetch attempt ${attempt + 1}/${retries} failed:`, error);
      
      // Wait before retrying (exponential backoff)
      if (attempt < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
      }
    }
  }
  
  throw lastError || new Error(`Failed to fetch ${url} after ${retries} attempts`);
}

export default {
  safeFetch,
  fetchWithRetry
};