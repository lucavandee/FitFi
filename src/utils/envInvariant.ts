// ENV Sanity Check - Build fails if required environment variables are missing
const required = [
  'VITE_SUPABASE_URL', 
  'VITE_SUPABASE_ANON_KEY',
  'VITE_BOLT_API_URL', 
  'VITE_BOLT_API_KEY',
  'VITE_SENTRY_DSN'
];

const missing: string[] = [];

required.forEach((key) => {
  const value = import.meta.env[key];
  if (!value || value === '' || value === 'your_key_here' || value === 'undefined') {
    missing.push(key);
  }
});

if (missing.length > 0) {
  const errorMessage = `❌ BUILD FAILED: Missing required environment variables:\n${missing.map(k => `  - ${k}`).join('\n')}\n\nPlease set these in your .env file or deployment environment.`;
  console.error(errorMessage);
  throw new Error(`Missing environment variables: ${missing.join(', ')}`);
}

// Log successful ENV validation in development only
if (import.meta.env.DEV) {
  console.log('✅ All required environment variables are present');
}

export {};