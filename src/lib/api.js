import { supabase } from './supabase';

// Sur le web, les fonctions /api sont servies par le même domaine.
// Dans l'app native (Capacitor), l'origine est capacitor://localhost : il faut l'URL absolue.
const API_BASE = import.meta.env.VITE_API_BASE_URL
  || (typeof window !== 'undefined' && window.location.protocol.startsWith('http') ? '' : 'https://demandoo-kappa.vercel.app');

export const apiUrl = (path) => `${API_BASE}${path}`;

// Appel JSON authentifié vers nos fonctions serverless (jeton Supabase de la session courante)
export async function apiPost(path, payload) {
  const { data: { session } } = await supabase.auth.getSession();
  const response = await fetch(apiUrl(path), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
    },
    body: JSON.stringify(payload),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || 'Une erreur est survenue. Réessayez.');
  }
  return data;
}
