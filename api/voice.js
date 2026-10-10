// api/voice.js — Proxy de la recherche vocale vers le webhook n8n.
// Cache l'URL n8n, limite la taille et le débit, et signe l'appel avec un secret partagé
// (à vérifier dans le workflow n8n : en-tête « X-Demandoo-Key » = DEMANDOO_VOICE_KEY).

import { applyCors, rateLimit, clientIp } from './_lib/server.js';

export const config = { api: { bodyParser: false } };

const MAX_BYTES = 3 * 1024 * 1024; // 30 s d'audio compressé tiennent largement

async function readBody(req) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_BYTES) throw Object.assign(new Error('too_large'), { status: 413 });
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  if (applyCors(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  // Repli sur l'URL actuelle pour ne pas casser la recherche vocale au déploiement.
  // À terme : définir N8N_VOICE_WEBHOOK_URL (nouvelle URL non publique) sur Vercel.
  const webhookUrl = process.env.N8N_VOICE_WEBHOOK_URL || 'https://baolvision.app.n8n.cloud/webhook/demandoo-voice';

  if (!rateLimit(`voice:${clientIp(req)}`, { limit: 10, windowMs: 10 * 60_000 })) {
    return res.status(429).json({ error: 'Trop de recherches vocales. Réessayez dans quelques minutes.' });
  }

  const contentType = req.headers['content-type'] || '';
  if (!contentType.startsWith('multipart/form-data')) {
    return res.status(415).json({ error: 'Format non supporté.' });
  }

  let body;
  try {
    body = await readBody(req);
  } catch (err) {
    return res.status(err.status || 400).json({ error: 'Enregistrement trop long.' });
  }

  try {
    const upstream = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': contentType,
        ...(process.env.DEMANDOO_VOICE_KEY ? { 'X-Demandoo-Key': process.env.DEMANDOO_VOICE_KEY } : {}),
      },
      body,
      signal: AbortSignal.timeout(45_000),
    });
    const buffer = Buffer.from(await upstream.arrayBuffer());
    res.status(upstream.status);
    res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/octet-stream');
    res.setHeader('Cache-Control', 'no-store');
    return res.send(buffer);
  } catch (err) {
    console.error('Voice proxy error:', err);
    return res.status(502).json({ error: 'Service vocal injoignable.' });
  }
}
