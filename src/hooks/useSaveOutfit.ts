import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Outfit } from '@/engine/types';
import { track } from '@/utils/telemetry';

type SaveInput = { outfit: Outfit; userId: string; idempotencyKey?: string };

export function useSaveOutfit(userId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ outfit, idempotencyKey }: SaveInput) => {
      if (!userId) throw new Error('not-authenticated');
      const payload = {
        user_id: userId,
        outfit_id: outfit.id,
        outfit_json: outfit as any,
        idempotency_key: idempotencyKey ?? `${userId}:${outfit.id}`,
      };
      const { error } = await supabase.from('saved_outfits').insert(payload);
      if (error && !/duplicate key|already exists/i.test(error.message)) throw error;
      track('outfit_saved', { outfit_id: outfit.id });
      return payload;
    },
    onMutate: async ({ outfit }) => {
      await qc.cancelQueries({ queryKey: ['saved-outfits', userId] });
      const prev = qc.getQueryData<any[]>(['saved-outfits', userId]) ?? [];
      qc.setQueryData(['saved-outfits', userId], [{ outfit_id: outfit.id, outfit_json: outfit }, ...prev]);
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(['saved-outfits', userId], ctx.prev);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['saved-outfits', userId] });
    }
  });
}