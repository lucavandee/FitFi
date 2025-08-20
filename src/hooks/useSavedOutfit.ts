import { useEffect, useState } from 'react';
import { isSaved, saveOutfit, removeOutfit } from '@/services/saved/savedOutfitsService';

export function useSavedOutfit(outfit: any) {
  const outfitId = String(outfit?.id || '');
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let mounted = true;
    if (!outfitId) return;
    (async () => {
      try {
        const ok = await isSaved(outfitId);
        if (mounted) setSaved(ok);
      } catch { /* noop */ }
    })();
    return () => { mounted = false; };
  }, [outfitId]);

  const toggle = async () => {
    if (!outfitId || busy) return;
    setBusy(true);
    try {
      if (saved) {
        await removeOutfit(outfitId);
        setSaved(false);
      } else {
        await saveOutfit(outfitId, outfit);
        setSaved(true);
      }
    } finally {
      setBusy(false);
    }
  };

  return { saved, toggle, busy };
}