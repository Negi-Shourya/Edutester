import { Check, Loader2 } from 'lucide-react';
import type { PricingPlan } from '../types';

interface Props {
  plan: PricingPlan;
  onCheckout: (plan: PricingPlan) => void;
  checkoutLoading?: boolean;
}

export default function PricingCard({ plan, onCheckout, checkoutLoading }: Props) {
  return (
    <div className={`relative bg-white rounded-2xl border-2 p-6 transition-all hover:shadow-xl ${
      plan.popular ? 'border-primary shadow-lg scale-105' : 'border-gray-100'
    }`}>
      {plan.popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white px-4 py-0.5 rounded-full text-xs font-semibold">
          Most Popular
        </div>
      )}
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
        onClick={() => onCheckout(plan)}
        disabled={checkoutLoading}
        className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-60 ${
          plan.popular
            ? 'bg-primary text-white hover:bg-primary-dark'
            : 'bg-gray-50 text-gray-900 hover:bg-gray-100 border border-gray-200'
        }`}
      >
        {checkoutLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
        {checkoutLoading ? 'Processing...' : 'Get Started'}
      </button>
    </div>
  );
}
