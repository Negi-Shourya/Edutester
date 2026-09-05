import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { Check, Shield, CreditCard, Loader2, Tag, X } from 'lucide-react';
import PricingCard from '../components/PricingCard';
import StaggerReveal, { StaggerItem } from '../components/StaggerReveal';
import { pricingPlans } from '../data/pricing';
import { useAuth } from '../context/auth-context';
import { useSubscriptionAccess } from '../lib/subscription';
import { checkoutPlan, resumePendingOrder, PaymentError } from '../lib/razorpay';
import { applyCoupon, type CouponApplied } from '../lib/coupon';
import type { PricingPlan } from '../types';
import { setPageMeta } from '../lib/pageMeta';

// The launch code students are told about on this page.
const PROMO_CODE = 'First50';

const guarantees = [
  { icon: Shield, text: 'Secure payments with industry-standard encryption' },
  { icon: CreditCard, text: 'All major payment methods accepted' },
];

const faqs = [
  { q: 'Can I switch plans later?', a: 'Yes, you can upgrade at any time.' },
  {
    q: 'Is there a free trial?',
    a: 'Yes! Take a free demo test on the real NTA interface plus free trial full papers before subscribing — no payment details needed.',
  },
  { q: 'What payment methods are accepted?', a: 'All debit cards, credit cards, and UPI options are available.' },
  { q: 'Can I get a refund?', a: 'No, you cannot get a refund once you have purchased a subscription.' },
  { q: 'Where can I contact for help?', a: 'You can contact us at help@edutester.in, and we will get back to you within 48 hours.' },
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
  const [openFaq, setOpenFaq] = useState(-1);

  // Coupon state. `coupon` holds the applied code and the discount to show;
  // whether it is honoured, and by how much, is decided server-side at
  // checkout — this is display only.
  const [couponInput, setCouponInput] = useState('');
  const [coupon, setCoupon] = useState<CouponApplied | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponChecking, setCouponChecking] = useState(false);

  const handleApplyCoupon = async () => {
    const code = couponInput.trim();
    if (!code) return;
    if (!user) {
      navigate('/login', { state: { from: '/pricing' } });
      return;
    }
    setCouponError(null);
    setCouponChecking(true);
    try {
      // Validated against a plan so the server can quote a real total. The
      // discount is a percentage, so the quote holds for whichever plan the
      // student then picks.
      const result = await applyCoupon(code, pricingPlans[0].id);
      if (result.valid) {
        setCoupon(result);
        setCouponError(null);
      } else {
        setCoupon(null);
        setCouponError(result.message);
      }
    } catch (err) {
      setCoupon(null);
      setCouponError(err instanceof Error ? err.message : 'Could not check that coupon.');
    } finally {
      setCouponChecking(false);
    }
  };

  const clearCoupon = () => {
    setCoupon(null);
    setCouponInput('');
    setCouponError(null);
  };

  useEffect(() => {
    setPageMeta(
      'Pricing — NEET Test Series 2026 & JEE Main Mock Test from ₹19 | EduTester',
      'Subscribe to the NEET test series 2026 & JEE Main mock tests: NEET PYQs with solutions, chapter-wise tests and full papers from ₹19/month.'
    );
  }, []);

  useEffect(() => {
    if (location.hash === '#faq') {
      const el = document.getElementById('faq');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [location.hash]);

  // Recover an interrupted checkout (internet lost after the bank approved
  // the payment). If the pending order was actually paid, access is
  // activated here instead of asking the user to pay again.
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    resumePendingOrder()
      .then(async (res) => {
        if (cancelled || !res.recovered) return;
        await refreshSubscription();
        if (!cancelled) {
          setSuccess(
            'Good news — we found your interrupted payment and your subscription is now active. No extra charge was made.'
          );
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

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
      const result = await checkoutPlan({ id: plan.id, name: plan.duration }, coupon?.code);
      await refreshSubscription();
      const opening = `Payment successful (ref ${result.paymentId}).`;
      setSuccess(
        isUpgrade
          ? `${opening} Your plan has been upgraded to ${plan.duration} — your existing time was added on top of it.`
          : `${opening} Your ${plan.duration} subscription is now active.`
      );
    } catch (err) {
      // Connection lost during confirmation: the bank may still have taken
      // the payment, so check once right away before showing the message.
      if (err instanceof PaymentError && err.code === 'VERIFY_NETWORK') {
        try {
          const recovered = await resumePendingOrder();
          if (recovered.recovered) {
            await refreshSubscription();
            setSuccess(
              'Payment confirmed — your subscription is now active. No extra charge was made.'
            );
            return;
          }
        } catch {
          // Fall through to the pending message below; the mount effect
          // and the webhook will keep trying.
        }
      }
      const message = err instanceof Error ? err.message : 'Payment failed. Please try again.';
      // The promo can run out between applying the code and paying, so the
      // banner has to fall back to the sold-out state rather than leaving a
      // discount on screen that no longer exists.
      if (message.includes('late !!!')) {
        setCoupon(null);
        setCouponError(message);
      }
      setError(message);
    } finally {
      setCheckoutPlanId(null);
    }
  };

  // Subscribers see this page too. PricingCard badges the plan they are on,
  // disables anything shorter, and offers the next tier up — so the upgrade
  // flow lives here. It used to redirect active subscribers to /profile on the
  // theory that they manage their plan there, but Profile's plan grid is hidden
  // once a subscription exists, so between the two pages there was no way to
  // upgrade or renew at all.

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

          {/* Launch promo + coupon entry. Shown to existing subscribers too:
              the promo is one use per person rather than new-customers-only, so
              someone renewing or upgrading still has their single use to spend. */}
          <div className="max-w-md mx-auto mb-10">
            {coupon ? (
              <div className="flex items-center justify-between gap-3 p-4 rounded-xl bg-green-50 border border-green-200">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Tag className="w-4 h-4 text-green-600 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-green-800 truncate">
                      {coupon.code} applied
                    </p>
                    <p className="text-xs text-green-700">
                      {coupon.discountPercent}% off — applied at checkout
                    </p>
                  </div>
                </div>
                <button
                  onClick={clearCoupon}
                  aria-label="Remove coupon"
                  className="p-1.5 rounded-lg text-green-700 hover:bg-green-100 transition-colors shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-white border border-stone-200 shadow-sm">
                <p className="text-sm text-gray-600 mb-3">
                  <span className="font-semibold text-gray-900">10% off</span> for the first 50
                  subscribers — use code{' '}
                  <span className="font-mono font-semibold text-primary">{PROMO_CODE}</span>
                </p>
                <div className="flex gap-2">
                  <input
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') void handleApplyCoupon();
                    }}
                    placeholder="Enter coupon code"
                    aria-label="Coupon code"
                    autoComplete="off"
                    spellCheck={false}
                    className="flex-1 min-w-0 px-3 py-2.5 rounded-lg border border-stone-200 text-sm uppercase placeholder:normal-case placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  />
                  <button
                    onClick={() => void handleApplyCoupon()}
                    disabled={couponChecking || !couponInput.trim()}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-primary text-white text-sm font-semibold hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity shrink-0"
                  >
                    {couponChecking ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Tag className="w-4 h-4" />
                    )}
                    Apply Coupon
                  </button>
                </div>
                {couponError && (
                  <p className="mt-2.5 text-sm text-red-600 font-medium">{couponError}</p>
                )}
              </div>
            )}
          </div>

          <StaggerReveal className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {pricingPlans.map((plan, i) => (
              <StaggerItem key={plan.id}>
              <PricingCard
                plan={plan}
                onCheckout={handleCheckout}
                checkoutLoading={checkoutPlanId === plan.id}
                active={!subscriptionLoading && activeSubscription?.plan_id === plan.id}
                activeExpiry={activeSubscription?.ends_at}
                lowerThanCurrent={
                  !!activeSubscription && plan.months < currentPlanMonths
                }
                nextPlan={i === activePlanIndex ? (pricingPlans[i + 1] ?? null) : undefined}
                discountPercent={coupon?.discountPercent ?? 0}
              />
              </StaggerItem>
            ))}
          </StaggerReveal>

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
                  '54+ Chapter-wise Tests (JEE & NEET)',
                  'Full Past Year Question Papers',
                  'Instant Scoring & Step-by-Step Solutions',
                  'Performance Analytics & Weakness Tracker',
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
            {faqs.map((faq, i) => {
              const open = openFaq === i;
              return (
                <motion.div
                  key={i}
                  className="bg-white border border-gray-200 rounded-xl overflow-hidden"
                  animate={{ borderColor: open ? '#F59E0B' : '#E5E7EB' }}
                  transition={{ duration: 0.25 }}
                >
                  <button
                    onClick={() => setOpenFaq(open ? -1 : i)}
                    className="w-full flex items-center justify-between gap-4 px-4 py-4 text-left group"
                  >
                    <span className="font-medium text-gray-900">{faq.q}</span>
                    <motion.span
                      className="text-primary text-xl leading-none shrink-0"
                      animate={{ rotate: open ? 45 : 0 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                    >
                      +
                    </motion.span>
                  </button>
                  <AnimatePresence initial={false}>
                    {open && (
                      <motion.div
                        key="answer"
                        className="overflow-hidden"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      >
                        <p className="px-4 pb-4 text-sm text-gray-500 leading-relaxed">
                          {faq.a.includes('help@edutester.in') ? (
                            <>
                              You can contact us at{' '}
                              <a href="mailto:help@edutester.in" className="text-primary hover:underline font-medium">
                                help@edutester.in
                              </a>
                              , and we will get back to you within 48 hours.
                            </>
                          ) : (
                            faq.a
                          )}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
