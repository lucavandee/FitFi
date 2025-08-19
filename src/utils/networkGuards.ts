import { installFetchGuards } from '@/utils/fetchGuard';
import { installThirdPartyGuards } from '@/integrations/previewGuards';

/**
 * Start alle netwerk/third-party guards exact één keer.
 * - fetch/XHR guards tegen migrations/collectors
 * - third-party stubs (AppSignal/Chameleon) wanneer disabled
 */
export function installNetworkGuards(): void {
  try { typeof installFetchGuards === 'function' && installFetchGuards(); } catch {}
  try { typeof installThirdPartyGuards === 'function' && installThirdPartyGuards(); } catch {}
}

export default { installNetworkGuards };