/**
 * Data service types for FitFi
 */

export interface DataResponse<T> {
  data: T;
  source: 'supabase' | 'local' | 'fallback';
  cached: boolean;
  errors?: string[];
}

export interface BoltProduct {
  id: string;
  title: string;
  brand?: string;
  imageUrl?: string;
  type?: string;
  styleTags?: string[];
  affiliateUrl?: string;
  season?: string;
  provider?: string;
  gender?: "male" | "female" | "unisex";
  category: string;
  price?: number;
  currency?: string;
  images?: ImageVariant[];
  productUrl?: string;
  tags?: string[]; // seizoens/archetype tags (toekomst)
}

export interface ImageVariant {
  url: string;
  width?: number;
  height?: number;
  alt?: string;
}

export interface Outfit {
  id: string;
  name: string;
  description?: string;
  image?: string;
  tags?: string[];
  archetype?: string;
  season?: string;
  occasions?: string[];
  priceMin?: number;
  priceMax?: number;
  items?: OutfitItem[];
  matchPercentage?: number;
}

export interface OutfitItem {
  id: string;
  name: string;
  brand?: string;
  price?: number;
  imageUrl?: string;
  affiliateUrl?: string;
  category?: string;
}

export interface FitFiUserProfile {
  id: string;
  name?: string;
  email?: string;
  gender?: 'male' | 'female';
  archetypes?: string[];
  preferences?: {
    casual: number;
    formal: number;
    sporty: number;
    vintage: number;
    minimalist: number;
  };
  isPremium?: boolean;
  savedRecommendations?: string[];
}

export interface Tribe {
  id: string;
  name: string;
  slug: string;
  description: string;
  cover_img?: string;
  member_count: number;
  created_by?: string;
  created_at: string;
  updated_at?: string;
  is_member?: boolean;
  user_role?: 'member' | 'moderator' | 'owner' | null;
  archetype?: string;
  activity_level?: 'low' | 'medium' | 'high' | 'very_high';
  featured?: boolean;
  tags?: string[];
  rules?: string[];
  recent_posts?: TribePost[];
}

export interface TribePost {
  id: string;
  tribe_id: string;
  user_id: string;
  content: string;
  image_url?: string;
  outfit_id?: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
  authorName?: string;
  authorId: string;
  likes?: number;
  commentsCount?: number;
}

export interface TribeMember {
  id: string;
  tribe_id: string;
  user_id: string;
  role: 'member' | 'moderator' | 'owner';
  joined_at: string;
  user_profile?: {
    full_name?: string;
    avatar_url?: string;
  };
}

export interface TribeChallenge {
  id: string;
  tribeId: string;
  title: string;
  description?: string;
  image?: string;
  rules?: string[];
  rewardPoints?: number;
  winnerRewardPoints?: number;
  startAt?: string;
  endAt?: string;
  status: "draft" | "open" | "closed" | "archived";
  tags?: string[];
  difficulty?: "easy" | "medium" | "hard";
  createdAt: string;
  createdBy?: string;
}

export interface TribeChallengeSubmission {
  id: string;
  tribeId: string;
  challengeId: string;
  userId: string;
  userName?: string;
  content?: string;
  imageUrl?: string;
  linkUrl?: string;
  score?: number;
  isWinner: boolean;
  submissionType?: 'text' | 'image' | 'link' | 'combo';
  createdAt: string;
}

export interface TribeRanking {
  tribeId: string;
  points: number;
  rank: number;
  updatedAt: string;
}

// Dashboard types
export interface UserStats {
  user_id: string;
  level: number;
  xp: number;
  posts?: number;
  submissions?: number;
  wins?: number;
  invites?: number;
  last_active?: string;
  updated_at?: string;
}

export interface UserStreak {
  user_id: string;
  current_streak: number;
  longest_streak?: number;
  last_check_date: string;
}

export interface Referral {
  id: string;
  inviter_id: string;
  invitee_email?: string | null;
  status: "pending" | "joined" | "converted";
  created_at: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  body?: string;
  link?: string;
  read?: boolean;
  created_at: string;
}