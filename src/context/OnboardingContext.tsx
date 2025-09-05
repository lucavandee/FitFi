import React from "react";
export interface OnboardingState { completed: boolean; answers: Record<string, unknown>; }
const defaultState: OnboardingState = { completed: false, answers: {} };
export const OnboardingContext = React.createContext<OnboardingState>(defaultState);
export default function OnboardingProvider({ children }: { children: React.ReactNode }) {
  return <OnboardingContext.Provider value={defaultState}>{children}</OnboardingContext.Provider>;
}