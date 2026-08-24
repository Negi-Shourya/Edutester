// Plan catalogue and date maths shared by razorpay-create-order,
// razorpay-verify and coupon-apply. Defined server-side and never trusted from
// the client: the browser sends a planId, the price always comes from here.
// Price is in paise (INR).
export const PLANS = {
  '1month': { name: '1 Month', pricePaise: 1900, months: 1 },
  '3months': { name: '3 Months', pricePaise: 5000, months: 3 },
  '6months': { name: '6 Months', pricePaise: 9400, months: 6 },
  '1year': { name: '1 Year', pricePaise: 15900, months: 12 },
} as const;

export type PlanId = keyof typeof PLANS;
export type Plan = (typeof PLANS)[PlanId];

export function getPlan(planId: unknown): Plan | null {
  if (typeof planId !== 'string') return null;
  return PLANS[planId as PlanId] ?? null;
}

// Adds whole calendar months without the setMonth() overflow bug
// (e.g. Jan 31 + 1 month must land on Feb 28/29, not March 3).
export function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  const day = result.getDate();
  result.setDate(1);
  result.setMonth(result.getMonth() + months);
  const lastDay = new Date(result.getFullYear(), result.getMonth() + 1, 0).getDate();
  result.setDate(Math.min(day, lastDay));
  return result;
}
