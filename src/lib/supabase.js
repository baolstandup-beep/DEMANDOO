import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes('placeholder-url') &&
  !supabaseUrl.includes('votre_url_supabase') &&
  !supabaseAnonKey.includes('placeholder-anon-key')
);

if (!isSupabaseConfigured) {
  console.info('Supabase is not configured yet. Running in local Demo / Mock mode.');
}

// ─── Token partagé pour l'injection du JWT custom ─────────────────────────────
// Quand un chauffeur se connecte via Phone+PIN, son JWT est injecté ici.
// Tous les appels `supabase.from(...)` transmettront automatiquement ce JWT,
// ce qui rend auth.uid() dans les RLS compatible avec notre Custom JWT.
let _customAuthToken = null;

export function setCustomAuthToken(token) {
  _customAuthToken = token;
}

export function clearCustomAuthToken() {
  _customAuthToken = null;
}

// ─── Fetch intercepteur ───────────────────────────────────────────────────────
const customFetch = (input, init = {}) => {
  if (_customAuthToken) {
    init.headers = {
      ...init.headers,
      Authorization: `Bearer ${_customAuthToken}`,
    };
  }
  return fetch(input, init);
};

// ─── Client Supabase (singleton) ─────────────────────────────────────────────
export const supabase = createClient(
  isSupabaseConfigured ? supabaseUrl : 'https://placeholder-url.supabase.co',
  isSupabaseConfigured ? supabaseAnonKey : 'placeholder-anon-key',
  {
    global: { fetch: customFetch },
    auth: {
      // Désactiver l'auto-refresh pour ne pas interférer avec notre Custom JWT
      autoRefreshToken: true,
      persistSession: true,
    },
  }
);
