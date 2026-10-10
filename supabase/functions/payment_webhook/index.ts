// Webhook de confirmation de paiement (Wave / Bictorys).
// Sécurité :
//   - Wave : signature HMAC-SHA256 de l'en-tête « Wave-Signature » (secret WAVE_WEBHOOK_SECRET)
//   - Bictorys / autres : en-tête « X-Secret-Key » ou « X-Webhook-Secret » = PAYMENT_WEBHOOK_SECRET
//   - Le plan et le montant attendu viennent de la ligne payments créée par /api/payments/checkout,
//     jamais du contenu du webhook.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const encoder = new TextEncoder()

function timingSafeEqual(a: string, b: string) {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

async function hmacHex(secret: string, message: string) {
  const key = await crypto.subtle.importKey(
    "raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"],
  )
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(message))
  return Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, "0")).join("")
}

// Format Wave : "t=1639081943,v1=abc...,v1=def..."
async function verifyWaveSignature(header: string, rawBody: string, secret: string) {
  const parts = header.split(",")
  const timestamp = parts.find((p) => p.startsWith("t="))?.slice(2)
  const signatures = parts.filter((p) => p.startsWith("v1=")).map((p) => p.slice(3))
  if (!timestamp || signatures.length === 0) return false
  if (Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) return false // anti-rejeu 5 min
  const expected = await hmacHex(secret, timestamp + rawBody)
  return signatures.some((s) => timingSafeEqual(s, expected))
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } })
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405 })

  const rawBody = await req.text()
  const waveSecret = Deno.env.get("WAVE_WEBHOOK_SECRET")
  const sharedSecret = Deno.env.get("PAYMENT_WEBHOOK_SECRET")
  const waveSig = req.headers.get("wave-signature")
  const providedSecret = req.headers.get("x-secret-key") || req.headers.get("x-webhook-secret") || ""

  let authenticated = false
  if (waveSig && waveSecret) {
    authenticated = await verifyWaveSignature(waveSig, rawBody, waveSecret)
  } else if (sharedSecret && providedSecret) {
    authenticated = timingSafeEqual(providedSecret, sharedSecret)
  }
  if (!authenticated) return json({ error: "Unauthorized" }, 401)

  let payload: Record<string, any>
  try {
    payload = JSON.parse(rawBody)
  } catch {
    return json({ error: "Invalid JSON" }, 400)
  }

  // Normalisation Wave ({ type, data: {...} }) et Bictorys (objet plat)
  const data = payload.data ?? payload
  const reference: string | undefined = data.client_reference ?? data.paymentReference ?? data.merchantReference
  const providerTxId: string | undefined = data.transaction_id ?? data.id ?? data.chargeId
  const rawStatus = String(data.payment_status ?? data.status ?? payload.type ?? "").toLowerCase()
  const amount = Number(data.amount)
  const succeeded = ["succeeded", "successful", "success", "paid", "checkout.session.completed"].includes(rawStatus)

  if (!reference || !reference.startsWith("sub_")) return json({ error: "Unknown reference" }, 400)
  if (!succeeded) return json({ message: "Ignored (not a successful payment)" }, 200)

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  )

  const { data: result, error } = await supabase.rpc("activate_paid_subscription", {
    p_reference: reference,
    p_provider_tx_id: providerTxId ?? null,
    p_amount: Number.isFinite(amount) ? Math.round(amount) : null,
  })

  if (error) {
    console.error("activate_paid_subscription failed", error)
    return json({ error: "Processing failed" }, 500)
  }
  return json(result ?? { status: "ok" })
})
