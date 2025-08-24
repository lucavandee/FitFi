/**
 * Advanced Analytics Types
 * Comprehensive types for funnel tracking, heatmaps, and predictive analytics
 */

export interface FunnelStep {
  id: string;
  name: string;
  page: string;
  event: string;
  required: boolean;
  order: number;
}

export interface FunnelAnalytics {
  funnel_id: string;
  user_id: string;
  session_id: string;
  step_id: string;
  step_name: string;
  completed: boolean;
  timestamp: number;
  time_spent: number;
  exit_point?: boolean;
  conversion_value?: number;
  metadata: Record<string, any>;
}

export interface HeatmapData {
  id: string;
  page_url: string;
  element_selector: string;
  click_count: number;
  hover_count: number;
  scroll_depth: number;
  viewport_size: string;
  device_type: "mobile" | "tablet" | "desktop";
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
  events: SessionEvent[];
  device_info: DeviceInfo;
  conversion_events: string[];
  exit_intent: boolean;
  rage_clicks: number;
  dead_clicks: number;
  timestamp: number;
}

export interface SessionEvent {
  type: "click" | "scroll" | "hover" | "input" | "navigation" | "error";
  timestamp: number;
  element: string;
  coordinates?: { x: number; y: number };
  value?: string;
  metadata?: Record<string, any>;
}

export interface DeviceInfo {
  userAgent: string;
  viewport: { width: number; height: number };
  screen: { width: number; height: number };
  deviceType: "mobile" | "tablet" | "desktop";
  browser: string;
  os: string;
}

export interface PredictiveModel {
  user_id: string;
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
  user_id: string;
  session_id: string;
  optimization_type:
    | "cta_placement"
    | "pricing_display"
    | "product_order"
    | "content_personalization";
  variant: string;
  confidence: number;
  expected_lift: number;
  applied_at: number;
  result?: "converted" | "abandoned" | "ongoing";
}

export interface AnalyticsDashboardData {
  funnels: {
    onboarding: FunnelMetrics;
    purchase: FunnelMetrics;
    engagement: FunnelMetrics;
  };
  heatmaps: {
    homepage: HeatmapSummary;
    quiz: HeatmapSummary;
    results: HeatmapSummary;
  };
  predictions: {
    churn_risk: PredictiveInsight[];
    high_value_users: PredictiveInsight[];
    conversion_opportunities: PredictiveInsight[];
  };
  realtime: {
    active_users: number;
    conversion_rate: number;
    avg_session_duration: number;
    bounce_rate: number;
  };
}

export interface FunnelMetrics {
  total_entries: number;
  completion_rate: number;
  drop_off_points: { step: string; rate: number }[];
  avg_completion_time: number;
  conversion_value: number;
}

export interface HeatmapSummary {
  page_url: string;
  total_sessions: number;
  avg_scroll_depth: number;
  top_clicked_elements: { element: string; clicks: number }[];
  dead_click_rate: number;
  rage_click_rate: number;
}

export interface PredictiveInsight {
  user_id: string;
  insight_type: string;
  confidence: number;
  recommended_action: string;
  potential_value: number;
  urgency: "low" | "medium" | "high" | "critical";
}
