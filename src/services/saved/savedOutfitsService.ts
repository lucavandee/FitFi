import { APP_ENV } from '@/config/env';
import { supabase } from '@/lib/supabaseClient';
import { track } from '@/utils/analytics';

export type SavedOutfitRecord = {
  id: string;           // uuid (sb) or local key
  outfit_id: string;    // our outfit id
  outfit_json: any;     // full outfit payload
  created_at?: string;
};

const LS_KEY = 'fitfi.saved_outfits.v1';

function localLoad(): SavedOutfitRecord[] {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]'); } catch { return []; }
}

function localSave(list: SavedOutfitRecord[]) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(list)); } catch {}
}

export async function listSaved(): Promise<SavedOutfitRecord[]> {
  if (APP_ENV.USE_SUPABASE) {
    const sb = supabase();
    if (sb) {
      try {
        const { data: session } = await sb.auth.getSession();
        if (session.session) {
          const { data, error } = await sb
            .from('saved_outfits')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(200);
          if (error) throw error;
          return (data || []) as SavedOutfitRecord[];
        }
      } catch (error) {
        console.warn('[SavedOutfits] Supabase failed, using local:', error);
      }
    }
  }
  return localLoad();
}

export async function isSaved(outfitId: string): Promise<boolean> {
  if (APP_ENV.USE_SUPABASE) {
    const sb = supabase();
    if (sb) {
      try {
        const { data: session } = await sb.auth.getSession();
        if (session.session) {
          const { data, error } = await sb
            .from('saved_outfits')
            .select('id')
            .eq('outfit_id', outfitId)
            .maybeSingle();
          if (error && error.code !== 'PGRST116') throw error; // not found is ok
          return !!data;
        }
      } catch (error) {
        console.warn('[SavedOutfits] isSaved check failed, using local:', error);
      }
    }
  }
  return localLoad().some(x => x.outfit_id === outfitId);
}

export async function saveOutfit(outfitId: string, outfitJson: any): Promise<void> {
  track('saved_outfit_click', { outfitId });
  
  if (APP_ENV.USE_SUPABASE) {
    const sb = supabase();
    if (sb) {
      try {
        const { data: session } = await sb.auth.getSession();
        if (session.session) {
          // idempotent by outfit_id
          const { error } = await sb.from('saved_outfits').upsert({
            outfit_id: outfitId,
            outfit_json: outfitJson,
            idempotency_key: `${session.session.user.id}:${outfitId}`,
          }, { onConflict: 'idempotency_key' });
          if (error) throw error;
          return;
        }
      } catch (error) {
        console.warn('[SavedOutfits] Supabase save failed, using local:', error);
      }
    }
  }
  
  // local fallback
  const list = localLoad();
  if (!list.some(x => x.outfit_id === outfitId)) {
    list.unshift({ 
      id: `local-${Date.now()}`, 
      outfit_id: outfitId, 
      outfit_json: outfitJson, 
      created_at: new Date().toISOString() 
    });
    localSave(list.slice(0, 200));
  }
}

export async function removeOutfit(outfitId: string): Promise<void> {
  track('saved_outfit_remove', { outfitId });
  
  if (APP_ENV.USE_SUPABASE) {
    const sb = supabase();
    if (sb) {
      try {
        const { data: session } = await sb.auth.getSession();
        if (session.session) {
          const { error } = await sb.from('saved_outfits').delete().eq('outfit_id', outfitId);
          if (error) throw error;
          return;
        }
      } catch (error) {
        console.warn('[SavedOutfits] Supabase remove failed, using local:', error);
      }
    }
  }
  
  const list = localLoad().filter(x => x.outfit_id !== outfitId);
  localSave(list);
}

export async function toggleSave(outfitId: string, outfitJson?: any): Promise<boolean> {
  const saved = await isSaved(outfitId);
  
  if (saved) {
    await removeOutfit(outfitId);
    return false;
  } else {
    await saveOutfit(outfitId, outfitJson || { id: outfitId, title: 'Saved Outfit' });
    return true;
  }
}

export async function clearAllSaved(): Promise<void> {
  track('saved_outfits_clear_all');
  
  if (APP_ENV.USE_SUPABASE) {
    const sb = supabase();
    if (sb) {
      try {
        const { data: session } = await sb.auth.getSession();
        if (session.session) {
          const { error } = await sb.from('saved_outfits').delete().neq('id', '00000000-0000-0000-0000-000000000000');
          if (error) throw error;
        }
      } catch (error) {
        console.warn('[SavedOutfits] Supabase clear failed, using local:', error);
      }
    }
  }
  
  localSave([]);
}