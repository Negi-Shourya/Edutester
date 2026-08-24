// deno-lint-ignore-file no-explicit-any
import { PLANS, type PlanId } from './plans.ts';

type Admin = any;

/**
 * Launch-promo coupons.
 *
 * A plain percentage discount applied through Razorpay: the total the pricing
 * page quotes is the total that gets charged, and every purchase goes through
 * checkout. An earlier revision advertised 10% but silently granted the plan
 * outright; that path is gone, because Razorpay rejects orders under ₹1 and a
 * free grant therefore has to skip checkout altogether.
 *
 * `maxSubscribers` closes the promo. FIRST50 is for the first 50 people to
 * subscribe — once there are that many the code stops working and the page says
 * "Sorry, you are late !!!".
 */
export const COUPONS: Record<string, {
  percent: number;
  maxSubscribers: number;
}> = {
  FIRST50: { percent: 10, maxSubscribers: 50 },
};

export function normalizeCode(code: unknown): string | null {
  if (typeof code !== 'string') return null;
  const trimmed = code.trim().toUpperCase();
  // Codes are short and alphanumeric.
  if (!/^[A-Z0-9]{3,32}$/.test(trimmed)) return null;
  return trimmed;
}

export function getCoupon(code: string) {
  return COUPONS[code] ?? null;
}

/**
 * Discounted total in paise, floored at 100 (₹1) because Razorpay rejects
 * anything smaller. The floor also means no coupon — not even a
 * misconfigured 100% one — can produce a zero-amount order that has no way
 * through checkout.
 */
export function discountedPaise(pricePaise: number, percent: number): number {
  const capped = Math.min(Math.max(percent, 0), 100);
  const discounted = Math.round((pricePaise * (100 - capped)) / 100);
  return Math.max(100, discounted);
}

// One column of one row per subscription; read only when a coupon is in play.
// The cap is 50 people, so this is far more rows than the answer can need — see
// countSubscribers for what happens in the impossible case that it isn't.
const SCAN_LIMIT = 1000;

/**
 * How many distinct people already hold a subscription. Counted in people
 * rather than rows so that renewals by the same account don't burn through the
 * promo.
 *
 * Reads the OLDEST rows, because "the first 50 subscribers" is a prefix of
 * signup order: once 50 distinct users appear in that prefix the promo is over
 * and stays over. Should the table ever hold more than SCAN_LIMIT rows with
 * fewer than 50 distinct users among them, this under-counts and the promo runs
 * a little longer than it should — the generous direction to fail in.
 */
export async function countSubscribers(admin: Admin): Promise<number> {
  const { data, error } = await admin
    .from('subscriptions')
    .select('user_id')
    .order('created_at', { ascending: true })
    .limit(SCAN_LIMIT);
  if (error) throw new Error(`subscriber count failed: ${error.message}`);
  return new Set((data ?? []).map((row: { user_id: string }) => row.user_id)).size;
}

/**
 * Whether this account has already used a given coupon. One use per person,
 * and only counted once a payment has actually gone through — an abandoned or
 * failed checkout writes no subscription row, so it spends nothing.
 *
 * A use shows up on a subscription row in one of two ways:
 *  - `coupon:<CODE>:slot:<n>` in razorpay_order_id — a legacy free grant, left
 *    over from the revision that gave the plan away instead of discounting it.
 *  - an `amount` below the plan's list price — the row was paid for at a
 *    discount, and a coupon is the only thing that produces one.
 *
 * The second test is an inference rather than a record, because `subscriptions`
 * has no coupon column and adding one needs DDL the service-role key cannot
 * run. It holds while list prices hold: if a price is ever RAISED, rows bought
 * at the old price start to look discounted and those customers would lose
 * access to the promo. Storing the code on the row is the real fix, whenever a
 * migration can be applied.
 *
 * Note this deliberately does NOT bar people who have subscribed before. The
 * promo is one-per-person, not new-customers-only, so someone with earlier
 * purchases still gets their single use.
 */
export async function userHasUsedCoupon(
  admin: Admin,
  code: string,
  userId: string
): Promise<boolean> {
  const { data, error } = await admin
    .from('subscriptions')
    .select('plan_id, amount, razorpay_order_id')
    .eq('user_id', userId);
  if (error) throw new Error(`coupon lookup failed: ${error.message}`);

  return (data ?? []).some((row: { plan_id: string; amount: number; razorpay_order_id: string | null }) => {
    if (String(row.razorpay_order_id ?? '').startsWith(`coupon:${code}:`)) return true;
    const plan = PLANS[row.plan_id as PlanId];
    return !!plan && row.amount < plan.pricePaise;
  });
}
