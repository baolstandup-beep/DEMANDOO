import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 })
  }

  try {
    const payload = await req.json()
    // Simulated generic webhook payload:
    // { transaction_id: "WAVE-1234", driver_id: "uuid", plan: "standard", status: "success", amount: 2500 }
    
    const { transaction_id, driver_id, plan, status, amount } = payload

    if (!transaction_id || !driver_id || status !== 'success') {
      return new Response(JSON.stringify({ error: 'Invalid payload or unsuccessful payment' }), { status: 400 })
    }

    // Initialize Supabase admin client to bypass RLS
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Check if transaction was already processed (Idempotency)
    const { data: existingPayment } = await supabase
      .from('payments')
      .select('id')
      .eq('provider_transaction_id', transaction_id)
      .single()

    if (existingPayment) {
      return new Response(JSON.stringify({ message: 'Transaction already processed' }), { status: 200 })
    }

    // Start processing
    // 1. Insert payment record
    const { error: paymentError } = await supabase.from('payments').insert([{
      driver_id,
      provider: 'webhook',
      provider_transaction_id: transaction_id,
      amount,
      status: 'paid',
      confirmed_at: new Date().toISOString()
    }])

    if (paymentError) throw paymentError

    // 2. Determine trip limit based on plan
    let tripLimit = 1
    if (plan === 'standard') tripLimit = 4
    if (plan === 'pro') tripLimit = 999999

    // 3. Update Profile (Subscription Fields)
    // We update using Service Role to bypass the protective trigger/RLS if configured that way
    // Actually the trigger `protect_subscription_fields` blocks updates if current_user = 'authenticated'. 
    // Edge functions using service_role have role 'service_role', so it bypasses it.
    
    const nextRenewalAt = new Date()
    nextRenewalAt.setMonth(nextRenewalAt.getMonth() + 1) // Adds 1 month

    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        subscription_plan: plan,
        subscription_status: 'active',
        subscription_trips_used: 0,
        subscription_trip_limit: tripLimit,
        payment_reference: transaction_id,
        last_payment_at: new Date().toISOString(),
        next_renewal_at: nextRenewalAt.toISOString()
      })
      .eq('id', driver_id)

    if (profileError) throw profileError

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
