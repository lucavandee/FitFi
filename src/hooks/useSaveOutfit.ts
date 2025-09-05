export default function useSaveOutfit() {
  async function save(outfitId: string) {
    // no-op stub
    return { ok: true, id: outfitId };
  }
  return { save, isSaving: false, error: null as unknown };
}