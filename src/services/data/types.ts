export type UserStats = {
  level: number;
  xp: number;
  updated_at: string;
  last_active: string;
  user_id?: string; // optioneel toegevoegd voor lokale opslag helpers
};

export type UserStreak = {
  current_streak: number;
  longest_streak: number;
  last_check_date: string;
  user_id?: string; // idem
};

export type Referral = {
  inviter_id: string;
  invitee_email?: string;
  created_at?: string;
};

export type NotificationItem = {
  id: string;
  title: string;
  body?: string;
  created_at: string;
};