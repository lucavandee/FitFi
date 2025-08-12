/* prints versions in CI for easier debugging */
console.log('Node:', process.version);
try {
  const { execSync } = require('node:child_process');
  const npmV = execSync('npm -v', { stdio: ['ignore','pipe','ignore'] }).toString().trim();
  console.log('npm:', npmV);
} catch {}