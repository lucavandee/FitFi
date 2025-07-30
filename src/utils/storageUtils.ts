/**
 * Storage utilities for handling localStorage availability
 * Especially important for mobile browsers in private mode
 */

/**
 * Test if localStorage is available and working
 * Returns false in private browsing mode or when storage is disabled
 */
export const storageAvailable = (): boolean => {
  try {
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, testKey);
    localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    console.warn('[Storage] localStorage not available, falling back to cookies');
    return false;
  }
};

/**
 * Test if sessionStorage is available and working
 */
export const sessionStorageAvailable = (): boolean => {
  try {
    const testKey = '__session_test__';
    sessionStorage.setItem(testKey, testKey);
    sessionStorage.removeItem(testKey);
    return true;
  } catch (e) {
    console.warn('[Storage] sessionStorage not available');
    return false;
  }
};

/**
 * Safe localStorage wrapper with cookie fallback
 */
export const safeStorage = {
  getItem: (key: string): string | null => {
    if (storageAvailable()) {
      return localStorage.getItem(key);
    }
    
    // Cookie fallback
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === key) {
        return decodeURIComponent(value);
      }
    }
    return null;
  },
  
  setItem: (key: string, value: string): void => {
    if (storageAvailable()) {
      localStorage.setItem(key, value);
    } else {
      // Cookie fallback with 7 day expiry
      const expires = new Date();
      expires.setDate(expires.getDate() + 7);
      document.cookie = `${key}=${encodeURIComponent(value)}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
    }
  },
  
  removeItem: (key: string): void => {
    if (storageAvailable()) {
      localStorage.removeItem(key);
    } else {
      // Remove cookie
      document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    }
  }
};

export default {
  storageAvailable,
  sessionStorageAvailable,
  safeStorage
};