import { getSupabase } from '../lib/supabase';
import { trackEvent } from '../utils/analytics';

export interface FunnelAnalytics {
  funnel_id: string;
  user_id?: string;
  session_id: string;
  step_id: string;
  step_name: string;
  completed: boolean;
  timestamp: number;
  time_spent: number;
  exit_point: boolean;
  conversion_value: number;
  metadata: Record<string, any>;
}

export interface HeatmapData {
  page_url: string;
  element_selector: string;
  click_count: number;
  hover_count: number;
  scroll_depth: number;
  viewport_size: string;
  device_type: string;
  timestamp: number;
  user_id?: string;
  session_id: string;
}

export interface SessionRecording {
  id: string;
  user_id?: string;
  session_id: string;
  page_url: string;
  duration: number;
  events: any[];
  device_info: Record<string, any>;
  conversion_events: string[];
  exit_intent: boolean;
  rage_clicks: number;
  dead_clicks: number;
  timestamp: number;
}

export interface PredictiveModel {
  user_id?: string;
  churn_probability: number;
  purchase_probability: number;
  engagement_score: number;
  style_confidence: number;
  predicted_ltv: number;
  risk_factors: string[];
  opportunities: string[];
  next_best_action: string;
  model_version: string;
  calculated_at: number;
}

export interface ConversionOptimization {
  user_id?: string;
  session_id: string;
  optimization_type: string;
  variant: string;
  confidence: number;
  expected_lift: number;
  applied_at: number;
  result?: string;
}

export interface FunnelMetrics {
  total_entries: number;
  completion_rate: number;
  avg_time_to_complete: number;
  drop_off_points: Array<{ step: string; drop_rate: number }>;
}

export interface HeatmapSummary {
  page_url: string;
  total_sessions: number;
  avg_scroll_depth: number;
  top_clicked_elements: Array<{ selector: string; clicks: number }>;
}

export interface PredictiveInsight {
  user_id: string;
  score: number;
  factors: string[];
  recommended_action: string;
}

export interface AnalyticsSummary {
  active_users: number;
  conversion_rate: number;
  avg_session_duration: number;
  top_pages: Array<{ url: string; views: number }>;
}

export class AdvancedAnalytics {
  private funnelData: Map<string, FunnelAnalytics[]> = new Map();
  private heatmapData: Map<string, HeatmapData> = new Map();
  private sessionData: Map<string, SessionRecording> = new Map();
  private isInitialized = false;

  constructor() {
    this.initializeTracking();
  }

  private initializeTracking() {
    if (this.isInitialized) return;
    
    try {
      // Track page views
      trackEvent('page_view', {
        page_url: window.location.pathname,
        timestamp: Date.now()
      });

      this.isInitialized = true;
    } catch (error) {
      console.warn('[AdvancedAnalytics] Initialization failed:', error);
    }
  }

  async trackFunnelStep(data: Omit<FunnelAnalytics, 'timestamp'>) {
    const funnelStep: FunnelAnalytics = {
      ...data,
      timestamp: Date.now()
    };

    // Store locally
    const existing = this.funnelData.get(data.funnel_id) || [];
    existing.push(funnelStep);
    this.funnelData.set(data.funnel_id, existing);

    // Track in analytics
    trackEvent('funnel_step', {
      funnel_id: data.funnel_id,
      step_id: data.step_id,
      completed: data.completed
    });

    // Save to Supabase if available
    const supabase = getSupabase();
    if (supabase) {
      try {
        await supabase
          .from('funnel_analytics')
          .insert([funnelStep]);
      } catch (error) {
        console.warn('[AdvancedAnalytics] Failed to save funnel data:', error);
      }
    }
  }

