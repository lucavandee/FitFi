import { getSupabase } from '@/lib/supabase';

/**
 * A/B Testing Service
 * Provides variant assignment, event tracking, and analytics
 */

export interface Experiment {
  id: string;
  name: string;
  description?: string;
  variants: Variant[];
  traffic_split: Record<string, number>;
  status: 'draft' | 'active' | 'paused' | 'completed';
  start_date?: string;
  end_date?: string;
  created_at: string;
}

export interface Variant {
  name: string;
  description?: string;
  config?: Record<string, any>;
}

export interface Assignment {
  id: string;
  experiment_id: string;
  variant: string;
  assigned_at: string;
}

export interface ABEvent {
  id?: string;
  experiment_id: string;
  assignment_id: string;
  event_type: string;
  event_data?: Record<string, any>;
  created_at?: string;
}

export interface ExperimentResults {
  variant: string;
  total_assignments: number;
  total_conversions: number;
  conversion_rate: number;
  avg_time_to_conversion?: number;
}

/**
 * Get or create assignment for user/session
 * Uses PostgreSQL function for atomic assignment
 */
export async function getVariant(
  experimentName: string,
  userId?: string,
  sessionId?: string
): Promise<string | null> {
  const client = getSupabase();
  if (!client) {
    console.warn('⚠️ [ABTesting] Supabase not available');
    return null;
  }

  try {
    // Get experiment by name
    const { data: experiment, error: expError } = await client
      .from('ab_experiments')
      .select('id')
      .eq('name', experimentName)
      .eq('status', 'active')
      .maybeSingle();

    if (expError || !experiment) {
      console.warn(`⚠️ [ABTesting] Experiment "${experimentName}" not found or not active`);
      return null;
    }

    // Call PostgreSQL function to get or create assignment
    const { data, error } = await client
      .rpc('get_or_create_ab_assignment', {
        p_experiment_id: experiment.id,
        p_user_id: userId || null,
        p_session_id: sessionId || null
      });

    if (error) {
      console.error('[ABTesting] Failed to get assignment:', error);
      return null;
    }

    if (!data || data.length === 0) {
      return null;
    }

    const variant = data[0].variant;
    console.log(`🧪 [ABTesting] "${experimentName}": variant="${variant}"`);

    return variant;
  } catch (error) {
    console.error('[ABTesting] Error getting variant:', error);
    return null;
  }
}

/**
 * Track A/B testing event
 */
export async function trackEvent(
  experimentName: string,
  eventType: string,
  userId?: string,
  sessionId?: string,
  eventData?: Record<string, any>
): Promise<void> {
  const client = getSupabase();
  if (!client) return;

  try {
    // Get experiment
    const { data: experiment, error: expError } = await client
      .from('ab_experiments')
      .select('id')
      .eq('name', experimentName)
      .eq('status', 'active')
      .maybeSingle();

    if (expError || !experiment) {
      console.warn(`⚠️ [ABTesting] Experiment "${experimentName}" not found`);
      return;
    }

    // Get assignment
    const { data: assignments, error: assignError } = await client
      .from('ab_assignments')
      .select('id')
      .eq('experiment_id', experiment.id)
      .or(
        userId ? `user_id.eq.${userId}` : `session_id.eq.${sessionId}`
      )
      .maybeSingle();

    if (assignError || !assignments) {
      console.warn(`⚠️ [ABTesting] No assignment found for experiment "${experimentName}"`);
      return;
    }

    // Track event
    const { error: eventError } = await client
      .from('ab_events')
      .insert({
        experiment_id: experiment.id,
        assignment_id: assignments.id,
        user_id: userId || null,
        session_id: sessionId || null,
        event_type: eventType,
        event_data: eventData || {}
      });

    if (eventError) {
      console.error('[ABTesting] Failed to track event:', eventError);
      return;
    }

    console.log(`🧪 [ABTesting] Tracked "${eventType}" for "${experimentName}"`);
  } catch (error) {
    console.error('[ABTesting] Error tracking event:', error);
  }
}

/**
 * Get experiment results
 */
export async function getExperimentResults(
  experimentName: string
): Promise<ExperimentResults[]> {
  const client = getSupabase();
  if (!client) return [];

  try {
    // Get experiment
    const { data: experiment, error: expError } = await client
      .from('ab_experiments')
      .select('id')
      .eq('name', experimentName)
      .maybeSingle();

    if (expError || !experiment) {
      return [];
    }

    // Call PostgreSQL function to calculate results
    const { data, error } = await client
      .rpc('calculate_ab_results', {
        p_experiment_id: experiment.id
      });

    if (error) {
      console.error('[ABTesting] Failed to get results:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('[ABTesting] Error getting results:', error);
    return [];
  }
}

/**
 * Create new experiment (admin only)
 */
export async function createExperiment(
  name: string,
  variants: Variant[],
  trafficSplit: Record<string, number>,
  description?: string
): Promise<string | null> {
  const client = getSupabase();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('ab_experiments')
      .insert({
        name,
        description,
        variants,
        traffic_split: trafficSplit,
        status: 'draft'
      })
      .select('id')
      .single();

    if (error) {
      console.error('[ABTesting] Failed to create experiment:', error);
      return null;
    }

    return data.id;
  } catch (error) {
    console.error('[ABTesting] Error creating experiment:', error);
    return null;
  }
}

/**
 * Activate experiment (admin only)
 */
export async function activateExperiment(experimentId: string): Promise<boolean> {
  const client = getSupabase();
  if (!client) return false;

  try {
    const { error } = await client
      .from('ab_experiments')
      .update({
        status: 'active',
        start_date: new Date().toISOString()
      })
      .eq('id', experimentId);

    if (error) {
      console.error('[ABTesting] Failed to activate experiment:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('[ABTesting] Error activating experiment:', error);
    return false;
  }
}

/**
 * Pause experiment (admin only)
 */
export async function pauseExperiment(experimentId: string): Promise<boolean> {
  const client = getSupabase();
  if (!client) return false;

  try {
    const { error } = await client
      .from('ab_experiments')
      .update({ status: 'paused' })
      .eq('id', experimentId);

    if (error) {
      console.error('[ABTesting] Failed to pause experiment:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('[ABTesting] Error pausing experiment:', error);
    return false;
  }
}

/**
 * Complete experiment (admin only)
 */
export async function completeExperiment(experimentId: string): Promise<boolean> {
  const client = getSupabase();
  if (!client) return false;

  try {
    const { error } = await client
      .from('ab_experiments')
      .update({
        status: 'completed',
        end_date: new Date().toISOString()
      })
      .eq('id', experimentId);

    if (error) {
      console.error('[ABTesting] Failed to complete experiment:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('[ABTesting] Error completing experiment:', error);
    return false;
  }
}

/**
 * List all experiments (admin only)
 */
export async function listExperiments(): Promise<Experiment[]> {
  const client = getSupabase();
  if (!client) return [];

  try {
    const { data, error } = await client
      .from('ab_experiments')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[ABTesting] Failed to list experiments:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('[ABTesting] Error listing experiments:', error);
    return [];
  }
}
