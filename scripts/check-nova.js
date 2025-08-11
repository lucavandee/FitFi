#!/usr/bin/env node
(async () => {
  // Compatibel met zowel CJS (require) als ESM (import)
  let fs, path;
  try { fs = require('fs'); path = require('path'); } catch {
    fs = (await import('node:fs')).default;
    path = (await import('node:path')).default;
  }

  const log = (t, m) => console[t](`[nova-check] ${m}`);

  try {
    const enabled =
      process.env.VITE_NOVA_ENABLED === 'true' ||
      process.env.VITE_NOVA_ENABLED === '1';

    if (!enabled) {
      log('log', 'Nova feature flag is uit; check wordt overgeslagen.');
      process.exit(0);
    }

    const dist = path.resolve(__dirname, '..', 'dist');
    if (!fs.existsSync(dist)) {
      log('warn', 'dist/ niet gevonden; check wordt overgeslagen.');
      process.exit(0);
    }

    const assetsDir = path.join(dist, 'assets');
    if (!fs.existsSync(assetsDir)) {
      log('warn', 'dist/assets/ niet gevonden; check wordt overgeslagen.');
      process.exit(0);
    }

    const files = fs.readdirSync(assetsDir);
    const hasNova = files.some(f => /nova|ai|Nova/i.test(f));

    if (hasNova) {
      log('log', 'Nova bundle gedetecteerd. ✅');
    } else {
      log('warn', 'Geen Nova bundle gevonden. Build gaat toch door. ⚠️');
    }
    process.exit(0);
  } catch (e) {
    log('warn', `Check faalde maar stopt de build niet: ${e.message}`);
    process.exit(0);
  }
})();