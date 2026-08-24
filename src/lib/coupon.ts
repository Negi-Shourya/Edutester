import { supabase } from './supabase';

export interface CouponApplied {
  valid: true;
  code: string;
  /** Discount to display. The server decides what is actually charged. */
  discountPercent: number;
  amountPaise: number;
  originalAmountPaise: number;
  message: string;
}

export interface CouponRejected {
  valid: false;
  reason: 'invalid' | 'exhausted' | 'already_redeemed';
  message: string;
}

export type CouponResult = CouponApplied | CouponRejected;

/**
 * Checks a coupon code against a plan. Applying is free of side effects — the
 * code is not spent until a subscription is actually created, so a student can
 * try a code, close the tab, and still have it available later.
 */
export async function applyCoupon(code: string, planId: string): Promise<CouponResult> {
  const { data, error } = await supabase.functions.invoke('coupon-apply', {
    body: { couponCode: code, planId },
  });
  if (error) throw new Error(error.message || 'Could not check that coupon.');
  if (data?.error) throw new Error(data.error);
  return data as CouponResult;
}
