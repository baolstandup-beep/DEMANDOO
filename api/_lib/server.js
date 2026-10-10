// api/_lib/server.js — Helpers partagés des fonctions serverless Vercel.
// Le préfixe « _ » empêche Vercel d'exposer ce fichier comme une route.

const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || 'https://demandoo-kappa.vercel.app')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

export const SUPA_URL = () => process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const ANON_KEY = () => process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

// CORS restreint aux origines Demandoo (+ app native Capacitor et dev local)
export function applyCors(req, res, methods = 'POST, OPTIONS') {
  const origin = req.headers.origin;
  const isAllowed = origin && (
    ALLOWED_ORIGINS.includes(origin) ||
    origin === 'capacitor://localhost' ||
    origin === 'http://localhost' ||
    /^http:\/\/localhost:\d+$/.test(origin)
  );
  if (isAllowed) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Methods', methods);
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return true;
  }
  return false;
}

export function serviceHeaders(extra = {}) {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
    ...extra,
  };
}

// Vérifie le jeton Supabase envoyé par le client et renvoie l'utilisateur, ou null.
export async function getUserFromRequest(req) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token || !SUPA_URL() || !ANON_KEY()) return null;

  const resp = await fetch(`${SUPA_URL()}/auth/v1/user`, {
    headers: { apikey: ANON_KEY(), Authorization: `Bearer ${token}` },
  });
  if (!resp.ok) return null;
  const user = await resp.json();
  return user?.id ? user : null;
}

export async function getProfile(userId) {
  const resp = await fetch(
    `${SUPA_URL()}/rest/v1/profiles?id=eq.${encodeURIComponent(userId)}&select=*`,
    { headers: serviceHeaders() }
  );
  if (!resp.ok) return null;
  const rows = await resp.json();
  return rows?.[0] || null;
}

export async function patchProfile(userId, fields) {
  return fetch(`${SUPA_URL()}/rest/v1/profiles?id=eq.${encodeURIComponent(userId)}`, {
    method: 'PATCH',
    headers: serviceHeaders({ Prefer: 'return=minimal' }),
    body: JSON.stringify(fields),
  });
}

// Limiteur de débit en mémoire (par instance serverless) — protection de base contre les abus.
// Pour une limite globale stricte, brancher Upstash Redis / Vercel KV.
const buckets = new Map();
export function rateLimit(key, { limit, windowMs }) {
  const now = Date.now();
  const entry = buckets.get(key);
  if (!entry || now - entry.start > windowMs) {
    buckets.set(key, { start: now, count: 1 });
    return true;
  }
  entry.count += 1;
  return entry.count <= limit;
}

export function clientIp(req) {
  return String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
}
