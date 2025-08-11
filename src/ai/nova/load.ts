/**
 * Lazy Nova Agent loader
 * Provides safe, future-proof loading of Nova Agent with fallbacks
 */

export const loadNovaAgent = async () => {
  try {
    const mod = await import('@/ai/nova/agent');
    const agent = mod.default ?? mod.agent;
    
    if (!agent) {
      throw new Error('Nova Agent not found in module');
    }
    
    return agent;
  } catch (error) {
    console.warn('[Nova] Failed to load agent:', error);
    
    // Return minimal fallback agent
    return {
      async ask() {
        return { 
          type: 'text' as const, 
          message: 'Nova is tijdelijk niet beschikbaar. Probeer het later opnieuw.' 
        };
      },
      async greet(name: string) {
        return `Hoi ${name}! Nova is tijdelijk niet beschikbaar.`;
      },
      memory: {
        readProfile: () => null,
        writeProfile: () => {},
        readHistory: () => [],
        writeHistory: () => {}
      },
      tools: {
        searchOutfits: async () => []
      }
    };
  }
};

/**
 * Check if Nova Agent is available
 */
export const isNovaAgentAvailable = async (): Promise<boolean> => {
  try {
    const agent = await loadNovaAgent();
    return !!(agent && typeof agent.ask === 'function');
  } catch {
    return false;
  }
};

/**
 * Safe Nova Agent execution with fallback
 */
export const safeNovaExecution = async <T>(
  operation: (agent: any) => Promise<T>,
  fallback: T
): Promise<T> => {
  try {
    const agent = await loadNovaAgent();
    return await operation(agent);
  } catch (error) {
    console.warn('[Nova] Safe execution failed, using fallback:', error);
    return fallback;
  }
};