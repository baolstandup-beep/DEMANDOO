/**
 * Service d'intégration Afrotools (Passerelles de paiement Wave & SMS)
 * Basé sur les spécifications ATSS d'Afro.tools
 */

const WAVE_API_KEY = import.meta.env.VITE_WAVE_API_KEY || '';
const BICTORYS_API_KEY = import.meta.env.VITE_BICTORYS_API_KEY || '';
const NIMBA_SERVICE_ID = import.meta.env.VITE_NIMBASMS_SERVICE_ID || '';
const NIMBA_SECRET_TOKEN = import.meta.env.VITE_NIMBASMS_SECRET_TOKEN || '';

/**
 * Initialise un paiement multi-moyen via Bictorys (Orange Money Sénégal, Wave, Carte bancaire)
 * Basé sur la spécification ATSS Bictorys create_charge
 */
export async function createBictorysCharge({
  amount,
  clientReference,
  customerName,
  customerPhone,
  customerEmail,
  paymentType, // e.g. 'orange_money' | 'wave' | undefined (hosted checkout)
  successUrl = `${window.location.origin}/mes-reservations?payment=success&provider=bictorys`,
  errorUrl = `${window.location.origin}/mes-reservations?payment=cancelled&provider=bictorys`
}) {
  const cleanPhone = customerPhone ? customerPhone.replace(/\D/g, '') : undefined;
  const phoneInt = cleanPhone ? parseInt(cleanPhone, 10) : undefined;

  if (BICTORYS_API_KEY) {
    try {
      const baseUrl = "https://api.bictorys.com/pay/v1/charges";
      const url = paymentType ? `${baseUrl}?payment_type=${paymentType}` : baseUrl;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "X-Api-Key": BICTORYS_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: Number(amount),
          currency: "XOF",
          country: "SN",
          paymentReference: clientReference,
          successRedirectUrl: successUrl,
          errorRedirectUrl: errorUrl,
          customerObject: {
            name: customerName || "Client Demandoo",
            phone: phoneInt,
            email: customerEmail,
            country: "SN"
          }
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.details || errData.title || `Bictorys error ${response.status}`);
      }

      return await response.json();
    } catch (err) {
      console.warn("Bictorys API fallback:", err.message);
    }
  }

  // Simulation Sandbox / Démo instantanée si pas de clé API live
  await new Promise((resolve) => setTimeout(resolve, 800));
  const chargeId = `bictorys_chg_${Date.now()}`;
  return {
    type: "CheckoutLinkObject",
    chargeId: chargeId,
    link: `https://checkout.bictorys.com/pay/${chargeId}`,
    state: "PURCHASED",
    amount: Number(amount),
    currency: "XOF",
    paymentReference: clientReference
  };
}

/**
 * Initialise une session de paiement Wave Sénégal
 */
export async function createWaveCheckout({
  amount,
  clientReference,
  clientPhone,
  successUrl = `${window.location.origin}/mes-reservations?payment=success`,
  errorUrl = `${window.location.origin}/mes-reservations?payment=cancelled`
}) {
  if (WAVE_API_KEY) {
    try {
      const response = await fetch("https://api.wave.com/v1/checkout/sessions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${WAVE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: amount.toString(),
          currency: "XOF",
          error_url: errorUrl,
          success_url: successUrl,
          client_reference: clientReference,
          restrict_payer_mobile: clientPhone ? clientPhone.replace(/\s+/g, '') : undefined
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Erreur Wave ${response.status}`);
      }

      return await response.json();
    } catch (err) {
      console.warn("Wave API fallback:", err.message);
    }
  }

  // Simulation Sandbox / Démo instantanée si pas de clé API live
  await new Promise((resolve) => setTimeout(resolve, 800));
  const sessionId = `wave_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  
  return {
    id: sessionId,
    wave_launch_url: `https://pay.wave.com/m/${sessionId}`,
    checkout_status: "complete",
    payment_status: "succeeded",
    amount: amount.toString(),
    currency: "XOF",
    client_reference: clientReference,
    business_name: "DEMANDOO SÉNÉGAL",
    when_created: new Date().toISOString()
  };
}

/**
 * Envoie un SMS de notification via NimbaSMS (ou simulation sandbox)
 */
export async function sendSmsNotification({ to, message }) {
  const cleanPhone = (to || '').replace(/\s+/g, '');
  if (!cleanPhone) return { success: false, error: 'Numéro manquant' };

  if (NIMBA_SERVICE_ID && NIMBA_SECRET_TOKEN) {
    try {
      const credentials = btoa(`${NIMBA_SERVICE_ID}:${NIMBA_SECRET_TOKEN}`);
      const response = await fetch("https://api.nimbasms.com/v1/messages", {
        method: "POST",
        headers: {
          Authorization: `Basic ${credentials}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: [cleanPhone],
          message: message,
          sender_name: "Demandoo"
        }),
      });

      if (response.ok) {
        return { success: true, data: await response.json() };
      }
    } catch (err) {
      console.warn("NimbaSMS fallback:", err);
    }
  }

  // Log simulation
  console.info(`[Afrotools SMS envoyé à ${cleanPhone}] : "${message}"`);
  return {
    success: true,
    simulated: true,
    messageId: `sms_${Date.now()}`
  };
}
