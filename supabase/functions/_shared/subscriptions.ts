import { addMonths, getPlan } from './plans.ts';
import { discountedPaise, getCoupon, normalizeCode } from './coupons.ts';

// Single place that turns a paid Razorpay order into a subscription row.
// Used by razorpay-verify (client callback), razorpay-webhook
// (payment.captured backstop) and razorpay-order-status (pending-order
// resume) so all three provision exactly the same way.
//
// IDEMPOTENT: the first thing it does is look for an existing subscription
// with the same razorpay_order_id. Retries, double callbacks and
// webhook+client races all converge on one row — never two.

export interface ProvisionOrder {
  id: string;
  amount: number | string;
  notes?: Record<string, string> | null;
}

export interface ProvisionResult {
  subscription: Record<string, unknown>;
  // True when the row already existed (retry / race / webhook arrived first).
  alreadyProvisioned: boolean;
  upgraded: boolean;
}

export async function provisionSubscription(
  admin: any,
  userId: string,
  order: ProvisionOrder,
  paymentId: string
): Promise<ProvisionResult> {
  const notes = order.notes ?? {};
  if (notes.userId && notes.userId !== userId) {
    throw new Error('Order does not belong to this user');
  }
  const plan = getPlan(notes.planId);
  if (!plan) {
    throw new Error('Order does not match any plan');
  }
  const couponCode = normalizeCode(notes.couponCode);
  const coupon = couponCode ? getCoupon(couponCode) : null;
  const expectedPaise = discountedPaise(plan.pricePaise, coupon?.percent ?? 0);
  if (expectedPaise !== Number(order.amount)) {
    throw new Error('Order amount does not match any plan');
  }

  // Idempotency gate — one row per Razorpay order, no matter how many times
  // (or from how many entry points) this runs.
  const { data: existing, error: existingError } = await admin
    .from('subscriptions')
    .select('*')
    .eq('razorpay_order_id', order.id)
    .limit(1);
  if (existingError) {
    console.error('idempotency check failed', existingError);
    throw new Error('Failed to check existing subscription');
  }
  if (existing && existing.length > 0) {
    return { subscription: existing[0], alreadyProvisioned: true, upgraded: false };
  }

  const now = new Date();
  const { data: activeSubs, error: fetchError } = await admin
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .gt('ends_at', now.toISOString())
    .order('ends_at', { ascending: false })
    .limit(1);
  if (fetchError) {
    console.error('subscription fetch failed', fetchError);
    throw new Error('Failed to look up existing subscription');
  }
  const activeSub = activeSubs?.[0];

  // Stack on top of the remaining time (max of now vs current expiry).
  const base = activeSub && new Date(activeSub.ends_at) > now ? new Date(activeSub.ends_at) : now;
  const endsAt = addMonths(base, plan.months);

  const { data, error } = await admin
    .from('subscriptions')
    .insert({
      user_id: userId,
      plan_id: notes.planId,
      plan_name: plan.name,
      amount: Number(order.amount),
      status: 'active',
      razorpay_order_id: order.id,
      razorpay_payment_id: paymentId,
      starts_at: base.toISOString(),
      ends_at: endsAt.toISOString(),
    })
    .select()
    .single();
  if (error) {
    // A concurrent insert (webhook vs client verify) can win the race after
    // our check above. A unique violation means the other writer won — read
    // back their row instead of failing the customer.
    if (error.code === '23505') {
      const { data: raced } = await admin
        .from('subscriptions')
        .select('*')
        .eq('razorpay_order_id', order.id)
        .limit(1);
      if (raced && raced.length > 0) {
        return { subscription: raced[0], alreadyProvisioned: true, upgraded: false };
      }
    }
    console.error('subscription insert failed', error);
    throw new Error('Failed to record subscription');
  }
  return { subscription: data, alreadyProvisioned: false, upgraded: !!activeSub };
}
