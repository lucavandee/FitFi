declare module '@/components/Dashboard/NovaInsightCard' {
  import * as React from 'react';
  export const NovaInsightCard: React.FC<any>;
  export default NovaInsightCard;
}

declare module '@/components/Dashboard/GamificationPanel' {
  import * as React from 'react';
  export const GamificationPanel: React.FC<any>;
  export default GamificationPanel;
}

declare module '@/components/analytics/HeatmapViewer' {
  import * as React from 'react';
  export const HeatmapViewer: React.FC<any>;
  export default HeatmapViewer;
}

declare module '@/services/data/types' {
  // Minimale compat types om compile te laten slagen
  export type ID = string;
  export type Season = 'spring'|'summer'|'autumn'|'winter';
  export type DataResponse<T=any> = { data: T; error?: string | null; source: 'supabase'|'local'|'fallback'; cached: boolean; errors?: string[] };
  export type FitFiUserProfile = { id: ID; name?: string; email?: string; };
  export type Outfit = { id: ID; title?: string; image?: string; priceMin?: number; priceMax?: number; };
  export type Tribe = { id: ID; name: string; slug?: string };
  export type TribePost = { id: ID; tribeId: ID; authorId: ID; body?: string; createdAt?: string };
  export type TribeMember = { id: ID; tribeId: ID; userId: ID; role?: 'member'|'admin' };
  export type TribeChallenge = { id: ID; tribeId: ID; title: string; description?: string; rules?: string[] };
  export type TribeChallengeSubmission = { id: ID; challengeId: ID; userId: ID; image?: string; createdAt?: string };
  export type TribeRanking = { tribeId: ID; userId: ID; score: number };
  export type UserStats = { level: number; xp: number; posts?: number; submissions?: number };
  export type UserStreak = { current_streak: number };
  export type ReferralRow = { id: ID; inviterId?: ID; invitedId?: ID; createdAt?: string };
  export type NotificationItem = { id: ID; title: string; body?: string; createdAt?: string };
  export type BoltProduct = { id: ID; title: string; brand?: string; imageUrl?: string; type?: string; category: string; price?: number; };
}