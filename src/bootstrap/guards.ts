/**
 * Central bootstrap for browser guards. Uses dynamic imports so it won't redeclare
 * symbols even if multiple guard files exist in the repo.
 */
(async () => {
  try {
    // Prefer unified network guards if present
    const m = await import('@/utils/networkGuards').catch(() => null as any);
    if (m?.installNetworkGuards) m.installNetworkGuards();
  } catch {}
  try {
    // Back-compat: older split guards
    const m = await import('@/utils/fetchGuard').catch(() => null as any);
    if (m?.installFetchGuards) m.installFetchGuards();
  } catch {}
  try {
    const m = await import('@/integrations/previewGuards').catch(() => null as any);
    if (m?.installThirdPartyGuards) m.installThirdPartyGuards();
  } catch {}
})();

export {}; // ensure this is a module