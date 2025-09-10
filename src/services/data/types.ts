// src/services/data/types.ts
export type ID = string;
export type DataSource = 'supabase' | 'local' | 'fallback';

export type DataResponse<T> = {
  data: T;
  source: DataSource;
  cached: boolean;
  error?: string;
  errors?: string[];
};

export type FitFiUserProfile = {
  id: ID;
  name?: string;
  email?: string;
  gender?: 'male' | 'female';
};

export type BoltProduct = {
  id: ID;
  title: string;
  name?: string;
  brand?: string;
  price?: number;
  original_price?: number;
  imageUrl?: string;
  image?: string;
  retailer?: string;
  url?: string;
  category?: string;
  description?: string;
  sizes?: string[];
  colors?: string[];
  in_stock?: boolean;
  rating?: number;
  review_count?: number;
  tags?: string[];
};

export type Outfit = {
  id: ID;
  title?: string;
  image?: string;
  products?: BoltProduct[];
  match?: number;
  priceMin?: number;
  priceMax?: number;
  tags?: string[];
  season?: string;
};

export type Tribe = {
  id: ID;
  name: string;
  slug?: string;
  description?: string;
  cover_img?: string;
  member_count?: number;
  is_member?: boolean;
  user_role?: 'member' | 'moderator' | 'owner' | null;
  created_at?: string;
};

export type TribePost = {
  id: ID;
  tribeId?: ID;
  tribe_id?: ID;
  authorId?: ID;
  userId?: ID;
  user_id?: ID;
  content?: string;
  body?: string;
  image_url?: string;
  outfit_id?: ID;
  createdAt?: string;
  created_at?: string;
  likes_count?: number;
  comments_count?: number;
};

export type TribeMember = {
  id: ID;
  tribeId?: ID;
  tribe_id?: ID;
  userId?: ID;
  user_id?: ID;
  role?: 'member' | 'moderator' | 'owner' | 'admin' | null;
};

export type TribeChallenge = {
  id: ID;
  tribeId?: ID;
  tribe_id?: ID;
  title: string;
  description?: string;
  rules?: string[];
  starts_at?: string;
  ends_at?: string;
};

export type TribeChallengeSubmission = {
  id: ID;
  challengeId?: ID;
  challenge_id?: ID;
  userId?: ID;
  user_id?: ID;
  image?: string;
  createdAt?: string;
  created_at?: string;
  score?: number;
};

export type TribeRanking = {
  tribeId?: ID;
  tribe_id?: ID;
  userId?: ID;
  user_id?: ID;
  score: number;
};

export type UserStats = {
  user_id?: string;
  level: number;
  xp: number;
  updated_at: string;
  last_active: string;
  posts?: number;
  submissions?: number;
};

export type UserStreak = {
  user_id?: string;
  current_streak: number;
  longest_streak: number;
  last_check_date: string;
};

export type Referral = {
  inviter_id: string;
  invitee_email?: string;
  created_at?: string;
};

export type ReferralRow = {
  id: ID;
  inviter_id?: ID;
  inviterId?: ID;
  invited_id?: ID;
  invitedId?: ID;
  created_at?: string;
  createdAt?: string;
};

export type NotificationItem = {
  id: ID;
  title: string;
  body?: string;
  created_at?: string;
  createdAt?: string;
};