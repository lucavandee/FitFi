import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';

// User stats interface
interface UserStats {
  level: number;
  xp: number;
  posts: number;
  submissions: number;
  wins: number;
  invites: number;
  last_active: string;
  updated_at: string;
}

// Current level interface
interface CurrentLevel {
  id: number;
  level_name: string;
  min_xp: number;
  max_xp: number | null;
  icon: string;
  color: string;
  perks: string[];
}

// Next level interface
interface NextLevel {
  id: number;
  level_name: string;
  min_xp: number;
  max_xp: number | null;
  icon: string;
  color: string;
  perks: string[];
}

interface GamificationState {
  points: number;
  level: string;
  badges: string[];
  streak: number;
  loading: boolean;
  error: string | null;
  userStats: UserStats | null;
  currentLevel: CurrentLevel | null;
  nextLevel: NextLevel | null;
}

type GamificationAction = 
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_POINTS'; payload: number }
  | { type: 'SET_LEVEL'; payload: string }
  | { type: 'SET_BADGES'; payload: string[] }
  | { type: 'SET_STREAK'; payload: number }
  | { type: 'SET_USER_STATS'; payload: UserStats | null }
  | { type: 'SET_CURRENT_LEVEL'; payload: CurrentLevel | null }
  | { type: 'SET_NEXT_LEVEL'; payload: NextLevel | null };

const initialState: GamificationState = {
  points: 0,
  level: 'beginner',
  badges: [],
  streak: 0,
  loading: false,
  error: null,
  userStats: null,
  currentLevel: null,
  nextLevel: null,
};

function gamificationReducer(state: GamificationState, action: GamificationAction): GamificationState {
  switch (action.type) {
    case 'SET_LOADING':
      return { /* placeholder removed */state, loading: action.payload };
    case 'SET_ERROR':
      return { /* placeholder removed */state, error: action.payload };
    case 'SET_POINTS':
      return { /* placeholder removed */state, points: action.payload };
    case 'SET_LEVEL':
      return { /* placeholder removed */state, level: action.payload };
    case 'SET_BADGES':
      return { /* placeholder removed */state, badges: action.payload };
    case 'SET_STREAK':
      return { /* placeholder removed */state, streak: action.payload };
    case 'SET_USER_STATS':
      return { /* placeholder removed */state, userStats: action.payload };
    case 'SET_CURRENT_LEVEL':
      return { /* placeholder removed */state, currentLevel: action.payload };
    case 'SET_NEXT_LEVEL':
      return { /* placeholder removed */state, nextLevel: action.payload };
    default:
      return state;
  }
}

const GamificationContext = createContext<{
  state: GamificationState;
  dispatch: React.Dispatch<GamificationAction>;
} | null>(null);

export function GamificationProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gamificationReducer, initialState);

  return (
    <GamificationContext.Provider value={{ state, dispatch }}>
      {children}
    </GamificationContext.Provider>
  );
}

export function useGamification() {
  const context = useContext(GamificationContext);
  if (!context) {
    throw new Error('useGamification must be used within a GamificationProvider');
  }
  return context.state;
}