  trackHeatmapEvent(selector: string, eventType: 'click' | 'hover', metadata: Record<string, any> = {}) {
    const key = `${window.location.pathname}_${selector}`;
    const existing = this.heatmapData.get(key) || {
      page_url: window.location.pathname,
      element_selector: selector,
      click_count: 0,
      hover_count: 0,
      scroll_depth: 0,
      viewport_size: `${window.innerWidth}x${window.innerHeight}`,
      device_type: this.getDeviceType(),
      timestamp: Date.now(),
      session_id: this.getSessionId(),
      user_id: undefined
    };

    if (eventType === 'click') {
      existing.click_count++;
    } else if (eventType === 'hover') {
      existing.hover_count++;
    }

    this.heatmapData.set(key, existing);

    // Track in analytics
    trackEvent('heatmap_event', {
      element: selector,
      event_type: eventType,
      page: window.location.pathname
    });
  }

  async saveBatch() {
    const supabase = getSupabase();
    if (!supabase) return;

    try {
      // Save funnel data
      const funnelArray = Array.from(this.funnelData.values()).flat();
      if (funnelArray.length > 0) {
        await supabase
          .from('funnel_analytics')
          .insert(funnelArray);
      }

      // Save heatmap data
      const heatmapArray = Array.from(this.heatmapData.values());
      if (heatmapArray.length > 0) {
        await supabase
          .from('heatmap_data')
          .insert(heatmapArray);
      }

      // Clear local data after successful save
      this.funnelData.clear();
      this.heatmapData.clear();
    } catch (error) {
      console.warn('[AdvancedAnalytics] Batch save failed:', error);
    }
  }

  async generatePredictiveModel(userId: string): Promise<PredictiveModel | null> {
    const supabase = getSupabase();
    if (!supabase) return null;

    try {
      // Get user behavior data
      const { data: behaviorData } = await supabase
        .from('onboarding_behavior_analytics')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(100);

      if (!behaviorData || behaviorData.length === 0) {
        return null;
      }

      // Simple predictive model based on behavior patterns
      const avgConfidence = behaviorData.reduce((sum, item) => sum + (item.confidence_score || 0.5), 0) / behaviorData.length;
      const avgHesitation = behaviorData.reduce((sum, item) => sum + (item.hesitation_time || 0), 0) / behaviorData.length;

      const model: PredictiveModel = {
        user_id: userId,
        churn_probability: Math.max(0, Math.min(1, avgHesitation / 10000)), // Normalize hesitation
        purchase_probability: avgConfidence,
        engagement_score: Math.max(0, Math.min(1, 1 - (avgHesitation / 5000))),
        style_confidence: avgConfidence,
        predicted_ltv: avgConfidence * 100, // Simple LTV calculation
        risk_factors: avgHesitation > 3000 ? ['high_hesitation'] : [],
        opportunities: avgConfidence > 0.7 ? ['upsell_premium'] : ['improve_onboarding'],
        next_best_action: avgConfidence > 0.7 ? 'show_premium_features' : 'provide_style_guidance',
        model_version: '1.0',
        calculated_at: Date.now()
      };

      // Save model
      await supabase
        .from('predictive_models')
        .insert([model]);

      return model;
    } catch (error) {
      console.warn('[AdvancedAnalytics] Predictive model generation failed:', error);
      return null;
    }
  }

  async getFunnelMetrics(funnelId: string): Promise<FunnelMetrics> {
    const supabase = getSupabase();
    if (!supabase) {
      return {
        total_entries: 0,
        completion_rate: 0,
        avg_time_to_complete: 0,
        drop_off_points: []
      };
    }

    try {
      const { data } = await supabase
        .from('funnel_analytics')
        .select('*')
        .eq('funnel_id', funnelId);

      if (!data || data.length === 0) {
        return {
          total_entries: 0,
          completion_rate: 0,
          avg_time_to_complete: 0,
          drop_off_points: []
        };
      }

      const totalEntries = new Set(data.map(d => d.session_id)).size;
      const completedSessions = new Set(
        data.filter(d => d.completed).map(d => d.session_id)
      ).size;

      return {
        total_entries: totalEntries,
        completion_rate: totalEntries > 0 ? completedSessions / totalEntries : 0,
        avg_time_to_complete: data.reduce((sum, d) => sum + d.time_spent, 0) / data.length,
        drop_off_points: []
      };
    } catch (error) {
      console.warn('[AdvancedAnalytics] Failed to get funnel metrics:', error);
      return {
        total_entries: 0,
        completion_rate: 0,
        avg_time_to_complete: 0,
        drop_off_points: []
      };
    }
  }

