import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import crypto from 'node:crypto';
import Razorpay from 'razorpay';
import { createClient } from '@supabase/supabase-js';

const PORT = process.env.PORT || 4000;
const ALLOWED_ORIGINS = (process.env.CORS_ORIGINS || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim());

// Plan catalogue is defined HERE (server-side), never trusted from the client.
// Price is in paise (INR).
const PLANS = {
  '1month': { name: '1 Month', pricePaise: 1900, months: 1 },
  '3months': { name: '3 Months', pricePaise: 5000, months: 3 },
  '6months': { name: '6 Months', pricePaise: 9400, months: 6 },
  '1year': { name: '1 Year', pricePaise: 15900, months: 12 },
};

const required = (name, value) => {
  if (!value) {
    console.error(`Missing env var: ${name}`);
    process.exit(1);
  }
};

required('SUPABASE_URL', process.env.SUPABASE_URL);
required('SUPABASE_SERVICE_ROLE_KEY', process.env.SUPABASE_SERVICE_ROLE_KEY);
required('RAZORPAY_KEY_ID', process.env.RAZORPAY_KEY_ID);
required('RAZORPAY_KEY_SECRET', process.env.RAZORPAY_KEY_SECRET);

// Anon client: used ONLY to verify the user's JWT (auth.getUser).
const supabaseAnon = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_PUBLISHABLE_KEY,
  { auth: { persistSession: false } }
);
// Service-role client: used to write subscriptions. NEVER exposed to the browser.
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const app = express();
app.use(cors({ origin: ALLOWED_ORIGINS }));
app.use(express.json());

// Bearer <supabase JWT> -> the authenticated user or null.
async function getUser(req) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return null;
  const { data, error } = await supabaseAnon.auth.getUser(token);
  if (error || !data.user) return null;
  return data.user;
}

// POST /api/payments/create-order  { planId }
// 1. Verifies the Supabase JWT, 2. creates a Razorpay order with a
// server-side price, 3. returns the order to the browser checkout.
app.post('/api/payments/create-order', async (req, res) => {
  const user = await getUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const plan = PLANS[req.body?.planId];
  if (!plan) {
    return res.status(400).json({ error: 'Unknown plan' });
  }
  try {
    const order = await razorpay.orders.create({
      amount: plan.pricePaise,
      currency: 'INR',
      receipt: `sub_${user.id.slice(0, 8)}_${Date.now()}`,
      notes: { userId: user.id, planId: req.body.planId },
    });
    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      planName: plan.name,
    });
  } catch (err) {
    console.error('create-order failed', err);
    res.status(502).json({ error: 'Razorpay order creation failed' });
  }
});

// POST /api/payments/verify  { orderId, paymentId, signature }
// Verifies the Razorpay signature, then records the subscription.
app.post('/api/payments/verify', async (req, res) => {
  const user = await getUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const { orderId, paymentId, signature } = req.body || {};
  if (!orderId || !paymentId || !signature) {
    return res.status(400).json({ error: 'Missing payment details' });
  }
  const body = `${orderId}|${paymentId}`;
  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');
  if (expected !== signature) {
    return res.status(400).json({ error: 'Invalid payment signature' });
  }

  // Look up the order and reject if it does not match the user/plan that was
  // charged when the order was created (server-set notes, not client input).
  let order;
  try {
    order = await razorpay.orders.fetch(orderId);
  } catch {
    return res.status(502).json({ error: 'Could not fetch order' });
  }
  const notes = order.notes || {};
  if (notes.userId && notes.userId !== user.id) {
    return res.status(400).json({ error: 'Order does not belong to this user' });
  }
  const planId = notes.planId;
  const plan = PLANS[planId];
  if (!plan || plan.pricePaise !== Number(order.amount)) {
    return res.status(400).json({ error: 'Order amount does not match any plan' });
  }

  const now = new Date();
  const endsAt = new Date(now);
  endsAt.setMonth(endsAt.getMonth() + plan.months);

  const { data, error } = await supabaseAdmin
    .from('subscriptions')
    .insert({
      user_id: user.id,
      plan_id: planId,
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
    return res.status(502).json({ error: 'Failed to record subscription' });
  }
  res.json({ ok: true, subscription: data });
});

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, razorpay: !!process.env.RAZORPAY_KEY_ID });
});

app.listen(PORT, () => {
  console.log(`EduTester payment server on http://localhost:${PORT}`);
});
