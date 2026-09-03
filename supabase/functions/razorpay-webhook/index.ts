import { createClient } from 'npm:@supabase/supabase-js@2.111.0';
import Razorpay from 'npm:razorpay@2.9.4';
import { createHmac } from 'node:crypto';
import { provisionSubscription } from '../_shared/subscriptions.ts';

// Server-to-server backstop for payments the browser never confirms.
// If the user's internet dies (or the tab closes) after the bank approves
// the payment but before razorpay-verify runs, Razorpay retries THIS
// endpoint until it returns 2xx — the subscription is still provisioned.
//
// Setup (do once per mode — test, then live):
//   1. supabase secrets set RAZORPAY_WEBHOOK_SECRET=<secret from dashboard>
//   2. supabase functions deploy razorpay-webhook
//   3. Razorpay dashboard → Settings → Webhooks → Add:
//      URL = https://<project-ref>.supabase.co/functions/v1/razorpay-webhook
//      events = payment.captured, payment.failed
//      secret = same value as above
// Mode switch (test → live) only changes the secret + URL registration.

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const RAZORPAY_KEY_ID = Deno.env.get('RAZORPAY_KEY_ID') ?? '';
const RAZORPAY_KEY_SECRET = Deno.env.get('RAZORPAY_KEY_SECRET') ?? '';
const RAZORPAY_WEBHOOK_SECRET = Deno.env.get('RAZORPAY_WEBHOOK_SECRET') ?? '';

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const razorpay = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_KEY_SECRET,
});

// Constant-time hex comparison without node Buffer types (keeps the local
// functions typecheck green; Deno would have Buffer, tsc here does not).
function safeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function verifyWebhookSignature(rawBody: string, signature: string): boolean {
  if (!RAZORPAY_WEBHOOK_SECRET || !signature) return false;
  const expected = createHmac('sha256', RAZORPAY_WEBHOOK_SECRET).update(rawBody).digest('hex');
  return safeEqualHex(expected, signature);
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  // The signature covers the RAW body — parse only after verifying.
  const rawBody = await req.text().catch(() => '');
  const signature = req.headers.get('x-razorpay-signature') ?? '';
  if (!verifyWebhookSignature(rawBody, signature)) {
    return new Response(JSON.stringify({ error: 'Invalid signature' }), { status: 400 });
  }

  const event = JSON.parse(rawBody) as {
    event?: string;
    payload?: { payment?: { entity?: { id?: string; order_id?: string; status?: string } } };
  };

  // payment.failed is logged for support visibility; nothing to provision.
  // Always 200 it so Razorpay stops retrying a non-actionable event.
  if (event.event !== 'payment.captured') {
    return new Response(JSON.stringify({ ok: true, ignored: event.event ?? null }), { status: 200 });
  }

  const payment = event.payload?.payment?.entity;
  const paymentId = payment?.id;
  const orderId = payment?.order_id;
  if (!paymentId || !orderId) {
    return new Response(JSON.stringify({ error: 'Missing payment entity' }), { status: 400 });
  }

  let order;
  try {
    order = await razorpay.orders.fetch(orderId);
  } catch (err) {
    console.error('webhook order fetch failed', err);
    return new Response(JSON.stringify({ error: 'Could not fetch order' }), { status: 502 });
  }

  const userId = order.notes?.userId;
  if (!userId) {
    console.error('webhook order has no userId note', orderId);
    return new Response(JSON.stringify({ error: 'Order has no user' }), { status: 400 });
  }

  try {
    const result = await provisionSubscription(supabaseAdmin, userId, order, paymentId);
    console.log(
      `webhook provisioned ${orderId} for ${userId}${result.alreadyProvisioned ? ' (already existed)' : ''}`
    );
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (err) {
    console.error('webhook provision failed', err);
    // 502 (not 4xx) so Razorpay retries — the customer HAS paid, dropping
    // the event would take money without giving access.
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Provision failed' }),
      { status: 502 }
    );
  }
});
