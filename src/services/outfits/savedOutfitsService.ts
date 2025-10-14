import { supabase } from "@/lib/supabaseClient";
import type { Outfit } from "@/engine/types";
import { track } from "@/utils/telemetry";

export interface SavedOutfit {
  id: string;
  user_id: string;
  outfit_id: string;
  outfit_json: Outfit;
  created_at: string;
}

class SavedOutfitsService {
  async getSavedOutfits(userId: string): Promise<SavedOutfit[]> {
    const client = supabase();
    if (!client) {
      console.warn('[SavedOutfits] No Supabase client');
      return [];
    }

    try {
      const { data, error } = await client
        .from('saved_outfits')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[SavedOutfits] Error fetching:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('[SavedOutfits] Exception:', error);
      return [];
    }
  }

  async saveOutfit(
    userId: string,
    outfit: Outfit,
    idempotencyKey?: string
  ): Promise<{ success: boolean; error?: string }> {
    const client = supabase();
    if (!client) {
      return { success: false, error: 'No Supabase client available' };
    }

    try {
      const { error } = await client.from('saved_outfits').insert({
        user_id: userId,
        outfit_id: outfit.id,
        outfit_json: outfit as any,
        idempotency_key: idempotencyKey || `${userId}:${outfit.id}:${Date.now()}`,
      });

      if (error) {
        if (/duplicate key|already exists/i.test(error.message)) {
          return { success: true };
        }
        console.error('[SavedOutfits] Error saving:', error);
        return { success: false, error: error.message };
      }

      track('outfit_saved', { outfit_id: outfit.id });
      return { success: true };
    } catch (error) {
      console.error('[SavedOutfits] Exception saving:', error);
      return { success: false, error: String(error) };
    }
  }

  async unsaveOutfit(
    userId: string,
    outfitId: string
  ): Promise<{ success: boolean; error?: string }> {
    const client = supabase();
    if (!client) {
      return { success: false, error: 'No Supabase client available' };
    }

    try {
      const { error } = await client
        .from('saved_outfits')
        .delete()
        .eq('user_id', userId)
        .eq('outfit_id', outfitId);

      if (error) {
        console.error('[SavedOutfits] Error unsaving:', error);
        return { success: false, error: error.message };
      }

      track('outfit_unsaved', { outfit_id: outfitId });
      return { success: true };
    } catch (error) {
      console.error('[SavedOutfits] Exception unsaving:', error);
      return { success: false, error: String(error) };
    }
  }

  async isOutfitSaved(userId: string, outfitId: string): Promise<boolean> {
    const client = supabase();
    if (!client) return false;

    try {
      const { data, error } = await client
        .from('saved_outfits')
        .select('id')
        .eq('user_id', userId)
        .eq('outfit_id', outfitId)
        .maybeSingle();

      if (error) {
        console.error('[SavedOutfits] Error checking:', error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error('[SavedOutfits] Exception checking:', error);
      return false;
    }
  }

  async getSavedOutfitCount(userId: string): Promise<number> {
    const client = supabase();
    if (!client) return 0;

    try {
      const { count, error } = await client
        .from('saved_outfits')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (error) {
        console.error('[SavedOutfits] Error counting:', error);
        return 0;
      }

      return count || 0;
    } catch (error) {
      console.error('[SavedOutfits] Exception counting:', error);
      return 0;
    }
  }
}

export const savedOutfitsService = new SavedOutfitsService();
