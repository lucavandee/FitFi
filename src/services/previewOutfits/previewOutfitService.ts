import type { QuickOutfit } from '../visualPreferences/quickOutfitGenerator';

export interface SavedPreviewOutfit {
  id: string;
  user_id: string;
  session_id?: string;
  outfit_data: QuickOutfit;
  style_archetype: string;
  confidence: number;
  swipe_count: number;
  created_at: string;
}

export interface SavePreviewOutfitParams {
  userId: string;
  sessionId?: string;
  outfit: QuickOutfit;
  swipeCount: number;
}

export class PreviewOutfitService {
  private supabase: any;

  constructor() {
    this.initSupabase();
  }

  private async initSupabase() {
    try {
      const { getSupabase } = await import('@/lib/supabase');
      this.supabase = getSupabase();
    } catch (err) {
      console.error('Failed to initialize Supabase for PreviewOutfitService:', err);
    }
  }

  async ensureSupabase() {
    if (!this.supabase) {
      await this.initSupabase();
    }
    return this.supabase;
  }

  async savePreviewOutfit(params: SavePreviewOutfitParams): Promise<SavedPreviewOutfit | null> {
    const supabase = await this.ensureSupabase();

    if (!supabase) {
      console.error('Supabase not available');
      return null;
    }

    const { userId, sessionId, outfit, swipeCount } = params;

    const archetype = outfit.top?.style || outfit.bottom?.style || outfit.footwear?.style || 'unknown';

    const record = {
      user_id: userId,
      session_id: sessionId || null,
      outfit_data: outfit,
      style_archetype: archetype,
      confidence: outfit.confidence,
      swipe_count: swipeCount
    };

    console.log('💾 Saving preview outfit:', record);

    const { data, error } = await supabase
      .from('preview_outfits')
      .insert(record)
      .select()
      .single();

    if (error) {
      console.error('Error saving preview outfit:', error);
      return null;
    }

    console.log('✅ Preview outfit saved:', data);
    return data as SavedPreviewOutfit;
  }

  async getLatestPreviewOutfit(userId: string): Promise<SavedPreviewOutfit | null> {
    const supabase = await this.ensureSupabase();

    if (!supabase) {
      console.error('Supabase not available');
      return null;
    }

    const { data, error } = await supabase
      .from('preview_outfits')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Error fetching latest preview outfit:', error);
      return null;
    }

    return data as SavedPreviewOutfit | null;
  }

  async getPreviewOutfitBySession(userId: string, sessionId: string): Promise<SavedPreviewOutfit | null> {
    const supabase = await this.ensureSupabase();

    if (!supabase) {
      console.error('Supabase not available');
      return null;
    }

    const { data, error } = await supabase
      .from('preview_outfits')
      .select('*')
      .eq('user_id', userId)
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Error fetching preview outfit by session:', error);
      return null;
    }

    return data as SavedPreviewOutfit | null;
  }

  async getUserPreviewOutfits(userId: string, limit = 10): Promise<SavedPreviewOutfit[]> {
    const supabase = await this.ensureSupabase();

    if (!supabase) {
      console.error('Supabase not available');
      return [];
    }

    const { data, error } = await supabase
      .from('preview_outfits')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching user preview outfits:', error);
      return [];
    }

    return (data as SavedPreviewOutfit[]) || [];
  }

  async deletePreviewOutfit(id: string): Promise<boolean> {
    const supabase = await this.ensureSupabase();

    if (!supabase) {
      console.error('Supabase not available');
      return false;
    }

    const { error } = await supabase
      .from('preview_outfits')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting preview outfit:', error);
      return false;
    }

    console.log('🗑️ Preview outfit deleted:', id);
    return true;
  }
}

export const previewOutfitService = new PreviewOutfitService();
