const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://wojexzgjyhijuxzperhq.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvamV4emdqeWhpanV4enBlcmhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTM2NDAsImV4cCI6MjA2NjQyOTY0MH0.nLozOsn1drQPvRuSWRl_gLsh0_EvgtjidiUxpdUnhg0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createBucket() {
  console.log('Creating outfit-photos bucket...');
  
  const { data, error } = await supabase.storage.createBucket('outfit-photos', {
    public: true,
    fileSizeLimit: 10485760,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
  });

  if (error) {
    console.error('Error creating bucket:', error);
    process.exit(1);
  }

  console.log('Bucket created successfully:', data);
}

createBucket();
