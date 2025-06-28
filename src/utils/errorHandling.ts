/**
 * Utility functions for error handling
 */

/**
 * Formats an error message for display
 * @param error - The error to format
 * @param fallbackMessage - Fallback message if error is not an Error object
 * @returns Formatted error message
 */
export const formatErrorMessage = (error: unknown, fallbackMessage: string = 'Er is een fout opgetreden'): string => {
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  if (typeof error === 'object' && error !== null) {
    // Try to extract message from error object
    const errorObj = error as Record<string, any>;
    if (errorObj.message) {
      return String(errorObj.message);
    }
    
    // Check for Supabase error format
    if (errorObj.error && typeof errorObj.error === 'object' && errorObj.error.message) {
      return String(errorObj.error.message);
    }
  }
  
  return fallbackMessage;
};

/**
 * Logs an error with additional context
 * @param error - The error to log
 * @param context - Additional context for the error
 */
export const logError = (error: unknown, context: Record<string, any> = {}): void => {
  const errorMessage = formatErrorMessage(error);
  const errorObj = error instanceof Error ? error : new Error(errorMessage);
  
  console.error('Application error:', {
    message: errorMessage,
    stack: errorObj.stack,
    ...context,
    timestamp: new Date().toISOString(),
    url: window.location.href
  });
  
  // Track error in analytics
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'error', {
      event_category: 'error',
      event_label: errorMessage,
      error_type: errorObj.name,
      error_message: errorMessage,
      error_stack: errorObj.stack,
      ...context
    });
  }
};

/**
 * Creates a user-friendly error message based on error type
 * @param error - The error to create a message for
 * @returns User-friendly error message
 */
export const getUserFriendlyErrorMessage = (error: unknown): string => {
  const errorMessage = formatErrorMessage(error);
  
  // Network errors
  if (
    errorMessage.includes('network') ||
    errorMessage.includes('fetch') ||
    errorMessage.includes('timeout') ||
    errorMessage.includes('connection')
  ) {
    return 'Er is een netwerkprobleem opgetreden. Controleer je internetverbinding en probeer het opnieuw.';
  }
  
  // Authentication errors
  if (
    errorMessage.includes('auth') ||
    errorMessage.includes('login') ||
    errorMessage.includes('password') ||
    errorMessage.includes('email')
  ) {
    return 'Er is een probleem met je inloggegevens. Controleer je e-mail en wachtwoord en probeer het opnieuw.';
  }
  
  // Database errors
  if (
    errorMessage.includes('database') ||
    errorMessage.includes('query') ||
    errorMessage.includes('SQL')
  ) {
    return 'Er is een probleem met onze database. Probeer het later opnieuw.';
  }
  
  // Permission errors
  if (
    errorMessage.includes('permission') ||
    errorMessage.includes('access') ||
    errorMessage.includes('unauthorized')
  ) {
    return 'Je hebt geen toegang tot deze functie. Log in of neem contact op met support.';
  }
  
  // Validation errors
  if (
    errorMessage.includes('validation') ||
    errorMessage.includes('invalid') ||
    errorMessage.includes('required')
  ) {
    return 'Er is een probleem met de ingevoerde gegevens. Controleer je invoer en probeer het opnieuw.';
  }
  
  // Default error message
  return 'Er is een onverwachte fout opgetreden. Probeer het later opnieuw.';
};

/**
 * Checks if an error is a network error
 * @param error - The error to check
 * @returns Whether the error is a network error
 */
export const isNetworkError = (error: unknown): boolean => {
  if (error instanceof Error) {
    return (
      error.message.includes('network') ||
      error.message.includes('fetch') ||
      error.message.includes('timeout') ||
      error.message.includes('connection') ||
      error.name === 'TypeError' && error.message.includes('Failed to fetch')
    );
  }
  
  return false;
};

/**
 * Checks if an error is a timeout error
 * @param error - The error to check
 * @returns Whether the error is a timeout error
 */
export const isTimeoutError = (error: unknown): boolean => {
  if (error instanceof Error) {
    return error.message.includes('timeout');
  }
  
  return false;
};

export default {
  formatErrorMessage,
  logError,
  getUserFriendlyErrorMessage,
  isNetworkError,
  isTimeoutError
};