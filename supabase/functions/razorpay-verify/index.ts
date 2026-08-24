import { createClient } from 'npm:@supabase/supabase-js@2.111.0';
import Razorpay from 'npm:razorpay@2.9.4';
import { createHmac } from 'node:crypto';
import { checkRateLimit } from '../_shared/rate_limit.ts';
import { addMonths, getPlan } from '../_shared/plans.ts';
import { discountedPaise, getCoupon, normalizeCode } from '../_shared/coupons.ts';

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

// Per-user rate limit: at most 30 verifications per rolling hour. A real
// checkout verifies once, so this only stops scripted replay attempts.
const RATE_LIMIT = { route: 'razorpay-verify', limit: 30, windowMs: 60 * 60 * 1000 };

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

// Adds whole calendar months without the setMonth() overflow bug — see
// _shared/plans.ts.

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

  const rate = await checkRateLimit(supabaseAdmin, user.id, RATE_LIMIT);
  if (!rate.allowed) {
    return new Response(
      JSON.stringify({ error: 'Verification limit reached. Please try again later.', code: 'RATE_LIMITED' }),
      { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Retry-After': String(rate.retryAfterSeconds) } }
    );
  }

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
  const plan = getPlan(notes.planId);
  if (!plan) {
    return json({ error: 'Order does not match any plan' }, 400);
  }
  // The coupon rides along in the order notes, which only create-order can set,
  // so the expected total is re-derived from the server's own record of the
  // order rather than from anything the browser sent. A discounted order whose
  // amount doesn't match what that coupon should have produced is rejected.
  //
  // Deliberately no promo-cap check here. create-order is where the cap is
  // enforced; if the 50th slot went while this order was open, the customer has
  // already been charged, and refusing to record their subscription would take
  // the money without giving them anything.
  const couponCode = normalizeCode(notes.couponCode);
  const coupon = couponCode ? getCoupon(couponCode) : null;
  const expectedPaise = discountedPaise(plan.pricePaise, coupon?.percent ?? 0);
  if (expectedPaise !== Number(order.amount)) {
    return json({ error: 'Order amount does not match any plan' }, 400);
  }

  const now = new Date();

  // Find the latest active expiry so the new purchase stacks on top of it
  // (buying any plan — bigger or smaller — adds its time to what remains).
  const { data: activeSubs, error: fetchError } = await supabaseAdmin
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .gt('ends_at', now.toISOString())
    .order('ends_at', { ascending: false })
    .limit(1);

  if (fetchError) {
    console.error('subscription fetch failed', fetchError);
    return json({ error: 'Failed to look up existing subscription' }, 502);
  }

  const activeSub = activeSubs?.[0];

  // Stack on top of the remaining time (max of now vs current expiry).
  const base = activeSub && new Date(activeSub.ends_at) > now ? new Date(activeSub.ends_at) : now;
  const endsAt = addMonths(base, plan.months);

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
      starts_at: base.toISOString(),
      ends_at: endsAt.toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('subscription upsert failed', error);
    return json({ error: 'Failed to record subscription' }, 502);
  }
  return json({ ok: true, subscription: data, upgraded: !!activeSub });
});
