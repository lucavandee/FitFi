import fs from 'fs';
import path from 'path';

console.log('🔍 Checking Nova AI chat integration in build...');

try {
  const indexPath = path.join(process.cwd(), 'dist', 'index.html');
  
  if (!fs.existsSync(indexPath)) {
    console.error('❌ dist/index.html not found');
    process.exit(1);
  }
  
  // Check for Nova-related JavaScript
  const jsFiles = fs.readdirSync(path.join(process.cwd(), 'dist', 'assets'))
    .filter(file => file.endsWith('.js'));
  
  let novaFound = false;
  for (const jsFile of jsFiles) {
    const jsContent = fs.readFileSync(path.join(process.cwd(), 'dist', 'assets', jsFile), 'utf8');
    if (jsContent.includes('NovaChat') || jsContent.includes('nova-ai-chat')) {
      novaFound = true;
      break;
    }
  }
  
  if (!novaFound) {
    console.error('❌ Nova AI chat component not found in JavaScript bundles');
    process.exit(1);
  }
  
  console.log('✅ Nova AI chat integration verified in build');
  console.log('✅ Deploy health check passed');
  
} catch (error) {
  console.error('❌ Nova health check failed:', error.message);
  process.exit(1);
}