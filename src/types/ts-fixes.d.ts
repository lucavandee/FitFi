// Globale React namespace hints voor sommige .d.ts die dat verwachten
import {} from "react";

// --- Module shims (laat build niet falen wanneer types/peer ontbreekt)
declare module "react-hot-toast" {
  const toast: any;
  export default toast;
}
declare module "react-router-dom" {
  export type NavigateFunction = (...args: any[]) => void;
  export const useNavigate: () => NavigateFunction;
  export const Link: any;
  export const NavLink: any;
  export const Outlet: any;
  export const Route: any;
  export const Routes: any;
}

// --- Domein types (optioneel – velden die vaak als snake_case vs camelCase voorkomen)
type ID = string;

export interface Tribe {
  id?: ID;
  name?: string;
  description?: string;
  cover_img?: string;
  member_count?: number;
  is_member?: boolean;
  user_role?: "member" | "moderator" | "owner" | "admin";
}

export interface TribeMember {
  id: ID;
  tribeId?: ID;   // camelCase
  tribe_id?: ID;  // snake_case
  userId?: ID;
  user_id?: ID;
  role?: "member" | "moderator" | "owner" | "admin";
  joined_at?: string;
}

export interface TribePost {
  id: ID;
  tribeId?: ID;
  tribe_id?: ID;
  user_id?: ID;
  content?: string;
  image_url?: string;
  created_at?: string;
  likes_count?: number;
  comments_count?: number;
}

// Quiz mocks (tot echte implementatie er is)
declare const mockQuizData: { steps: any[] };

// Externe .d.ts die soms dubbel gedeclareerd worden – voorkom conflicts
declare module "../config/profile-mapping.js" {
  export const DUTCH_ARCHETYPES: any;
  export function mapAnswersToArchetype(...args: any[]): any;
}