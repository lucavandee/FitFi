/**
 * Supabase Error Handler Utilities
 * Provides centralized error handling and user-friendly error messages
 */

import toast from 'react-hot-toast';

export interface SupabaseErrorContext {
  operation: string;
  tableName?: string;
  functionName?: string;
  userId?: string;
  additionalContext?: Record<string, any>;
}

interface ErrorHandlingOptions {
  showToast?: boolean;
  toastMessage?: string;
  logError?: boolean;
  _retryable?: boolean;
  fallbackValue?: any;
}

/**
 * Enhanced error handler with context and user feedback
 */
async function handleSupabaseError(
  error: any,
  context: SupabaseErrorContext,
  options: ErrorHandlingOptions = {}
): Promise<any> {
  const {
    showToast = true,
    toastMessage,
    logError = true,
    _retryable = false,
    fallbackValue = null
  } = options;

  // Log error if enabled
  if (logError) {
    console.error(`[Supabase Error] ${context.operation}:`, error);
  }

  // Get user-friendly error message
  const userMessage = toastMessage || getUserFriendlyErrorMessage(error, context);

  // Show toast notification if enabled
  if (showToast && typeof window !== 'undefined') {
    const toastId = `supabase-error-${context.operation}`;
    
    if (error.status === 401 || error.status === 403 || error.code === '42501') {
      toast.error('Sessie verlopen - probeer opnieuw in te loggen', {
        id: toastId,
        duration: 5000
      });
    } else if (error.status >= 500) {
      toast.error('Server probleem - probeer het later opnieuw', {
        id: toastId,
        duration: 4000
      });
    } else {
      toast.error(userMessage, {
        id: toastId,
        duration: 3000
      });
    }
  }

  // Return fallback value for graceful degradation
  return fallbackValue;
}

/**
 * Get user-friendly error message based on error type
 */
function getUserFriendlyErrorMessage(error: any, context: SupabaseErrorContext): string {
  // Auth errors
  if (error.status === 401 || error.code === '42501') {
    return 'Je hebt geen toegang tot deze functie';
  }
  
  if (error.status === 403) {
    return 'Toegang geweigerd';
  }

  // Network errors
  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    return 'Verbindingsprobleem - controleer je internet';
  }

  // Server errors
  if (error.status >= 500) {
    return 'Server probleem - probeer het later opnieuw';
  }

  // Database constraint errors
  if (error.code === '23505') {
    return 'Deze gegevens bestaan al';
  }
  
  if (error.code === '23503') {
    return 'Ongeldige referentie - controleer je gegevens';
  }

  // Rate limiting
  if (error.status === 429) {
    return 'Te veel verzoeken - wacht even en probeer opnieuw';
  }

  // Operation-specific messages
  switch (context.operation) {
    case 'insert':
      return 'Kon gegevens niet opslaan';
    case 'update':
      return 'Kon gegevens niet bijwerken';
    case 'delete':
      return 'Kon gegevens niet verwijderen';
    case 'select':
      return 'Kon gegevens niet laden';
    case 'function_invoke':
      return 'Functie kon niet worden uitgevoerd';
    default:
      return 'Er ging iets mis - probeer het opnieuw';
  }
}

/**
 * Wrapper for Supabase operations with enhanced error handling
 */
export async function executeSupabaseOperation<T>(
  operation: () => Promise<{ data: T; error: any }>,
  context: SupabaseErrorContext,
  options: ErrorHandlingOptions = {}
): Promise<T | null> {
  try {
    const { data, error } = await operation();
    
    if (error) {
      await handleSupabaseError(error, context, options);
      return options.fallbackValue || null;
    }
    
    return data;
  } catch (error) {
    await handleSupabaseError(error, context, options);
    return options.fallbackValue || null;
  }
}

/**
 * Batch error handler for multiple operations
 */
async function handleBatchErrors(
  errors: Array<{ error: any; context: SupabaseErrorContext }>,
  options: ErrorHandlingOptions = {}
): Promise<void> {
  const uniqueErrors = new Map();
  
  // Deduplicate similar errors
  errors.forEach(({ error, context }) => {
    const key = `${error.code || error.status}-${context.operation}`;
    if (!uniqueErrors.has(key)) {
      uniqueErrors.set(key, { error, context });
    }
  });
  
  // Handle each unique error
  for (const { error, context } of uniqueErrors.values()) {
    await handleSupabaseError(error, context, { ...options, showToast: false });
  }
  
  // Show single summary toast
  if (options.showToast !== false && typeof window !== 'undefined') {
    const errorCount = uniqueErrors.size;
    toast.error(`${errorCount} operatie${errorCount > 1 ? 's' : ''} mislukt`, {
      id: 'batch-error',
      duration: 4000
    });
  }
}