  async getHeatmapSummary(pageUrl: string): Promise<HeatmapSummary> {
    const supabase = getSupabase();
    if (!supabase) {
      return {
        page_url: pageUrl,
        total_sessions: 0,
        avg_scroll_depth: 0,
        top_clicked_elements: []
      };
    }

    try {
      const { data } = await supabase
        .from('heatmap_data')
        .select('*')
        .eq('page_url', pageUrl);

      if (!data || data.length === 0) {
        return {
          page_url: pageUrl,
          total_sessions: 0,
          avg_scroll_depth: 0,
          top_clicked_elements: []
        };
      }

      return {
        page_url: pageUrl,
        total_sessions: new Set(data.map(d => d.session_id)).size,
        avg_scroll_depth: data.reduce((sum, d) => sum + d.scroll_depth, 0) / data.length,
        top_clicked_elements: data
          .sort((a, b) => b.click_count - a.click_count)
          .slice(0, 10)
          .map(d => ({ selector: d.element_selector, clicks: d.click_count }))
      };
    } catch (error) {
      console.warn('[AdvancedAnalytics] Failed to get heatmap summary:', error);
      return {
        page_url: pageUrl,
        total_sessions: 0,
        avg_scroll_depth: 0,
        top_clicked_elements: []
      };
    }
  }

  async getPredictiveInsights(): Promise<{
    churn_risk: PredictiveInsight[];
    high_value_users: PredictiveInsight[];
    conversion_opportunities: PredictiveInsight[];
  }> {
    const supabase = getSupabase();
    if (!supabase) {
      return {
        churn_risk: [],
        high_value_users: [],
        conversion_opportunities: []
      };
    }

    try {
      const { data } = await supabase
        .from('predictive_models')
        .select('*')
        .order('calculated_at', { ascending: false });

      if (!data || data.length === 0) {
        return {
          churn_risk: [],
          high_value_users: [],
          conversion_opportunities: []
        };
      }

      return {
        churn_risk: [],
        high_value_users: [],
        conversion_opportunities: []
      };
    } catch (error) {
      console.warn('[AdvancedAnalytics] Failed to get predictive insights:', error);
      return {
        churn_risk: [],
        high_value_users: [],
        conversion_opportunities: []
      };
    }
  }

  async getAnalyticsSummary(): Promise<AnalyticsSummary> {
    const supabase = getSupabase();
    if (!supabase) {
      return {
        active_users: 0,
        conversion_rate: 0,
        avg_session_duration: 0,
        top_pages: []
      };
    }

    try {
      const { data } = await supabase
        .from('analytics_events')
        .select('*')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      if (!data || data.length === 0) {
        return {
          active_users: 0,
          conversion_rate: 0,
          avg_session_duration: 0,
          top_pages: []
        };
      }

      return {
        active_users: new Set(data.map(d => d.user_id).filter(Boolean)).size,
        conversion_rate: 0,
        avg_session_duration: 0,
        top_pages: []
      };
    } catch (error) {
      console.warn('[AdvancedAnalytics] Failed to get analytics summary:', error);
      return {
        active_users: 0,
        conversion_rate: 0,
        avg_session_duration: 0,
        top_pages: []
      };
    }
  }

  private getDeviceType(): string {
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }

  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('fitfi_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('fitfi_session_id', sessionId);
    }
    return sessionId;
  }
}

// Export singleton instance
export const advancedAnalytics = new AdvancedAnalytics();