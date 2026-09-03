import { createClient } from 'npm:@supabase/supabase-js@2.111.0';
import Razorpay from 'npm:razorpay@2.9.4';
import { checkRateLimit } from '../_shared/rate_limit.ts';
import { provisionSubscription } from '../_shared/subscriptions.ts';

// Lets the app recover a checkout that died mid-flight (internet lost after
// the bank approved the payment, tab closed, verify call failed). The client
// stores the orderId locally and asks here: "did that order actually get
// paid?" If yes, the subscription is provisioned now — idempotently, so a
// later webhook or verify retry converges on the same row.

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const RAZORPAY_KEY_ID = Deno.env.get('RAZORPAY_KEY_ID') ?? '';
const RAZORPAY_KEY_SECRET = Deno.env.get('RAZORPAY_KEY_SECRET') ?? '';

const supabaseAnon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const razorpay = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_KEY_SECRET,
});

const RATE_LIMIT = { route: 'razorpay-order-status', limit: 30, windowMs: 60 * 60 * 1000 };

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

  const rate = await checkRateLimit(supabaseAdmin, user.id, RATE_LIMIT);
  if (!rate.allowed) {
    return new Response(
      JSON.stringify({ error: 'Too many checks. Please try again later.', code: 'RATE_LIMITED' }),
      { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const body = await req.json().catch(() => ({}));
  const { orderId } = body as { orderId?: string };
  if (!orderId || typeof orderId !== 'string') {
    return json({ error: 'Missing orderId' }, 400);
  }

  let order;
  try {
    order = await razorpay.orders.fetch(orderId);
  } catch {
    return json({ error: 'Could not fetch order' }, 502);
  }
  if (order.notes?.userId && order.notes.userId !== user.id) {
    return json({ error: 'Order does not belong to this user' }, 400);
  }

  // order.status === 'paid' means fully paid. Anything else (created /
  // attempted) means no money moved — safe to discard and start over.
  if (order.status !== 'paid') {
    return json({ ok: true, paid: false, status: order.status });
  }

  let paymentId: string | null = null;
  try {
    const payments = await razorpay.orders.fetchPayments(orderId);
    const captured = (payments.items ?? []).find((p: { status?: string }) => p.status === 'captured');
    paymentId = captured?.id ?? payments.items?.[0]?.id ?? null;
  } catch (err) {
    console.error('fetchPayments failed', err);
    return json({ error: 'Could not check payment status' }, 502);
  }
  if (!paymentId) {
    return json({ ok: true, paid: false, status: order.status });
  }

  try {
    const result = await provisionSubscription(supabaseAdmin, user.id, order, paymentId);
    return json({
      ok: true,
      paid: true,
      recovered: !result.alreadyProvisioned,
      subscription: result.subscription,
    });
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : 'Recovery failed' }, 502);
  }
});
