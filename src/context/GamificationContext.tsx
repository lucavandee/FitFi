import React from "react";
export interface GamificationState { points: number; level: number; }
const defaultState: GamificationState = { points: 0, level: 1 };
export const GamificationContext = React.createContext<GamificationState>(defaultState);
export default function GamificationProvider({ children }: { children: React.ReactNode }) {
  return <GamificationContext.Provider value={defaultState}>{children}</GamificationContext.Provider>;
}