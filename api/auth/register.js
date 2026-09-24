// api/auth/register.js — Vercel Serverless Function (ESM)
// Inscription chauffeur par Téléphone + PIN, sans Twilio, sans email obligatoire.
// Utilise bcrypt PBKDF2 natif Node.js + JWT signé avec SUPABASE_JWT_SECRET.

import crypto from 'node:crypto';

// ─── Helpers JWT (natif Node.js, sans dépendance externe) ────────────────────
function b64url(str) {
  return Buffer.from(str).toString('base64url');
}
function signJWT(payload, secret) {
  const header = b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = b64url(JSON.stringify(payload));
  const sig = crypto.createHmac('sha256', secret).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${sig}`;
}

// ─── Helper hashing PIN (PBKDF2 natif) ───────────────────────────────────────
function hashPin(pin) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(pin, salt, 200_000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

// ─── Normalisation du numéro de téléphone (format +221XXXXXXXXX) ─────────────
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
    const { phone, pin, firstName, lastName, avatarUrl } = req.body || {};

    // ── Validation ───────────────────────────────────────────────────────────
    if (!phone || !pin || !firstName || !lastName) {
      return res.status(400).json({ error: 'Champs requis : phone, pin, firstName, lastName' });
    }
    if (!/^\d{4,6}$/.test(pin)) {
      return res.status(400).json({ error: 'Le PIN doit contenir 4 à 6 chiffres' });
    }

    const normalizedPhone = normalizePhone(phone);
    if (!normalizedPhone) {
      return res.status(400).json({ error: 'Numéro de téléphone invalide' });
    }

    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
    const generatedEmail = `driver.${normalizedPhone.replace('+', '')}@demandoo.sn`;

    // ── Vérifier que le téléphone n'est pas déjà enregistré ──────────────────
    const checkResp = await fetch(
      `${SUPA_URL()}/rest/v1/driver_credentials?phone=eq.${encodeURIComponent(normalizedPhone)}&select=id`,
      { headers: supabaseHeaders() }
    );
    const existing = await checkResp.json();
    if (Array.isArray(existing) && existing.length > 0) {
      return res.status(409).json({ error: 'Ce numéro de téléphone est déjà enregistré.' });
    }

    // ── Créer l'utilisateur dans auth.users via l'API Admin Supabase ─────────
    const authResp = await fetch(`${SUPA_URL()}/auth/v1/admin/users`, {
      method: 'POST',
      headers: supabaseHeaders(),
      body: JSON.stringify({
        email: generatedEmail,
        password: crypto.randomBytes(32).toString('hex'), // Mot de passe aléatoire (jamais utilisé)
        email_confirm: true,
        user_metadata: {
          full_name: fullName,
          phone: normalizedPhone,
          role: 'driver',
        },
      }),
    });

    const authData = await authResp.json();
    if (!authResp.ok || !authData?.id) {
      console.error('Supabase Admin user creation failed:', authData);
      return res.status(500).json({ error: 'Impossible de créer le compte. Réessayez.' });
    }

    const userId = authData.id;

    // ── Hasher le PIN et créer les credentials ────────────────────────────────
    const pinHash = hashPin(pin);

    const rpcResp = await fetch(`${SUPA_URL()}/rest/v1/rpc/register_driver_custom`, {
      method: 'POST',
      headers: supabaseHeaders(),
      body: JSON.stringify({
        p_user_id: userId,
        p_phone: normalizedPhone,
        p_pin_hash: pinHash,
        p_full_name: fullName,
        p_avatar_url: avatarUrl || '',
      }),
    });

    if (!rpcResp.ok) {
      const rpcErr = await rpcResp.json();
      console.error('register_driver_custom RPC failed:', rpcErr);
      return res.status(500).json({ error: 'Erreur lors de la création du profil chauffeur.' });
    }

    // ── Générer le JWT custom compatible RLS Supabase ─────────────────────────
    const secret = process.env.SUPABASE_JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ error: 'SUPABASE_JWT_SECRET manquant côté serveur.' });
    }
    const now = Math.floor(Date.now() / 1000);
    const jwt = signJWT({
      sub: userId,
      role: 'authenticated',
      aud: 'authenticated',
      iss: SUPA_URL(),
      iat: now,
      exp: now + 60 * 60 * 24 * 7, // 7 jours
    }, secret);

    // ── Poser le cookie HttpOnly sécurisé ─────────────────────────────────────
    res.setHeader('Set-Cookie', [
      `demandoo_auth=${jwt}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${60 * 60 * 24 * 7}${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`,
    ]);

    return res.status(201).json({
      success: true,
      access_token: jwt,
      user: {
        id: userId,
        phone: normalizedPhone,
        full_name: fullName,
        role: 'driver',
        driver_status: 'PENDING',
        is_driver_active: false,
      },
    });

  } catch (err) {
    console.error('Register handler error:', err);
    return res.status(500).json({ error: err.message || 'Erreur interne du serveur.' });
  }
}
