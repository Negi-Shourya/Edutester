import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Check, Loader2, ShieldCheck, ArrowRight } from 'lucide-react';
import type { PricingPlan } from '../types';

interface Props {
  plan: PricingPlan;
  onCheckout: (plan: PricingPlan) => void;
  checkoutLoading?: boolean;
  active?: boolean;
  activeExpiry?: string | null;
  lowerThanCurrent?: boolean;
  nextPlan?: PricingPlan | null;
  /** Percentage off to display when a coupon is applied. Display only — the
   *  amount actually charged is decided server-side at checkout. */
  discountPercent?: number;
}

function formatExpiry(iso: string | null | undefined): string {
  if (!iso) return 'N/A';
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export default function PricingCard({
  plan,
  onCheckout,
  checkoutLoading,
  active = false,
  activeExpiry,
  lowerThanCurrent = false,
  nextPlan,
  discountPercent = 0,
}: Props) {
  const [showActiveInfo, setShowActiveInfo] = useState(false);
  // Computed in paise and rounded the same way the server does, so the card
  // quotes exactly what checkout will charge. Trailing paise are shown in full
  // (₹17.10, not ₹17.1) and dropped entirely when the total is whole rupees.
  const discountedPaise =
    discountPercent > 0
      ? Math.round((plan.price * 100 * (100 - discountPercent)) / 100)
      : null;
  const discounted =
    discountedPaise === null
      ? null
      : discountedPaise % 100 === 0
        ? String(discountedPaise / 100)
        : (discountedPaise / 100).toFixed(2);

  return (
    <motion.div
      className={`relative bg-white rounded-2xl border-2 p-6 transition-[box-shadow] hover:shadow-xl ${
        active ? 'border-green-400 shadow-md' : plan.popular ? 'border-primary shadow-lg scale-105' : 'border-gray-100'
      }`}
      whileHover={{ y: -8, scale: plan.popular ? 1.06 : 1.005 }}
      whileTap={{ scale: plan.popular ? 1.03 : 0.995 }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
    >
      {active ? (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-600 text-white px-4 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap">
          Your Current Plan
        </div>
      ) : lowerThanCurrent ? (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gray-400 text-white px-4 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap">
          Lower than your plan
        </div>
      ) : plan.popular ? (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white px-4 py-0.5 rounded-full text-xs font-semibold">
          Most Popular
        </div>
      ) : null}
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">{plan.duration}</h3>
        <div className="mt-3">
          {discounted !== null ? (
            <>
              <span className="text-lg text-gray-400 line-through mr-2">₹{plan.price}</span>
              <span className="text-4xl font-bold text-gray-900">₹{discounted}</span>
              <span className="block mt-1 text-xs font-semibold text-green-700">
                {discountPercent}% off applied
              </span>
            </>
          ) : (
            <span className="text-4xl font-bold text-gray-900">₹{plan.price}</span>
          )}
        </div>
        <p className="text-sm text-gray-500 mt-1">₹{plan.pricePerMonth.toFixed(2)}/month</p>
      </div>
      <ul className="space-y-3 mb-6">
        {plan.features.map((feature, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
            <Check className="w-4 h-4 text-success mt-0.5 shrink-0" />
            {feature}
          </li>
        ))}
      </ul>
      <motion.button
        onClick={() => (active || lowerThanCurrent ? setShowActiveInfo((v) => !v) : onCheckout(plan))}
        disabled={checkoutLoading}
        whileTap={{ scale: 0.97 }}
        className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-60 ${
          active
            ? 'bg-green-600 text-white hover:bg-green-700'
            : lowerThanCurrent
              ? 'bg-gray-100 text-gray-500 hover:bg-gray-200 border border-gray-200'
              : plan.popular
                ? 'bg-primary text-white hover:bg-primary-dark active:scale-[0.98]'
                : 'bg-gray-50 text-gray-900 hover:bg-gray-100 border border-gray-200'
        }`}
      >
        {checkoutLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : active ? <ShieldCheck className="w-4 h-4" /> : null}
        {checkoutLoading
          ? 'Processing...'
          : active
            ? `Active · until ${formatExpiry(activeExpiry)}`
            : lowerThanCurrent
              ? 'You are on a better plan'
              : 'Get Started'}
      </motion.button>

      <AnimatePresence initial={false}>
        {(active || lowerThanCurrent) && showActiveInfo && (
          <motion.div
            key="active-info"
            className={`mt-3 p-4 rounded-xl border text-sm overflow-hidden ${
              lowerThanCurrent ? 'bg-gray-50 border-gray-200' : 'bg-green-50 border-green-200'
            }`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
          {lowerThanCurrent ? (
            <>
              <p className="font-semibold text-gray-700">This plan is lower than your current plan.</p>
              <p className="text-gray-600 mt-1 text-xs leading-relaxed">
                Your current plan is already active until {formatExpiry(activeExpiry)}. To extend your
                access, please choose a plan with a longer duration than your current one.
              </p>
            </>
          ) : (
            <>
              <p className="font-semibold text-green-800">This plan is already active.</p>
              <p className="text-green-700 mt-1 text-xs leading-relaxed">
                Your subscription runs until {formatExpiry(activeExpiry)}. You can upgrade anytime to
                extend your access with better benefits.
              </p>
              {nextPlan ? (
                <button
                  onClick={() => onCheckout(nextPlan)}
                  className="mt-3 w-full flex items-center justify-center gap-1.5 bg-green-600 text-white py-2.5 rounded-lg text-xs font-semibold hover:bg-green-700 transition-colors"
                >
                  Upgrade to {nextPlan.duration}
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <p className="mt-3 text-xs text-green-700 font-medium">
                  You're on our highest plan — nothing more to upgrade to!
                </p>
              )}
            </>
          )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
