import { createClient } from 'npm:@supabase/supabase-js@2.111.0';
import Razorpay from 'npm:razorpay@2.9.4';

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
const RAZORPAY_KEY_ID = Deno.env.get('RAZORPAY_KEY_ID') ?? '';
const RAZORPAY_KEY_SECRET = Deno.env.get('RAZORPAY_KEY_SECRET') ?? '';

// Anon client: used ONLY to verify the caller's JWT.
const supabaseAnon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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
  const plan = PLANS[body.planId as keyof typeof PLANS];
  if (!plan) return json({ error: 'Unknown plan' }, 400);

  try {
    const order = await razorpay.orders.create({
      amount: plan.pricePaise,
      currency: 'INR',
      receipt: `sub_${user.id.slice(0, 8)}_${Date.now()}`,
      notes: { userId: user.id, planId: body.planId },
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
