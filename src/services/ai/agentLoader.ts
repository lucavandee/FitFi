/**
 * Agent loader service
 * Loads the Nova agent module dynamically
 */

import type { MockAgent } from './agent';

export async function loadNovaAgent(): Promise<MockAgent> {
  const mod = await import('./agent');
  return mod.default ?? mod.agent ?? mod;
}

export default loadNovaAgent;