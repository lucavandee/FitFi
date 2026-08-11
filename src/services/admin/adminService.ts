import { supabase } from '@/lib/supabaseClient';

export interface DashboardMetrics {
  total_users: number;
  admin_count: number;
  tier_breakdown: {
    free: number;
    premium: number;
    founder: number;
  };
  growth: {
    last_7d: number;
    last_30d: number;
    last_90d: number;
  };
  engagement: {
    with_style_profile: number;
    with_saved_outfits: number;
    with_quiz_completed: number;
  };
  referrals: {
    users_with_referrals: number;
    total_referrals: number;
  };
}

export interface UserSearchResult {
  id: string;
  full_name: string;
  email: string;
  tier: 'free' | 'premium' | 'founder';
  is_admin: boolean;
  referral_count: number;
  created_at: string;
  saved_outfits_count: number;
  has_style_profile: boolean;
}

export interface AuditLogEntry {
  id: string;
  admin_id: string;
  action: string;
  target_user_id: string | null;
  details: Record<string, any>;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

function getal(waarde: unknown): number {
  return typeof waarde === 'number' && Number.isFinite(waarde) ? waarde : 0;
}

function tak(bron: Record<string, unknown>, sleutel: string): Record<string, unknown> {
  const waarde = bron[sleutel];
  return waarde !== null && typeof waarde === 'object' && !Array.isArray(waarde)
    ? (waarde as Record<string, unknown>)
    : {};
}

/**
 * Maakt van de RPC-payload altijd een compleet DashboardMetrics-object.
 *
 * `get_dashboard_metrics` is twee keer van vorm veranderd. De versie van
 * migratie 20251020135118 leverde geneste `growth`, `engagement`, `referrals`
 * en `admin_count`; de recursie-fix van 20251103103800 gooide die weg en gaf
 * er `active_users_last_7_days` en `quiz_completion_rate` voor terug. De UI
 * las nog de oude vorm en crashte op de nieuwe. Deze functie leest beide, en
 * vult wat de database niet meer levert met nul in plaats van undefined.
 *
 * Exported zodat de regressietest hem los kan aanroepen.
 */
export function normalizeDashboardMetrics(raw: unknown): DashboardMetrics | null {
  if (raw === null || raw === undefined) return null;

  const bron: Record<string, unknown> =
    typeof raw === 'object' && !Array.isArray(raw) ? (raw as Record<string, unknown>) : {};

  const tiers = tak(bron, 'tier_breakdown');
  const groei = tak(bron, 'growth');
  const betrokkenheid = tak(bron, 'engagement');
  const referrals = tak(bron, 'referrals');

  const totaalGebruikers = getal(bron.total_users);
  const quizRatio = getal(bron.quiz_completion_rate);

  return {
    total_users: totaalGebruikers,
    admin_count: getal(bron.admin_count),
    tier_breakdown: {
      free: getal(tiers.free),
      premium: getal(tiers.premium),
      founder: getal(tiers.founder),
    },
    growth: {
      last_7d: getal(groei.last_7d) || getal(bron.active_users_last_7_days),
      last_30d: getal(groei.last_30d),
      last_90d: getal(groei.last_90d),
    },
    engagement: {
      with_style_profile: getal(betrokkenheid.with_style_profile),
      with_saved_outfits: getal(betrokkenheid.with_saved_outfits),
      with_quiz_completed:
        getal(betrokkenheid.with_quiz_completed) || Math.round(quizRatio * totaalGebruikers),
    },
    referrals: {
      users_with_referrals: getal(referrals.users_with_referrals),
      total_referrals: getal(referrals.total_referrals),
    },
  };
}

export async function getDashboardMetrics(): Promise<DashboardMetrics | null> {
  try {
    const sb = supabase();
    if (!sb) return null;
    const { data, error } = await sb.rpc('get_dashboard_metrics');
    if (error) {
      console.error('Failed to fetch dashboard metrics:', error);
      return null;
    }
    return normalizeDashboardMetrics(data);
  } catch (err) {
    console.error('Exception fetching dashboard metrics:', err);
    return null;
  }
}

export async function searchUsers(params: {
  searchTerm?: string;
  tier?: 'free' | 'premium' | 'founder';
  isAdmin?: boolean;
  hasReferrals?: boolean;
  limit?: number;
  offset?: number;
}): Promise<UserSearchResult[]> {
  try {
    const sb = supabase();
    if (!sb) return [];
    const { data, error } = await sb.rpc('search_users', {
      p_search_term: params.searchTerm || null,
      p_tier: params.tier || null,
      p_is_admin: params.isAdmin ?? null,
      p_has_referrals: params.hasReferrals ?? null,
      p_limit: params.limit || 50,
      p_offset: params.offset || 0,
    });
    if (error) {
      console.error('Failed to search users:', error);
      return [];
    }
    return data as UserSearchResult[];
  } catch (err) {
    console.error('Exception searching users:', err);
    return [];
  }
}

export async function setUserAdmin(
  targetUserId: string,
  isAdmin: boolean,
  reason?: string
): Promise<boolean> {
  try {
    const sb = supabase();
    if (!sb) return false;
    const { data, error } = await sb.rpc('set_user_admin', {
      p_target_user_id: targetUserId,
      p_is_admin: isAdmin,
      p_reason: reason || null,
    });
    if (error) {
      console.error('Failed to set user admin:', error);
      return false;
    }
    return data === true;
  } catch (err) {
    console.error('Exception setting user admin:', err);
    return false;
  }
}

export async function setUserTier(
  targetUserId: string,
  tier: 'free' | 'premium' | 'founder',
  reason?: string
): Promise<boolean> {
  try {
    const sb = supabase();
    if (!sb) {
      console.error('setUserTier: supabase client is null');
      return false;
    }

    const { data: sessionData } = await sb.auth.getSession();
    if (!sessionData?.session) {
      console.error('setUserTier: no active session');
      return false;
    }

    const { data, error } = await sb.rpc('set_user_tier', {
      p_target_user_id: targetUserId,
      p_tier: tier,
      p_reason: reason || null,
    });

    if (error) {
      console.error('setUserTier RPC error:', error.message, error.code, error.details);
      return false;
    }

    return data === true;
  } catch (err) {
    console.error('Exception setting user tier:', err);
    return false;
  }
}

export async function getAuditLog(limit = 50, offset = 0): Promise<AuditLogEntry[]> {
  try {
    const sb = supabase();
    if (!sb) return [];
    const { data, error } = await sb
      .from('admin_audit_log')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    if (error) {
      console.error('Failed to fetch audit log:', error);
      return [];
    }
    return data as AuditLogEntry[];
  } catch (err) {
    console.error('Exception fetching audit log:', err);
    return [];
  }
}

export async function logAdminAction(
  action: string,
  targetUserId?: string,
  details?: Record<string, any>
): Promise<boolean> {
  try {
    const sb = supabase();
    if (!sb) return false;
    const { error } = await sb.rpc('log_admin_action', {
      p_action: action,
      p_target_user_id: targetUserId || null,
      p_details: details || {},
      p_ip_address: null,
      p_user_agent: navigator?.userAgent || null,
    });
    if (error) {
      console.error('Failed to log admin action:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Exception logging admin action:', err);
    return false;
  }
}

export interface NotificationInput {
  targetUserId?: string;
  targetTier?: 'free' | 'premium' | 'founder';
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'promo';
  actionUrl?: string;
  actionLabel?: string;
  expiresAt?: string;
}

export async function sendNotification(input: NotificationInput): Promise<boolean> {
  try {
    const sb = supabase();
    if (!sb) return false;
    const { error } = await sb.rpc('send_admin_notification', {
      p_target_user_id: input.targetUserId || null,
      p_target_tier: input.targetTier || null,
      p_title: input.title,
      p_message: input.message,
      p_type: input.type || 'info',
      p_action_url: input.actionUrl || null,
      p_action_label: input.actionLabel || null,
      p_expires_at: input.expiresAt || null,
    });
    if (error) {
      console.error('Failed to send notification:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Exception sending notification:', err);
    return false;
  }
}

export async function exportUsersCSV(): Promise<string | null> {
  try {
    const users = await searchUsers({ limit: 10000 });
    const headers = ['Email', 'Name', 'Tier', 'Admin', 'Created', 'Style Profile', 'Saved Outfits', 'Referrals'];
    const rows = users.map(u => [
      u.email,
      u.full_name,
      u.tier,
      u.is_admin ? 'Yes' : 'No',
      new Date(u.created_at).toLocaleDateString(),
      u.has_style_profile ? 'Yes' : 'No',
      u.saved_outfits_count.toString(),
      u.referral_count.toString(),
    ]);
    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    return csv;
  } catch (err) {
    console.error('Exception exporting users:', err);
    return null;
  }
}

export async function getRealtimeMetrics() {
  try {
    const sb = supabase();
    if (!sb) return null;
    const { data, error } = await sb.rpc('get_admin_metrics');
    if (error) {
      console.error('Failed to fetch realtime metrics:', error);
      return null;
    }
    return data;
  } catch (err) {
    console.error('Exception fetching realtime metrics:', err);
    return null;
  }
}
