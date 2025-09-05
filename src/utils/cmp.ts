// CMP gate: Ii() als beschikbaar, anders fallback naar /cookies.
export async function hasConsent(purpose = "analytics"): Promise<boolean> {
  try {
    // @ts-ignore - globale CMP kan bestaan
    if (typeof Ii === "function") {
      const res = await (Ii as any)({ purpose });
      return !!res?.granted;
    }
  } catch { /* ignore */ }
  return false; // conservatief: geen consent
}