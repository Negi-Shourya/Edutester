import { createClient } from 'npm:@supabase/supabase-js@2.111.0';
import Razorpay from 'npm:razorpay@2.9.4';
import { createHmac } from 'node:crypto';

// Plan catalogue is defined HERE (server-side), never trusted from the client.
// Price is in paise (INR).
const PLANS = {
  '1month': { name: '1 Month', pricePaise: 1900, months: 1 },
  '3months': { name: '3 Months', pricePaise: 5000, months: 3 },
  '6months': { name: '6 Months', pricePaise: 9400, months: 6 },
  '1year': { name: '1 Year', pricePaise: 15900, months: 12 },
} as const;

// SUPABASE_URL, SUPABASE_ANON_KEY and SUPABASE_SERVICE_ROLE_KEY are injected
// automatically by the edge runtime. RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET
// are set as secrets (supabase secrets set NAME=value).
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const RAZORPAY_KEY_ID = Deno.env.get('RAZORPAY_KEY_ID') ?? '';
const RAZORPAY_KEY_SECRET = Deno.env.get('RAZORPAY_KEY_SECRET') ?? '';

// Anon client: used ONLY to verify the caller's JWT.
const supabaseAnon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
// Service-role client: used to write subscriptions. Never exposed to the browser.
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const razorpay = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_KEY_SECRET,
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// Bearer <supabase JWT> -> the authenticated user or null.
async function getUser(req: Request) {
  const auth = req.headers.get('authorization') ?? '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return null;
  const { data, error } = await supabaseAnon.auth.getUser(token);
  if (error || !data.user) return null;
  return data.user;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const user = await getUser(req);
  if (!user) return json({ error: 'Unauthorized' }, 401);

  const body = await req.json().catch(() => ({}));
  const { orderId, paymentId, signature } = body as {
    orderId?: string;
    paymentId?: string;
    signature?: string;
  };
  if (!orderId || !paymentId || !signature) {
    return json({ error: 'Missing payment details' }, 400);
  }

  const expected = createHmac('sha256', RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');
  if (expected !== signature) {
    return json({ error: 'Invalid payment signature' }, 400);
  }

  // Look up the order and reject if it does not match the user/plan that was
  // charged when the order was created (server-set notes, not client input).
  let order;
  try {
    order = await razorpay.orders.fetch(orderId);
  } catch {
    return json({ error: 'Could not fetch order' }, 502);
  }
  const notes = order.notes ?? {};
  if (notes.userId && notes.userId !== user.id) {
    return json({ error: 'Order does not belong to this user' }, 400);
  }
  const plan = PLANS[notes.planId as keyof typeof PLANS];
  if (!plan || plan.pricePaise !== Number(order.amount)) {
    return json({ error: 'Order amount does not match any plan' }, 400);
  }

  const now = new Date();
  const endsAt = new Date(now);
  endsAt.setMonth(endsAt.getMonth() + plan.months);

  const { data, error } = await supabaseAdmin
    .from('subscriptions')
    .insert({
      user_id: user.id,
      plan_id: notes.planId,
      plan_name: plan.name,
      amount: order.amount,
      status: 'active',
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      starts_at: now.toISOString(),
      ends_at: endsAt.toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('subscription insert failed', error);
    return json({ error: 'Failed to record subscription' }, 502);
  }
  return json({ ok: true, subscription: data });
});
