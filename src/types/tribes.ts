/**
 * Style Tribes Community Types
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
}

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

export interface TribePost {
  id: string;
  tribe_id: string;
  user_id: string;
  outfit_id?: string;
  content: string;
  image_url?: string;
  likes_count: number;
  comments_count: number;
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
  first_like_user_id?: string;
  first_like_name?: string;
  first_like_avatar?: string;
  enrichments?: Record<string, any>;
  isOptimistic?: boolean;
  recent_comments?: TribePostComment[];
}

export interface TribePostLike {
  id: string;
  post_id: string;
  user_id: string;
  created_at: string;
}

export interface TribePostComment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  user_profile?: {
    full_name: string;
    avatar_url?: string;
  };
}

export interface CreateTribeData {
  name: string;
  slug: string;
  description: string;
  cover_img?: string;
}

export interface CreatePostData {
  tribe_id: string;
  content: string;
  image_url?: string;
  outfit_id?: string;
}

export interface FeatureFlag {
  flag_name: string;
  enabled: boolean;
  percentage: number;
  config: Record<string, any>;
}