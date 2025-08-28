import type { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

const ORIGINS = (process.env.NOVA_ALLOWED_ORIGINS || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const origin = event.headers.origin || '';
  if (ORIGINS.length && !ORIGINS.includes(origin)) {
    return { statusCode: 403, body: JSON.stringify({ error: 'forbidden_origin' }) };
  }

  const { email, password, data } = JSON.parse(event.body || '{}');
  if (!email || !password) {
    return { statusCode: 400, body: JSON.stringify({ error: 'missing_fields' }) };
  }

  const url = process.env.SUPABASE_URL;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !service) {
    return { statusCode: 500, body: JSON.stringify({ error: 'server_env_missing' }) };
  }

  const admin = createClient(url, service, { auth: { autoRefreshToken: false, persistSession: false } });

  const { data: created, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,           // meteen actief; geen e-mail nodig
    user_metadata: data || {},
  });

  if (error) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: error.message, code: (error as any).code || 'admin_create_error' }),
    };
  }

  return { statusCode: 200, body: JSON.stringify({ id: created.user?.id }) };
};