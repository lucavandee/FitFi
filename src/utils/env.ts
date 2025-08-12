export const Env = {
  mode: import.meta.env.MODE,
  host: typeof window !== 'undefined' ? window.location.hostname : '',
  flag(name: string, def = 'false') {
    const v = (import.meta.env as any)[name];
    return (String(v ?? def)).toLowerCase() === 'true';
  },
};

export const isBolt = typeof window !== 'undefined' && /(^|\.)bolt\.new$/.test(Env.host);
export const isPreview = isBolt || Env.mode !== 'production';
export const disableMigrations = Env.flag('VITE_DISABLE_MIGRATIONS', isPreview ? 'true' : 'true');
export const muteThirdParty = Env.flag('VITE_DISABLE_THIRD_PARTY', isPreview ? 'true' : 'true');
export const appsignalEnabled = Env.flag('VITE_APPSIGNAL_ENABLED', 'false');

// Export env object for DataRouter compatibility
export const env = {
  USE_MOCK_DATA: Env.flag('VITE_USE_MOCK_DATA', 'true'),
  DEBUG_MODE: Env.flag('VITE_DEBUG_MODE', 'false')
};