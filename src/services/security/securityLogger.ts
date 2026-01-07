import { supabase } from '@/lib/supabaseClient';

/**
 * Security event types to log
 */
export const SecurityEventType = {
  // Authentication events
  LOGIN_SUCCESS: 'login_success',
  LOGIN_FAILURE: 'login_failure',
  LOGOUT: 'logout',
  REGISTRATION: 'registration',
  PASSWORD_RESET: 'password_reset',

  // Authorization events
  UNAUTHORIZED_ACCESS: 'unauthorized_access',
  ADMIN_ACCESS: 'admin_access',
  RLS_VIOLATION: 'rls_violation',

  // Rate limiting
  RATE_LIMIT_EXCEEDED: 'rate_limit_exceeded',
  RATE_LIMIT_WARNING: 'rate_limit_warning',

  // Data operations
  SENSITIVE_DATA_ACCESS: 'sensitive_data_access',
  BULK_OPERATION: 'bulk_operation',
  DATA_EXPORT: 'data_export',

  // File operations
  FILE_UPLOAD: 'file_upload',
  FILE_DOWNLOAD: 'file_download',
  EXCEL_UPLOAD: 'excel_upload',

  // AI operations
  NOVA_QUERY: 'nova_query',
  PHOTO_ANALYSIS: 'photo_analysis',
  OPENAI_API_CALL: 'openai_api_call',

  // Admin operations
  ADMIN_MOOD_PHOTO_UPLOAD: 'admin_mood_photo_upload',
  ADMIN_USER_UPDATE: 'admin_user_update',
  ADMIN_PRODUCT_UPDATE: 'admin_product_update',

  // Security incidents
  XSS_ATTEMPT: 'xss_attempt',
  CSRF_ATTEMPT: 'csrf_attempt',
  SUSPICIOUS_PATTERN: 'suspicious_pattern',
  MALICIOUS_FILE: 'malicious_file',
} as const;

export type SecurityEventTypeValue = typeof SecurityEventType[keyof typeof SecurityEventType];

/**
 * Security event severity levels
 */
export const SecuritySeverity = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
} as const;

export type SecuritySeverityValue = typeof SecuritySeverity[keyof typeof SecuritySeverity];

/**
 * Security event details
 */
export interface SecurityEventDetails {
  event_type: SecurityEventTypeValue;
  severity: SecuritySeverityValue;
  user_id?: string;
  ip_address?: string;
  user_agent?: string;
  endpoint?: string;
  details?: Record<string, any>;
}

/**
 * Security logger service
 * Logs security events to database for audit and monitoring
 */
export class SecurityLogger {
  /**
   * Log a security event
   */
  static async log(event: SecurityEventDetails): Promise<void> {
    try {
      const { error } = await supabase.rpc('log_security_event', {
        p_event_type: event.event_type,
        p_severity: event.severity,
        p_user_id: event.user_id || null,
        p_ip_address: event.ip_address || null,
        p_user_agent: event.user_agent || null,
        p_endpoint: event.endpoint || null,
        p_details: event.details ? JSON.stringify(event.details) : null,
      });

      if (error) {
        console.error('❌ Failed to log security event:', error);
        // Fail silently - don't block application flow
      }
    } catch (err) {
      console.error('❌ Security logger error:', err);
      // Fail silently - don't block application flow
    }
  }

  /**
   * Log successful login
   */
  static async logLoginSuccess(userId: string): Promise<void> {
    await this.log({
      event_type: SecurityEventType.LOGIN_SUCCESS,
      severity: SecuritySeverity.LOW,
      user_id: userId,
      user_agent: navigator.userAgent,
      details: {
        timestamp: new Date().toISOString(),
        method: 'email_password',
      },
    });
  }

  /**
   * Log failed login attempt
   */
  static async logLoginFailure(email: string, reason: string): Promise<void> {
    await this.log({
      event_type: SecurityEventType.LOGIN_FAILURE,
      severity: SecuritySeverity.MEDIUM,
      user_agent: navigator.userAgent,
      details: {
        email: email.substring(0, 3) + '***', // Partial email for privacy
        reason,
        timestamp: new Date().toISOString(),
      },
    });
  }

  /**
   * Log rate limit exceeded
   */
  static async logRateLimitExceeded(
    userId: string | undefined,
    endpoint: string,
    limit: number
  ): Promise<void> {
    await this.log({
      event_type: SecurityEventType.RATE_LIMIT_EXCEEDED,
      severity: SecuritySeverity.HIGH,
      user_id: userId,
      endpoint,
      user_agent: navigator.userAgent,
      details: {
        limit,
        timestamp: new Date().toISOString(),
      },
    });
  }

