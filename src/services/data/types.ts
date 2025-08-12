// src/services/data/types.ts
export interface ImageVariant {
  url: string;
  alt?: string;
}

export interface BoltProduct {
  id: string;
  title: string;
  brand?: string;
  gender?: "male" | "female" | "unisex";
  category: string;
  price?: number;
  currency?: string;
  images?: ImageVariant[];
  productUrl?: string;
  provider?: "amazon" | "zalando" | "generic";
  tags?: string[]; // seizoens/archetype tags (toekomst)
}

export type OutfitRole = "top" | "bottom" | "footwear" | "accessory" | "outerwear";

export interface OutfitItemRef {
  productId: string;
  role: OutfitRole;
}

export interface Outfit {
  id: string;
  name: string;
  items: OutfitItemRef[];
  season?: "spring" | "summer" | "autumn" | "winter" | "all";
  archetypes?: string[];
  score?: number; // match score
  explanation?: string; // AI-uitleg
}

export interface FitFiUserProfile {
  id: string;
  name?: string;
  email?: string;
  gender?: "male" | "female" | "unisex";
  archetypes?: string[];
  preferences?: Record<string, unknown>;
}

/**
 * Data source response wrapper
 */
export interface DataResponse<T> {
  data: T;
  source: 'supabase' | 'local' | 'fallback';
  cached: boolean;
  timestamp: number;
  errors?: string[];
}

/**
 * Cache entry interface
 */
export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  source: 'supabase' | 'local' | 'fallback';
  ttl: number;
}

/**
 * Data service configuration
 */
export interface DataServiceConfig {
  cacheTTL: number;
  maxCacheSize: number;
  enableFallbacks: boolean;
  logErrors: boolean;
  retryAttempts: number;
  retryDelay: number;
}

/**
 * Error context for debugging
 */
export interface DataError {
  source: 'supabase' | 'local' | 'fallback';
  operation: string;
  error: string;
  timestamp: number;
  context?: Record<string, any>;
}

/**
 * Query filters for data fetching
 */
export interface ProductFilters {
  gender?: "male" | "female" | "unisex";
  category?: string;
  archetype?: string;
  priceRange?: [number, number];
  tags?: string[];
  season?: "spring" | "summer" | "autumn" | "winter" | "all";
  limit?: number;
  offset?: number;
}

export interface OutfitFilters {
  archetype?: string;
  season?: "spring" | "summer" | "autumn" | "winter" | "all";
  occasion?: string;
  minScore?: number;
  limit?: number;
  offset?: number;
}

export interface UserFilters {
  gender?: "male" | "female" | "unisex";
  isPremium?: boolean;
  hasCompletedQuiz?: boolean;
  limit?: number;
  offset?: number;
}

/**
 * Affiliate link configuration
 */
export interface AffiliateConfig {
  provider: "amazon" | "zalando" | "generic";
  trackingId?: string;
  customParams?: Record<string, string>;
  campaignOverride?: string;
}

/**
 * Enhanced product with affiliate data
 */
export interface EnhancedBoltProduct extends BoltProduct {
  affiliateUrl?: string;
  originalUrl?: string;
  affiliateProvider?: "amazon" | "zalando" | "generic";
  trackingParams?: Record<string, string>;
}

/**
 * Data service statistics
 */
export interface DataServiceStats {
  cacheHits: number;
  cacheMisses: number;
  supabaseQueries: number;
  localFileLoads: number;
  fallbackUsage: number;
  errorCount: number;
  averageResponseTime: number;
  lastUpdated: number;
}

/**
 * Tribe interface for community features
 */
export interface Tribe {
  id: string;
  name: string;
  slug: string;
  description: string;
  cover_img?: string;
  member_count: number;
  created_by: string;
  created_at: string;
  updated_at: string;
  is_member?: boolean;
  user_role?: 'member' | 'moderator' | 'owner';
  archetype?: string;
  activity_level?: 'low' | 'medium' | 'high' | 'very_high';
  featured?: boolean;
  tags?: string[];
  rules?: string[];
  recent_posts?: TribePost[];
}

/**
 * Tribe post interface
 */
export interface TribePost {
  id: string;
  tribe_id?: string;
  user_id?: string;
  user_name?: string;
  content: string;
  image_url?: string;
  outfit_id?: string;
  likes_count: number;
  comments_count?: number;
  created_at: string;
  updated_at?: string;
  user_profile?: {
    full_name: string;
    avatar_url?: string;
  };
  outfit?: {
    id: string;
    title: string;
    image_url?: string;
    match_percentage: number;
  };
  is_liked_by_current_user?: boolean;
  recent_comments?: TribePostComment[];
}

/**
 * Tribe post comment interface
 */
export interface TribePostComment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user_profile?: {
    full_name: string;
    avatar_url?: string;
  };
}

/**
 * Tribe member interface
 */
export interface TribeMember {
  id: string;
  tribe_id: string;
  user_id: string;
  role: 'member' | 'moderator' | 'owner';
  joined_at: string;
  user_profile?: {
    full_name: string;
    avatar_url?: string;
  };
}

/**
 * Create tribe data interface
 */
export interface CreateTribeData {
  name: string;
  slug: string;
  description: string;
  cover_img?: string;
  archetype?: string;
  tags?: string[];
  rules?: string[];
}

/**
 * Create post data interface
 */
export interface CreatePostData {
  tribe_id: string;
  content: string;
  image_url?: string;
  outfit_id?: string;
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
  source: 'supabase' | 'local' | 'fallback';
  cached: boolean;
}

/**
 * Search query interface
 */
export interface SearchQuery {
  term: string;
  filters?: ProductFilters | OutfitFilters | UserFilters;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  fuzzy?: boolean;
}

/**
 * Search result interface
 */
export interface SearchResult<T> {
  items: T[];
  total: number;
  query: SearchQuery;
  suggestions?: string[];
  facets?: Record<string, Array<{ value: string; count: number }>>;
}

/**
 * Data validation result
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  sanitized?: any;
}

/**
 * Batch operation result
 */
export interface BatchResult<T> {
  successful: T[];
  failed: Array<{ item: any; error: string }>;
  total: number;
  successRate: number;
}

/**
 * Health check result
 */
export interface HealthCheck {
  service: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime: number;
  lastChecked: number;
  details?: Record<string, any>;
}

/**
 * Data sync status
 */
export interface SyncStatus {
  lastSync: number;
  nextSync: number;
  inProgress: boolean;
  errors: string[];
  itemsProcessed: number;
  totalItems: number;
}