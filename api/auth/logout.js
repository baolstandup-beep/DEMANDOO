import { applyCors } from '../_lib/server.js';
// api/auth/logout.js — Vercel Serverless Function (ESM)
// Déconnexion : efface le cookie de session.

export default async function handler(req, res) {
  // CORS restreint aux origines Demandoo
  if (applyCors(req, res, 'POST, OPTIONS')) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  // Effacer le cookie en le remplaçant par une valeur vide avec Max-Age=0
  res.setHeader('Set-Cookie', [
    `demandoo_auth=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`,
  ]);

  return res.status(200).json({ success: true });
}
