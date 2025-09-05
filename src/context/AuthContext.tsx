import React from "react";

export interface AuthState {
  uid: string | null;
  tier: "visitor" | "member" | "plus" | "founder";
}
const defaultState: AuthState = { uid: null, tier: "visitor" };

export const AuthContext = React.createContext<AuthState>(defaultState);
export default function AuthProvider({ children }: { children: React.ReactNode }) {
  return <AuthContext.Provider value={defaultState}>{children}</AuthContext.Provider>;
}