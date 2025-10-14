export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  type: 'style_explorer' | 'color_master' | 'completion_speed' | 'social_sharer' | 'perfectionist';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  condition: (answers: any, metadata?: any) => boolean;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  achievement_type: string;
  earned_at: string;
  metadata: Record<string, any>;
}

export interface ABTestVariant {
  id: string;
  user_id: string;
  test_name: string;
  variant: 'control' | 'variant_a' | 'variant_b';
  assigned_at: string;
  converted: boolean;
  conversion_data: Record<string, any>;
}

export interface SocialShareData {
  achievement: Achievement;
  userProfile: {
    name: string;
    styleType: string;
    matchPercentage: number;
  };
  shareText: string;
  shareUrl: string;
}