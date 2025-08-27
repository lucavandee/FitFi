export default function EnvSanity() {
  const env = {
    VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY ? 'present' : 'missing',
    NODE_ENV: import.meta.env.MODE,
  };
  return (
    <div style={{padding:'16px', fontFamily:'ui-sans-serif'}}>
      <h1>Env Sanity</h1>
      <pre>{JSON.stringify(env, null, 2)}</pre>
      <p>Nova function URL (relative): <code>/.netlify/functions/nova</code></p>
    </div>
  );
}