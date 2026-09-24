// api/auth/login.js — Vercel Serverless Function (ESM)
// Connexion chauffeur par Téléphone + PIN avec protection Anti-Brute Force.

import crypto from 'node:crypto';

// ─── Helpers JWT ──────────────────────────────────────────────────────────────
function b64url(str) { return Buffer.from(str).toString('base64url'); }
function signJWT(payload, secret) {
  const header = b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = b64url(JSON.stringify(payload));
  const sig = crypto.createHmac('sha256', secret).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${sig}`;
}

// ─── Vérification PIN (PBKDF2) ────────────────────────────────────────────────
function verifyPin(pin, stored) {
  try {
    const [salt, hash] = stored.split(':');
    const computed = crypto.pbkdf2Sync(pin, salt, 200_000, 64, 'sha512').toString('hex');
    return crypto.timingSafeEqual(Buffer.from(computed, 'hex'), Buffer.from(hash, 'hex'));
  } catch {
    return false;
  }
}

// ─── Normalisation du numéro de téléphone ────────────────────────────────────
function normalizePhone(raw) {
  const digits = String(raw || '').replace(/\D/g, '');
  if (!digits) return null;
  if (digits.startsWith('221') && digits.length === 12) return `+${digits}`;
  if (digits.length === 9) return `+221${digits}`;
  if (digits.startsWith('0') && digits.length === 10) return `+221${digits.slice(1)}`;
  return `+${digits}`;
}

// ─── Supabase REST helper (service_role) ─────────────────────────────────────
function supabaseHeaders() {
  return {
    'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
    'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation',
  };
}
const SUPA_URL = () => process.env.VITE_SUPABASE_URL;

// ─────────────────────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const { phone, pin } = req.body || {};

    if (!phone || !pin) {
      return res.status(400).json({ error: 'Téléphone et PIN requis.' });
    }

    const normalizedPhone = normalizePhone(phone);
    if (!normalizedPhone) {
      return res.status(400).json({ error: 'Numéro de téléphone invalide.' });
    }

    // ── Appeler la RPC pour récupérer les credentials ─────────────────────────
    const credsResp = await fetch(`${SUPA_URL()}/rest/v1/rpc/check_driver_pin`, {
      method: 'POST',
      headers: supabaseHeaders(),
      body: JSON.stringify({ p_phone: normalizedPhone }),
    });

    const credsData = await credsResp.json();
    if (!credsResp.ok || !Array.isArray(credsData) || credsData.length === 0) {
      return res.status(401).json({ error: 'Numéro de téléphone ou PIN incorrect.' });
    }
    const cred = credsData[0];

    // ── Vérification du lock anti-brute force ─────────────────────────────────
    if (cred.locked_until && new Date(cred.locked_until) > new Date()) {
      const remaining = Math.ceil((new Date(cred.locked_until) - new Date()) / 60000);
      return res.status(429).json({
        error: `Compte temporairement bloqué. Réessayez dans ${remaining} minute(s).`,
        locked_until: cred.locked_until,
      });
    }

    // ── Vérification du PIN ───────────────────────────────────────────────────
    const isPinValid = verifyPin(String(pin), cred.pin_hash);

    // ── Mise à jour des tentatives (anti-brute force) ─────────────────────────
    await fetch(`${SUPA_URL()}/rest/v1/rpc/update_driver_login_attempt`, {
      method: 'POST',
      headers: supabaseHeaders(),
      body: JSON.stringify({ p_phone: normalizedPhone, p_success: isPinValid }),
    });

    if (!isPinValid) {
      const attempts = (cred.attempts || 0) + 1;
      const remaining = Math.max(0, 5 - attempts);
      return res.status(401).json({
        error: `PIN incorrect. ${remaining > 0 ? `${remaining} tentative(s) restante(s).` : 'Compte bloqué 15 minutes.'}`,
      });
    }

    const userId = cred.user_id;

    // ── Récupérer le profil complet ───────────────────────────────────────────
    const profileResp = await fetch(
      `${SUPA_URL()}/rest/v1/profiles?id=eq.${userId}&select=*`,
      { headers: supabaseHeaders() }
    );
    const profiles = await profileResp.json();
    const profile = profiles?.[0] || null;

    // ── Générer le JWT custom compatible RLS Supabase ─────────────────────────
    const secret = process.env.SUPABASE_JWT_SECRET;
    if (!secret) return res.status(500).json({ error: 'SUPABASE_JWT_SECRET manquant.' });

    const now = Math.floor(Date.now() / 1000);
    const jwt = signJWT({
      sub: userId,
      role: 'authenticated',
      aud: 'authenticated',
      iss: SUPA_URL(),
      iat: now,
      exp: now + 60 * 60 * 24 * 7,
    }, secret);

    // ── Poser le cookie HttpOnly ──────────────────────────────────────────────
    res.setHeader('Set-Cookie', [
      `demandoo_auth=${jwt}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${60 * 60 * 24 * 7}${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`,
    ]);

    return res.status(200).json({
      success: true,
      access_token: jwt,
      user: {
        id: userId,
        phone: normalizedPhone,
        full_name: profile?.full_name || '',
        email: profile?.email || '',
        role: profile?.role || 'driver',
        driver_status: profile?.driver_status || 'PENDING',
        is_driver_active: profile?.is_driver_active || false,
        avatar_url: profile?.avatar_url || '',
        subscription_status: profile?.subscription_status || 'inactive',
        subscription_plan: profile?.subscription_plan || null,
        subscription_trip_limit: profile?.subscription_trip_limit || 0,
        subscription_trips_used: profile?.subscription_trips_used || 0,
      },
    });

  } catch (err) {
    console.error('Login handler error:', err);
    return res.status(500).json({ error: err.message || 'Erreur interne du serveur.' });
  }
}
