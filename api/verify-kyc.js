// api/verify-kyc.js — Pré-vérification IA du permis chauffeur.
// L'identité du chauffeur vient du jeton Supabase (jamais du corps de la requête).
// L'IA ne peut qu'APPROUVER automatiquement ; un doute ou une panne → revue manuelle (PENDING).

import { applyCors, getUserFromRequest, getProfile, patchProfile, rateLimit } from './_lib/server.js';

const MAX_IMAGE_BYTES = 6 * 1024 * 1024; // ~6 Mo décodés

export default async function handler(req, res) {
  if (applyCors(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const user = await getUserFromRequest(req);
  if (!user) return res.status(401).json({ error: 'Veuillez vous reconnecter.' });

  if (!rateLimit(`kyc:${user.id}`, { limit: 5, windowMs: 60 * 60_000 })) {
    return res.status(429).json({ error: 'Trop de tentatives. Réessayez dans une heure.' });
  }

  const { image_base64: imageBase64 } = req.body || {};
  if (typeof imageBase64 !== 'string' || !imageBase64) {
    return res.status(400).json({ error: 'Photo du permis manquante.' });
  }
  const mimeMatch = imageBase64.match(/^data:(image\/(?:jpeg|png|webp));base64,/);
  const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
  const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
  if (base64Data.length * 0.75 > MAX_IMAGE_BYTES) {
    return res.status(413).json({ error: 'Image trop lourde (6 Mo maximum).' });
  }

  const profile = await getProfile(user.id);
  if (!profile || profile.role !== 'driver') {
    return res.status(403).json({ error: 'Réservé aux chauffeurs.' });
  }
  if (profile.driver_status === 'VERIFIED') {
    return res.status(200).json({ status: 'VERIFIED', is_valid: true });
  }

  const geminiApiKey = process.env.GEMINI_API_KEY;
  let decision = null;

  if (geminiApiKey) {
    try {
      const prompt = "Tu es l'agent de conformité de Demandoo. Analyse cette photo de permis de conduire ou de carte d'identité sénégalaise. Vérifie si le document est lisible, complet et semble authentique. Réponds uniquement par un objet JSON strict avec deux clés : 'is_valid' (true ou false) et 'reason' (une phrase courte).";
      const geminiResponse = await fetch(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-goog-api-key': geminiApiKey },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }, { inline_data: { mime_type: mimeType, data: base64Data } }] }],
            generationConfig: { responseMimeType: 'application/json' },
          }),
        }
      );
      const geminiData = await geminiResponse.json();
      const text = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      decision = JSON.parse(text.replace(/```json|```/g, '').trim());
    } catch (err) {
      console.error('KYC AI error:', err);
      decision = null;
    }
  }

  if (decision?.is_valid === true) {
    await patchProfile(user.id, { driver_status: 'VERIFIED', kyc_status: 'verified', is_driver_active: true });
    return res.status(200).json({ status: 'VERIFIED', is_valid: true, reason: decision.reason });
  }

  // Refus IA ou IA indisponible → dossier transmis à l'équipe pour revue humaine
  await patchProfile(user.id, { driver_status: 'PENDING', kyc_status: 'pending' });
  return res.status(200).json({
    status: 'PENDING',
    is_valid: false,
    reason: decision?.reason || 'Votre dossier sera vérifié manuellement par notre équipe.',
  });
}
