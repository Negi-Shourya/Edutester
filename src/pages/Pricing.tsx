import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Shield, CreditCard, RefreshCw, Loader2 } from 'lucide-react';
import PricingCard from '../components/PricingCard';
import { pricingPlans } from '../data/pricing';
import { useAuth } from '../context/AuthContext';
import { checkoutPlan } from '../lib/razorpay';
import type { PricingPlan } from '../types';

const guarantees = [
  { icon: Shield, text: 'Secure payments with industry-standard encryption' },
  { icon: RefreshCw, text: 'Cancel anytime, no questions asked' },
  { icon: CreditCard, text: 'All major payment methods accepted' },
];

const faqs = [
  { q: 'Can I switch plans later?', a: 'Yes, you can upgrade or downgrade your plan at any time. The price difference will be adjusted accordingly.' },
  { q: 'Is there a free trial?', a: 'We offer a 3-day free trial with limited access to chapter-wise tests so you can experience the platform before subscribing.' },
  { q: 'What payment methods are accepted?', a: 'We accept UPI, credit/debit cards, net banking, and popular wallets like Paytm and Google Pay.' },
  { q: 'Can I get a refund?', a: 'Yes, we offer a 7-day money-back guarantee if you are not satisfied with our platform.' },
];

export default function Pricing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [checkoutPlanId, setCheckoutPlanId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleCheckout = async (plan: PricingPlan) => {
    setError(null);
    setSuccess(null);
    if (!user) {
      navigate('/login', { state: { from: '/pricing' } });
      return;
    }
    setCheckoutPlanId(plan.id);
    try {
      const result = await checkoutPlan({ id: plan.id, name: plan.duration });
      setSuccess(
        `Payment successful (ref ${result.paymentId}). Your ${plan.duration} subscription is now active.`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed. Please try again.');
    } finally {
      setCheckoutPlanId(null);
    }
  };

  return (
    <div>
      {/* Header */}
      <section className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Plan</h1>
          <p className="text-gray-500 max-w-xl mx-auto">Invest in your exam preparation with our affordable subscription plans. No hidden charges, cancel anytime.</p>
        </div>
      </section>

      {/* Plans */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {success && (
            <div className="max-w-2xl mx-auto mb-8 p-4 rounded-xl bg-green-50 border border-green-200 text-sm text-green-700">
              {success}
            </div>
          )}
          {error && (
            <div className="max-w-2xl mx-auto mb-8 p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {pricingPlans.map((plan) => (
              <PricingCard
                key={plan.id}
                plan={plan}
                onCheckout={handleCheckout}
                checkoutLoading={checkoutPlanId === plan.id}
              />
            ))}
          </div>

          {checkoutPlanId && (
            <div className="flex items-center justify-center gap-2 mt-8 text-sm text-gray-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              Opening secure checkout...
            </div>
          )}

          <div className="flex flex-wrap items-center justify-center gap-6 mt-10 text-sm text-gray-500">
            {guarantees.map((g, i) => (
              <div key={i} className="flex items-center gap-2">
                <g.icon className="w-4 h-4 text-primary" />
                {g.text}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Compare Plans</h2>
          <div className="max-w-3xl mx-auto overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Features</th>
                  {pricingPlans.map((p) => (
                    <th key={p.id} className="text-center py-3 px-4 font-semibold text-gray-900">{p.duration}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  'Chapter-wise Tests',
                  'Paper-wise Tests',
                  'NTA-like Interface',
                  'Detailed Analytics',
                  'Progress Tracking',
                  'Priority Support',
                  'Custom Test Creation',
                  'AI Recommendations',
                  'Doubt Solving',
                ].map((feature) => (
                  <tr key={feature} className="border-b border-gray-100">
                    <td className="py-3 px-4 text-gray-700">{feature}</td>
                    {pricingPlans.map((p, i) => (
                      <td key={p.id} className="text-center py-3 px-4">
                        {i >= 0 && (['Chapter-wise Tests', 'Paper-wise Tests', 'NTA-like Interface', 'Detailed Analytics', 'Progress Tracking'].includes(feature)) ? (
                          <Check className="w-4 h-4 text-success mx-auto" />
                        ) : i >= 1 && feature === 'Priority Support' ? (
                          <Check className="w-4 h-4 text-success mx-auto" />
                        ) : i >= 2 && ['Custom Test Creation'].includes(feature) ? (
                          <Check className="w-4 h-4 text-success mx-auto" />
                        ) : i >= 3 && ['AI Recommendations', 'Doubt Solving'].includes(feature) ? (
                          <Check className="w-4 h-4 text-success mx-auto" />
                        ) : (
                          <span className="text-gray-300">&mdash;</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <details key={i} className="bg-white border border-gray-200 rounded-xl p-4 group">
                <summary className="font-medium text-gray-900 cursor-pointer list-none flex items-center justify-between">
                  {faq.q}
                  <span className="text-primary group-open:rotate-45 transition-transform text-xl leading-none">+</span>
                </summary>
                <p className="mt-3 text-sm text-gray-500 leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
