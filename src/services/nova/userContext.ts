export interface UserContext {
  userId?: string;
  styleProfile?: any;
  preferences?: any;
}

export function buildUserContext(user: any): UserContext {
  return {
    userId: user?.id,
    styleProfile: user?.styleProfile,
    preferences: user?.preferences
  };
}
