import { useState } from 'react';
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
}: Props) {
  const [showActiveInfo, setShowActiveInfo] = useState(false);

  return (
    <div className={`relative bg-white rounded-2xl border-2 p-6 transition-all hover:shadow-xl ${
      active ? 'border-green-400 shadow-md' : plan.popular ? 'border-primary shadow-lg scale-105' : 'border-gray-100'
    }`}>
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
          <span className="text-4xl font-bold text-gray-900">₹{plan.price}</span>
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
      <button
        onClick={() => (active || lowerThanCurrent ? setShowActiveInfo((v) => !v) : onCheckout(plan))}
        disabled={checkoutLoading}
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
      </button>

      {(active || lowerThanCurrent) && showActiveInfo && (
        <div className={`mt-3 p-4 rounded-xl border text-sm ${lowerThanCurrent ? 'bg-gray-50 border-gray-200' : 'bg-green-50 border-green-200'}`}>
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
        </div>
      )}
    </div>
  );
}
