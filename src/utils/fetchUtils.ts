/**
 * Enhanced fetch utility with content-type validation and error handling
 */

/**
 * Fetches data from a URL with proper error handling and content-type validation
 * @param url - The URL to fetch from
 * @param options - Fetch options
 * @returns The parsed response data
 */
export async function safeFetch<T>(url: string, options?: RequestInit): Promise<T> {
  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
    }
    
    const contentType = response.headers.get('content-type');
    
    // Check if content type is JSON
    if (!contentType || !contentType.includes('application/json')) {
      console.warn(`Invalid content-type for ${url}: ${contentType}`);
      
      // Try to parse as JSON anyway as a fallback
      try {
        return await response.json() as T;
      } catch (parseError) {
        console.error('Failed to parse response as JSON:', parseError);
        
        // Return empty object or array as fallback
        return (Array.isArray({})) ? [] as unknown as T : {} as T;
      }
    }
    
    return await response.json() as T;
  } catch (error: any) {
    console.error(`Fetch error for ${url}:`, error.message);
    throw error;
  }
}

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
      return await safeFetch<T>(url, options);
    } catch (error) {
      lastError = error as Error;
      console.warn(`Fetch attempt ${attempt + 1}/${retries} failed:`, error);
      
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