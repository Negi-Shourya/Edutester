import { useEffect, useState } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { Check, Shield, CreditCard, Loader2 } from 'lucide-react';
import PricingCard from '../components/PricingCard';
import { pricingPlans } from '../data/pricing';
import { useAuth } from '../context/auth-context';
import { useSubscriptionAccess } from '../lib/subscription';
import { checkoutPlan } from '../lib/razorpay';
import type { PricingPlan } from '../types';

const guarantees = [
  { icon: Shield, text: 'Secure payments with industry-standard encryption' },
  { icon: CreditCard, text: 'All major payment methods accepted' },
];

const faqs = [
  { q: 'Can I switch plans later?', a: 'Yes, you can upgrade at any time.' },
  { q: 'Is there a free trial?', a: 'No, there isn\'t a free trial, but there are a few papers for free which you could solve.' },
  { q: 'What payment methods are accepted?', a: 'All debit cards, credit cards, and UPI options are available.' },
  { q: 'Can I get a refund?', a: 'No, you cannot get a refund once you have purchased a subscription.' },
  { q: 'Where can I contact for help?', a: 'You can contact us at edutester4u@gmail.com, and we will get back to you within 48 hours.' },
];

export default function Pricing() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { activeSubscription, loading: subscriptionLoading, refresh: refreshSubscription } =
    useSubscriptionAccess();
  const [checkoutPlanId, setCheckoutPlanId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (location.hash === '#faq') {
      const el = document.getElementById('faq');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [location.hash]);

  const activePlanIndex = activeSubscription
    ? pricingPlans.findIndex((p) => p.id === activeSubscription.plan_id)
    : -1;

  // Months of the user's current active plan (0 if none).
  const currentPlanMonths = activeSubscription
    ? pricingPlans.find((p) => p.id === activeSubscription.plan_id)?.months ?? 0
    : 0;

  const handleCheckout = async (plan: PricingPlan) => {
    setError(null);
    setSuccess(null);
    if (!user) {
      navigate('/login', { state: { from: '/pricing' } });
      return;
    }
    // Block buying a plan that is LESS than the active plan — that would be
    // a downgrade. Buying the same plan (renewal) or a higher plan (upgrade)
    // is allowed: both add the purchased time on top of the current expiry.
    if (activeSubscription && plan.months < currentPlanMonths) {
      setError(
        `You already have the ${activeSubscription.plan_name} plan active until ${new Date(
          activeSubscription.ends_at
        ).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}. ` +
          `Please choose a plan with a longer duration to upgrade.`
      );
      return;
    }
    const isUpgrade = !!activeSubscription;
    setCheckoutPlanId(plan.id);
    try {
      const result = await checkoutPlan({ id: plan.id, name: plan.duration });
      await refreshSubscription();
      setSuccess(
        isUpgrade
          ? `Payment successful (ref ${result.paymentId}). Your plan has been upgraded to ${plan.duration} — your existing time was added on top of it.`
          : `Payment successful (ref ${result.paymentId}). Your ${plan.duration} subscription is now active.`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed. Please try again.');
    } finally {
      setCheckoutPlanId(null);
    }
  };

  // Users with an active subscription manage their plan from the Profile
  // page — the pricing page is for buyers only.
  if (!subscriptionLoading && activeSubscription) {
    return <Navigate to="/profile" replace />;
  }

  return (
    <div>
      {/* Header */}
      <section className="bg-gradient-to-br from-paper via-white to-primary/5 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 text-saffron text-sm font-semibold uppercase tracking-wider mb-3 font-mono">
            <Shield className="w-4 h-4" /> Pricing
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight font-display animate-fade-up">Choose Your Plan</h1>
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
            {pricingPlans.map((plan, i) => (
              <PricingCard
                key={plan.id}
                plan={plan}
                onCheckout={handleCheckout}
                checkoutLoading={checkoutPlanId === plan.id}
                active={!subscriptionLoading && activeSubscription?.plan_id === plan.id}
                activeExpiry={activeSubscription?.ends_at}
                lowerThanCurrent={
                  !!activeSubscription && plan.months < currentPlanMonths
                }
                nextPlan={i === activePlanIndex ? (pricingPlans[i + 1] ?? null) : undefined}
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
      <section className="bg-paper py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8 font-display">Compare Plans</h2>
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
                  'NTA-like Interface',
                  'Previous Year Question Papers',
                  'Test Series',
                  'Support for Questions & Issues',
                ].map((feature) => (
                  <tr key={feature} className="border-b border-gray-100">
                    <td className="py-3 px-4 text-gray-700">{feature}</td>
                    {pricingPlans.map((p) => (
                      <td key={p.id} className="text-center py-3 px-4">
                        <Check className="w-4 h-4 text-success mx-auto" />
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
      <section id="faq" className="py-16 scroll-mt-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8 font-display">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <details key={i} className="bg-white border border-gray-200 rounded-xl p-4 group">
                <summary className="font-medium text-gray-900 cursor-pointer list-none flex items-center justify-between">
                  {faq.q}
                  <span className="text-primary group-open:rotate-45 transition-transform text-xl leading-none">+</span>
                </summary>
                <p className="mt-3 text-sm text-gray-500 leading-relaxed">
                  {faq.a.includes('edutester4u@gmail.com') ? (
                    <>
                      You can contact us at{' '}
                      <a href="mailto:edutester4u@gmail.com" className="text-primary hover:underline font-medium">
                        edutester4u@gmail.com
                      </a>
                      , and we will get back to you within 48 hours.
                    </>
                  ) : (
                    faq.a
                  )}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
