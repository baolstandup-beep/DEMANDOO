// api/auth/me.js — Vercel Serverless Function (ESM)
// Valide le cookie de session et retourne le profil utilisateur + access_token.

import crypto from 'node:crypto';

// ─── Helpers JWT ──────────────────────────────────────────────────────────────
function b64url(str) { return Buffer.from(str).toString('base64url'); }

function verifyJWT(token, secret) {
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('JWT malformé');
  const [header, payload, sig] = parts;
  const expectedSig = crypto
    .createHmac('sha256', secret)
    .update(`${header}.${payload}`)
    .digest('base64url');
  // Comparaison en temps constant
  if (!crypto.timingSafeEqual(Buffer.from(expectedSig), Buffer.from(sig))) {
    throw new Error('Signature JWT invalide');
  }
  const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString());
  if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
    throw new Error('JWT expiré');
  }
  return decoded;
}

// ─── Parseur de cookie simple ─────────────────────────────────────────────────
function parseCookies(cookieHeader) {
  const cookies = {};
  if (!cookieHeader) return cookies;
  cookieHeader.split(';').forEach((c) => {
    const [k, ...v] = c.trim().split('=');
    if (k) cookies[k.trim()] = v.join('=').trim();
  });
  return cookies;
}

// ─── Supabase REST helper (service_role) ─────────────────────────────────────
function supabaseHeaders() {
  return {
    'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
    'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
    'Content-Type': 'application/json',
  };
}
const SUPA_URL = () => process.env.VITE_SUPABASE_URL;

// ─────────────────────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const cookies = parseCookies(req.headers.cookie);
    const token = cookies['demandoo_auth'];

    if (!token) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    const secret = process.env.SUPABASE_JWT_SECRET;
    if (!secret) return res.status(500).json({ error: 'SUPABASE_JWT_SECRET manquant.' });

    // ── Vérifier le JWT ───────────────────────────────────────────────────────
    let payload;
    try {
      payload = verifyJWT(token, secret);
    } catch (e) {
      return res.status(401).json({ error: 'Session invalide ou expirée. Reconnectez-vous.' });
    }

    const userId = payload.sub;

    // ── Récupérer le profil ───────────────────────────────────────────────────
    const profileResp = await fetch(
      `${SUPA_URL()}/rest/v1/profiles?id=eq.${userId}&select=*`,
      { headers: supabaseHeaders() }
    );
    const profiles = await profileResp.json();
    const profile = profiles?.[0];

    if (!profile) {
      return res.status(404).json({ error: 'Profil introuvable.' });
    }

    return res.status(200).json({
      success: true,
      access_token: token,
      user: {
        id: userId,
        phone: profile.phone || '',
        full_name: profile.full_name || '',
        email: profile.email || '',
        role: profile.role || 'driver',
        driver_status: profile.driver_status || 'PENDING',
        is_driver_active: profile.is_driver_active || false,
        avatar_url: profile.avatar_url || '',
        subscription_status: profile.subscription_status || 'inactive',
        subscription_plan: profile.subscription_plan || null,
        subscription_trip_limit: profile.subscription_trip_limit || 0,
        subscription_trips_used: profile.subscription_trips_used || 0,
        kyc_status: profile.kyc_status || 'pending',
      },
    });

  } catch (err) {
    console.error('Me handler error:', err);
    return res.status(500).json({ error: err.message || 'Erreur interne.' });
  }
}
