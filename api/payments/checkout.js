// api/payments/checkout.js — Création d'une session de paiement d'abonnement chauffeur.
// Le montant est calculé côté serveur ; les clés Wave / Bictorys ne quittent jamais le serveur.
// L'abonnement n'est activé QUE par le webhook (supabase/functions/payment_webhook).

import crypto from 'node:crypto';
import {
  applyCors, getUserFromRequest, getProfile, serviceHeaders, SUPA_URL, rateLimit,
} from '../_lib/server.js';

// Repli si la table subscription_plans n'est pas renseignée (doit refléter SubscriptionPage)
const FALLBACK_PRICES = { standard: 2400, pro: 4900 };

async function getPlanPrice(slug) {
  try {
    const resp = await fetch(
      `${SUPA_URL()}/rest/v1/subscription_plans?slug=eq.${encodeURIComponent(slug)}&active=eq.true&select=monthly_price`,
      { headers: serviceHeaders() }
    );
    if (resp.ok) {
      const rows = await resp.json();
      if (rows?.[0]?.monthly_price > 0) return rows[0].monthly_price;
    }
  } catch { /* repli ci-dessous */ }
  return FALLBACK_PRICES[slug] || null;
}

async function createWaveSession({ amount, reference, phone, successUrl, errorUrl }) {
  const resp = await fetch('https://api.wave.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.WAVE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: String(amount),
      currency: 'XOF',
      client_reference: reference,
      success_url: successUrl,
      error_url: errorUrl,
      ...(phone ? { restrict_payer_mobile: phone } : {}),
    }),
  });
  const data = await resp.json().catch(() => ({}));
  if (!resp.ok) throw new Error(data.message || `Wave ${resp.status}`);
  return data.wave_launch_url;
}

async function createBictorysCharge({ amount, reference, phone, name, email, paymentType, successUrl, errorUrl }) {
  const url = new URL('https://api.bictorys.com/pay/v1/charges');
  if (paymentType) url.searchParams.set('payment_type', paymentType);
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'X-Api-Key': process.env.BICTORYS_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      amount,
      currency: 'XOF',
      country: 'SN',
      paymentReference: reference,
      successRedirectUrl: successUrl,
      errorRedirectUrl: errorUrl,
      customerObject: {
        name: name || 'Chauffeur Demandoo',
        phone: phone ? Number(phone.replace(/\D/g, '')) : undefined,
        email: email || undefined,
        country: 'SN',
      },
    }),
  });
  const data = await resp.json().catch(() => ({}));
  if (!resp.ok) throw new Error(data.details || data.title || `Bictorys ${resp.status}`);
  return data.link;
}

export default async function handler(req, res) {
  if (applyCors(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const user = await getUserFromRequest(req);
  if (!user) return res.status(401).json({ error: 'Veuillez vous reconnecter.' });

  if (!rateLimit(`checkout:${user.id}`, { limit: 5, windowMs: 10 * 60_000 })) {
    return res.status(429).json({ error: 'Trop de tentatives. Réessayez dans quelques minutes.' });
  }

  const { plan_slug: planSlug, provider, phone } = req.body || {};
  if (!['standard', 'pro'].includes(planSlug)) {
    return res.status(400).json({ error: 'Formule inconnue.' });
  }
  if (!['wave', 'orange_money', 'card'].includes(provider)) {
    return res.status(400).json({ error: 'Moyen de paiement inconnu.' });
  }

  const useWave = provider === 'wave' && process.env.WAVE_API_KEY;
  const useBictorys = !useWave && process.env.BICTORYS_API_KEY;
  if (!useWave && !useBictorys) {
    return res.status(503).json({
      error: 'Le paiement en ligne est momentanément indisponible. Contactez-nous sur WhatsApp pour activer votre formule.',
    });
  }

  const profile = await getProfile(user.id);
  if (!profile || profile.role !== 'driver') {
    return res.status(403).json({ error: 'Les formules sont réservées aux chauffeurs.' });
  }

  const amount = await getPlanPrice(planSlug);
  if (!amount) return res.status(500).json({ error: 'Tarif introuvable.' });

  // Référence lue par activate_paid_subscription() : sub_<slug>_<uuid>_<horodatage>
  const reference = `sub_${planSlug}_${user.id}_${Date.now()}`;
  const origin = process.env.PUBLIC_SITE_URL || 'https://demandoo-kappa.vercel.app';
  const successUrl = `${origin}/abonnement?payment=success&ref=${encodeURIComponent(reference)}`;
  const errorUrl = `${origin}/abonnement?payment=cancelled`;
  const cleanPhone = phone ? `+221${String(phone).replace(/\D/g, '').replace(/^221/, '').slice(-9)}` : undefined;

  // Paiement « en attente » enregistré AVANT la redirection (sert de référence au webhook)
  const insert = await fetch(`${SUPA_URL()}/rest/v1/payments`, {
    method: 'POST',
    headers: serviceHeaders({ Prefer: 'return=minimal' }),
    body: JSON.stringify({
      id: crypto.randomUUID(),
      driver_id: user.id,
      provider: useWave ? 'wave' : 'bictorys',
      provider_transaction_id: reference,
      amount,
      currency: 'XOF',
      status: 'pending',
    }),
  });
  if (!insert.ok) {
    console.error('payments insert failed', insert.status, await insert.text());
    return res.status(500).json({ error: 'Impossible de préparer le paiement.' });
  }

  try {
    const link = useWave
      ? await createWaveSession({ amount, reference, phone: cleanPhone, successUrl, errorUrl })
      : await createBictorysCharge({
          amount, reference, phone: cleanPhone,
          name: profile.full_name, email: profile.email,
          paymentType: provider === 'orange_money' ? 'orange_money' : undefined,
          successUrl, errorUrl,
        });
    if (!link) throw new Error('Lien de paiement manquant');
    return res.status(200).json({ url: link, reference, amount });
  } catch (err) {
    console.error('Checkout provider error:', err);
    return res.status(502).json({ error: "L'opérateur de paiement ne répond pas. Réessayez." });
  }
}
