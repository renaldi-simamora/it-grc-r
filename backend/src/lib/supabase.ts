import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseServiceKey &&
  supabaseUrl !== 'your_supabase_url_here' &&
  !supabaseUrl.includes('example.com')
);

// Admin client for server-side operations if configured
export const supabaseAdmin: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseServiceKey!)
  : null;

// Create a client scoped to a user's JWT
export function createSupabaseClient(accessToken: string): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  return createClient(supabaseUrl!, process.env.SUPABASE_ANON_KEY || supabaseServiceKey!, {
    global: {
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  });
}
