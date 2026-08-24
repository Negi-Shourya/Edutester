import { createClient } from 'npm:@supabase/supabase-js@2.111.0';
import Razorpay from 'npm:razorpay@2.9.4';
import { checkRateLimit } from '../_shared/rate_limit.ts';
import { getPlan } from '../_shared/plans.ts';
import {
  countSubscribers,
  discountedPaise,
  getCoupon,
  normalizeCode,
  userHasUsedCoupon,
} from '../_shared/coupons.ts';

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
// Service-role client: writes the rate-limit log. Never exposed to the browser.
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Per-user rate limit: at most 30 order creations per rolling hour. A real
// checkout flow creates 1-2 orders, so this caps abuse without blocking
// legitimate retries.
const RATE_LIMIT = { route: 'razorpay-create-order', limit: 30, windowMs: 60 * 60 * 1000 };

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

  const rate = await checkRateLimit(supabaseAdmin, user.id, RATE_LIMIT);
  if (!rate.allowed) {
    return new Response(
      JSON.stringify({ error: 'Order creation limit reached. Please try again later.', code: 'RATE_LIMITED' }),
      { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Retry-After': String(rate.retryAfterSeconds) } }
    );
  }

  const body = await req.json().catch(() => ({}));
  const plan = getPlan(body.planId);
  if (!plan) return json({ error: 'Unknown plan' }, 400);
  const planId = body.planId as string;

  // The discount is resolved here, from the code alone, so the amount charged
  // cannot be steered by the browser: the client sends a code, never a price.
  const code = normalizeCode(body.couponCode);
  const coupon = code ? getCoupon(code) : null;
  let percentOff = 0;

  if (coupon) {
    try {
      if (await userHasUsedCoupon(supabaseAdmin, code!, user.id)) {
        return json(
          { error: 'You have already used this coupon.', code: 'COUPON_ALREADY_USED' },
          400
        );
      }
      if ((await countSubscribers(supabaseAdmin)) >= coupon.maxSubscribers) {
        return json({ error: 'Sorry, you are late !!!', code: 'COUPON_EXHAUSTED' }, 409);
      }
      percentOff = coupon.percent;
    } catch (err) {
      console.error('coupon check failed', err);
      return json({ error: 'Could not apply that coupon right now.' }, 502);
    }
  }

  // Both branches of discountedPaise stay above Razorpay's ₹1 floor, so there
  // is exactly one way to buy a plan — through checkout.
  const amountPaise = discountedPaise(plan.pricePaise, percentOff);

  try {
    const order = await razorpay.orders.create({
      amount: amountPaise,
      currency: 'INR',
      receipt: `sub_${user.id.slice(0, 8)}_${Date.now()}`,
      // razorpay-verify re-derives the expected amount from these notes, so the
      // coupon has to travel with the order rather than with the client.
      notes: { userId: user.id, planId, couponCode: code ?? '' },
    });
    return json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: RAZORPAY_KEY_ID,
      planName: plan.name,
    });
  } catch (err) {
    console.error('create-order failed', err);
    return json({ error: 'Razorpay order creation failed' }, 502);
  }
});
