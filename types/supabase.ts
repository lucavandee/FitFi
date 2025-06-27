export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          name: string
          email: string
          gender: string | null
          created_at: string
          updated_at: string
          is_premium: boolean
        }
        Insert: {
          id?: string
          name: string
          email: string
          gender?: string | null
          created_at?: string
          updated_at?: string
          is_premium?: boolean
        }
        Update: {
          id?: string
          name?: string
          email?: string
          gender?: string | null
          created_at?: string
          updated_at?: string
          is_premium?: boolean
        }
      }
      style_preferences: {
        Row: {
          id: string
          user_id: string
          casual: number
          formal: number
          sporty: number
          vintage: number
          minimalist: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          casual?: number
          formal?: number
          sporty?: number
          vintage?: number
          minimalist?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          casual?: number
          formal?: number
          sporty?: number
          vintage?: number
          minimalist?: number
          created_at?: string
          updated_at?: string
        }
      }
      quiz_answers: {
        Row: {
          id: string
          user_id: string
          question_id: string
          answer: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          question_id: string
          answer: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          question_id?: string
          answer?: Json
          created_at?: string
          updated_at?: string
        }
      }
      outfits: {
        Row: {
          id: string
          title: string
          description: string | null
          match_percentage: number
          imageUrl: string | null
          tags: string[] | null
          occasions: string[] | null
          explanation: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          match_percentage?: number
          imageUrl?: string | null
          tags?: string[] | null
          occasions?: string[] | null
          explanation?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          match_percentage?: number
          imageUrl?: string | null
          tags?: string[] | null
          occasions?: string | null
          explanation?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      outfit_items: {
        Row: {
          id: string
          outfit_id: string
          name: string
          brand: string | null
          price: number
          imageUrl: string | null
          url: string | null
          retailer: string | null
          category: string | null
          created_at: string
        }
        Insert: {
          id?: string
          outfit_id: string
          name: string
          brand?: string | null
          price: number
          imageUrl?: string | null
          url?: string | null
          retailer?: string | null
          category?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          outfit_id?: string
          name?: string
          brand?: string | null
          price?: number
          imageUrl?: string | null
          url?: string | null
          retailer?: string | null
          category?: string | null
          created_at?: string
        }
      }
      saved_outfits: {
        Row: {
          id: string
          user_id: string
          outfit_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          outfit_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          outfit_id?: string
          created_at?: string
        }
      }
      products: {
        Row: {
          id: string
          name: string
          brand: string | null
          price: number
          original_price: number | null
          imageUrl: string | null
          retailer: string | null
          url: string | null
          category: string | null
          description: string | null
          sizes: string[] | null
          colors: string[] | null
          in_stock: boolean
          rating: number | null
          review_count: number | null
          tags: string[] | null
          created_at: string
          updated_at: string
          archetype: string | null
        }
        Insert: {
          id?: string
          name: string
          brand?: string | null
          price: number
          original_price?: number | null
          imageUrl?: string | null
          retailer?: string | null
          url?: string | null
          category?: string | null
          description?: string | null
          sizes?: string[] | null
          colors?: string[] | null
          in_stock?: boolean
          rating?: number | null
          review_count?: number | null
          tags?: string[] | null
          created_at?: string
          updated_at?: string
          archetype?: string | null
        }
        Update: {
          id?: string
          name?: string
          brand?: string | null
          price?: number
          original_price?: number | null
          imageUrl?: string | null
          retailer?: string | null
          url?: string | null
          category?: string | null
          description?: string | null
          sizes?: string[] | null
          colors?: string[] | null
          in_stock?: boolean
          rating?: number | null
          review_count?: number | null
          tags?: string[] | null
          created_at?: string
          updated_at?: string
          archetype?: string | null
        }
      }
      user_gamification: {
        Row: {
          id: string
          user_id: string
          points: number
          level: string
          badges: string[] | null
          streak: number
          last_check_in: string | null
          completed_challenges: string[] | null
          total_referrals: number
          created_at: string
          updated_at: string
          seasonal_event_progress: Json | null
        }
        Insert: {
          id?: string
          user_id: string
          points?: number
          level?: string
          badges?: string[] | null
          streak?: number
          last_check_in?: string | null
          completed_challenges?: string[] | null
          total_referrals?: number
          created_at?: string
          updated_at?: string
          seasonal_event_progress?: Json | null
        }
        Update: {
          id?: string
          user_id?: string
          points?: number
          level?: string
          badges?: string[] | null
          streak?: number
          last_check_in?: string | null
          completed_challenges?: string[] | null
          total_referrals?: number
          created_at?: string
          updated_at?: string
          seasonal_event_progress?: Json | null
        }
      }
      daily_challenges: {
        Row: {
          id: string
          user_id: string
          challenge_id: string
          completed: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          challenge_id: string
          completed?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          challenge_id?: string
          completed?: boolean
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}