  /**
   * Log unauthorized access attempt
   */
  static async logUnauthorizedAccess(
    userId: string | undefined,
    resource: string,
    action: string
  ): Promise<void> {
    await this.log({
      event_type: SecurityEventType.UNAUTHORIZED_ACCESS,
      severity: SecuritySeverity.HIGH,
      user_id: userId,
      user_agent: navigator.userAgent,
      details: {
        resource,
        action,
        timestamp: new Date().toISOString(),
      },
    });
  }

  /**
   * Log admin operation
   */
  static async logAdminOperation(
    userId: string,
    operation: string,
    targetResource: string,
    details?: Record<string, any>
  ): Promise<void> {
    await this.log({
      event_type: SecurityEventType.ADMIN_ACCESS,
      severity: SecuritySeverity.MEDIUM,
      user_id: userId,
      user_agent: navigator.userAgent,
      details: {
        operation,
        targetResource,
        ...details,
        timestamp: new Date().toISOString(),
      },
    });
  }

  /**
   * Log Excel file upload (Bram's Fruit)
   */
  static async logExcelUpload(
    userId: string,
    filename: string,
    fileSize: number,
    rowCount: number
  ): Promise<void> {
    await this.log({
      event_type: SecurityEventType.EXCEL_UPLOAD,
      severity: SecuritySeverity.MEDIUM,
      user_id: userId,
      user_agent: navigator.userAgent,
      details: {
        filename,
        fileSize,
        rowCount,
        timestamp: new Date().toISOString(),
      },
    });
  }

  /**
   * Log Nova AI query
   */
  static async logNovaQuery(
    userId: string | undefined,
    query: string,
    context: string
  ): Promise<void> {
    await this.log({
      event_type: SecurityEventType.NOVA_QUERY,
      severity: SecuritySeverity.LOW,
      user_id: userId,
      endpoint: '/functions/nova',
      user_agent: navigator.userAgent,
      details: {
        queryLength: query.length,
        context,
        timestamp: new Date().toISOString(),
      },
    });
  }

  /**
   * Log suspicious activity
   */
  static async logSuspiciousActivity(
    userId: string | undefined,
    description: string,
    details?: Record<string, any>
  ): Promise<void> {
    await this.log({
      event_type: SecurityEventType.SUSPICIOUS_PATTERN,
      severity: SecuritySeverity.HIGH,
      user_id: userId,
      user_agent: navigator.userAgent,
      details: {
        description,
        ...details,
        timestamp: new Date().toISOString(),
      },
    });
  }

  /**
   * Log potential XSS attempt
   */
  static async logXSSAttempt(
    userId: string | undefined,
    input: string,
    location: string
  ): Promise<void> {
    await this.log({
      event_type: SecurityEventType.XSS_ATTEMPT,
      severity: SecuritySeverity.CRITICAL,
      user_id: userId,
      user_agent: navigator.userAgent,
      details: {
        input: input.substring(0, 100), // First 100 chars
        location,
        timestamp: new Date().toISOString(),
      },
    });
  }

  /**
   * Get user's IP address (best effort)
   * Note: This may not work behind proxies/CDNs
   */
  private static async getUserIP(): Promise<string | undefined> {
    try {
      // Try to get IP from client-side (limited accuracy)
      // In production, this should come from server-side headers
      return undefined; // Client-side cannot reliably get IP
    } catch {
      return undefined;
    }
  }
}

/**
 * Helper to detect potential XSS patterns in user input
 */
export function detectXSSPattern(input: string): boolean {
  const xssPatterns = [
    /<script[^>]*>[\s\S]*?<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=\s*["'][^"']*["']/gi,
    /<iframe[^>]*>/gi,
    /<object[^>]*>/gi,
    /<embed[^>]*>/gi,
    /eval\(/gi,
    /expression\(/gi,
  ];

  return xssPatterns.some((pattern) => pattern.test(input));
}

/**
 * Sanitize user input and log XSS attempts
 */
export async function sanitizeAndLog(
  input: string,
  userId: string | undefined,
  location: string
): Promise<string> {
  if (detectXSSPattern(input)) {
    await SecurityLogger.logXSSAttempt(userId, input, location);
    // Strip dangerous patterns
    return input
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
  }
  return input;
}
