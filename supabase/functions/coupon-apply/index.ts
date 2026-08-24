import { createClient } from 'npm:@supabase/supabase-js@2.111.0';
import { checkRateLimit } from '../_shared/rate_limit.ts';
import { getPlan } from '../_shared/plans.ts';
import {
  countSubscribers,
  discountedPaise,
  getCoupon,
  normalizeCode,
  userHasUsedCoupon,
} from '../_shared/coupons.ts';

// Validates a coupon so the pricing page can show the discounted total. The
// quote returned here is the amount create-order will actually charge, so the
// two must stay derived from the same helpers. Nothing is consumed — the code is
// not spent until a payment succeeds and a subscription row exists.

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

const supabaseAnon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Typing a code is cheap, so this is generous; it only exists to stop scripted
// enumeration of the coupon namespace.
const RATE_LIMIT = { route: 'coupon-apply', limit: 40, windowMs: 60 * 60 * 1000 };

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
      JSON.stringify({ error: 'Too many coupon attempts. Please try again later.', code: 'RATE_LIMITED' }),
      { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Retry-After': String(rate.retryAfterSeconds) } }
    );
  }

  const body = await req.json().catch(() => ({}));
  const code = normalizeCode(body.couponCode);
  const plan = getPlan(body.planId);
  if (!plan) return json({ error: 'Unknown plan' }, 400);

  // Same response for a malformed code and an unknown one, so the shape of the
  // coupon namespace can't be probed.
  const coupon = code ? getCoupon(code) : null;
  if (!coupon) {
    return json({ valid: false, reason: 'invalid', message: 'That coupon code is not valid.' });
  }

  try {
    if (await userHasUsedCoupon(supabaseAdmin, code!, user.id)) {
      return json({
        valid: false,
        reason: 'already_redeemed',
        message: 'You have already used this coupon.',
      });
    }

    const subscribers = await countSubscribers(supabaseAdmin);
    if (subscribers >= coupon.maxSubscribers) {
      return json({
        valid: false,
        reason: 'exhausted',
        message: 'Sorry, you are late !!!',
      });
    }

    return json({
      valid: true,
      code,
      discountPercent: coupon.percent,
      amountPaise: discountedPaise(plan.pricePaise, coupon.percent),
      originalAmountPaise: plan.pricePaise,
      message: `Coupon applied — ${coupon.percent}% off.`,
    });
  } catch (err) {
    console.error('coupon-apply failed', err);
    return json({ error: 'Could not check that coupon right now.' }, 502);
  }
});
