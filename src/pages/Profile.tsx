import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Mail, Calendar, Clock, BadgeCheck, Crown, Sparkles, ArrowRight,
  Loader2, ShieldCheck, Zap,
} from 'lucide-react';
import { useAuth } from '../context/auth-context';
import { supabase } from '../lib/supabase';
import { formatINR } from '../lib/admin';
import { pricingPlans } from '../data/pricing';
import { checkoutPlan } from '../lib/razorpay';
import { getExam, setExam, type ExamType } from '../lib/exam';
import { GraduationCap } from 'lucide-react';
import type { PricingPlan, Subscription } from '../types';

function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function daysRemaining(endsAt: string): number {
  const ms = new Date(endsAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / 86400000));
}

// "3 months, 4 days" when longer than a month, otherwise "12 days".
function remainingLabel(endsAt: string): string {
  const days = daysRemaining(endsAt);
  if (days >= 30) {
    const months = Math.floor(days / 30);
    const remDays = days % 30;
    if (remDays === 0) return `${months} month${months > 1 ? 's' : ''}`;
    return `${months} month${months > 1 ? 's' : ''}, ${remDays} day${remDays > 1 ? 's' : ''}`;
  }
  return `${days} day${days === 1 ? '' : 's'}`;
}

export default function Profile() {
  const { user } = useAuth();
  const [exam, setExamState] = useState<ExamType>(getExam());
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkoutPlanId, setCheckoutPlanId] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [checkoutSuccess, setCheckoutSuccess] = useState<string | null>(null);

  const loadSubscriptions = useCallback(async () => {
    if (!user) return;
    const { data, error: err } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(100);
    if (err) {
      setError(err.message);
    } else {
      setSubscriptions((data ?? []) as Subscription[]);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      if (cancelled) return;
      await loadSubscriptions();
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [user, loadSubscriptions]);

  const nowIso = new Date().toISOString();
  // All unexpired purchase rows — with stacking, several rows may overlap.
  const active = subscriptions.filter(
    (s) => s.status === 'active' && s.ends_at > nowIso
  );
  const hasActive = active.length > 0;

  // The whole stack expires when the latest purchase ends.
  const activeUntil = active.reduce(
    (max, s) => (s.ends_at > max ? s.ends_at : max),
    ''
  );
  // The stack started with the earliest purchase.
  const stackStart = active.reduce(
    (min, s) => (s.starts_at < min ? s.starts_at : min),
    active[0]?.starts_at ?? ''
  );
  // The "current plan" is the longest plan among unexpired purchases.
  const bestPlan = active
    .map((s) => pricingPlans.find((p) => p.id === s.plan_id))
    .filter((p): p is PricingPlan => !!p)
    .sort((a, b) => b.months - a.months)[0] ?? null;
  const currentPlanMonths = bestPlan?.months ?? 0;

  const handleCheckout = async (plan: PricingPlan) => {
    setCheckoutError(null);
    setCheckoutSuccess(null);
    // Buying a shorter plan than the active one is a downgrade, and since every
    // purchase stacks its months onto the existing expiry it would silently
    // charge for less time than the plan implies. Renewing the same plan or
    // moving up is fine — both just extend the end date.
    if (hasActive && plan.months < currentPlanMonths) {
      setCheckoutError(
        `Your ${bestPlan?.duration} plan is active until ${formatDate(activeUntil)}. ` +
          `Pick a plan at least that long to upgrade.`
      );
      return;
    }
    setCheckoutPlanId(plan.id);
    try {
      const result = await checkoutPlan({ id: plan.id, name: plan.duration });
      await loadSubscriptions();
      const newExpiry = (result.subscription?.ends_at as string | undefined) ?? null;
      setCheckoutSuccess(
        `Payment successful (ref ${result.paymentId}). Your access now runs until ${formatDate(newExpiry)}.`
      );
    } catch (err) {
      setCheckoutError(err instanceof Error ? err.message : 'Payment failed. Please try again.');
    } finally {
      setCheckoutPlanId(null);
    }
  };

  // Progress of the whole stacked subscription (elapsed / total).
  const activeProgress =
    hasActive && activeUntil && stackStart
      ? (() => {
          const totalMs = new Date(activeUntil).getTime() - new Date(stackStart).getTime();
          if (totalMs <= 0) return 0;
          const elapsed = Math.min(
            Math.max(Date.now() - new Date(stackStart).getTime(), 0),
            totalMs
          );
          return Math.round((elapsed / totalMs) * 100);
        })()
      : 0;

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight font-display animate-fade-up">My Profile</h1>
            <p className="text-gray-500 mt-1">Your account details and subscriptions</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: user details */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 text-center">
              {user?.user_metadata?.avatar_url ? (
                <img
                  src={user.user_metadata.avatar_url as string}
                  alt=""
                  className="w-20 h-20 rounded-full mx-auto mb-4 border-4 border-white shadow-md"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary-dark text-white flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-md">
                  {(user?.email ?? '?')[0].toUpperCase()}
                </div>
              )}
              <h2 className="text-lg font-bold text-gray-900">
                {(user?.user_metadata?.full_name as string | undefined) ?? 'Student'}
              </h2>
              <p className="text-sm text-gray-500 mt-1 flex items-center justify-center gap-1.5">
                <Mail className="w-3.5 h-3.5" />
                {user?.email}
              </p>
              <div className="mt-5 space-y-2.5 text-sm text-left">
                <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                  <span className="text-gray-500 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" /> Member since
                  </span>
                  <span className="font-medium text-gray-900">{formatDate(user?.created_at)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" /> Last login
                  </span>
                  <span className="font-medium text-gray-900">{formatDate(user?.last_sign_in_at)}</span>
                </div>
              </div>
            </div>

            {/* Exam track */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-1">
                <GraduationCap className="w-4 h-4 text-primary" />
                Exam track
              </h3>
              <p className="text-xs text-gray-500 mb-4">
                Switch between JEE Main and NEET content.
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => { setExam('jee'); setExamState('jee'); }}
                  className={`rounded-xl border-2 px-3 py-2.5 text-sm font-semibold transition-all ${
                    exam === 'jee'
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
                >
                  JEE Main
                </button>
                <button
                  onClick={() => { setExam('neet'); setExamState('neet'); }}
                  className={`rounded-xl border-2 px-3 py-2.5 text-sm font-semibold transition-all ${
                    exam === 'neet'
                      ? 'border-green-600 bg-green-50 text-green-700'
                      : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
                >
                  NEET
                </button>
              </div>
            </div>

            {!hasActive && (
              <div className="bg-gradient-to-br from-primary/5 to-saffron/5 border border-primary/10 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <h3 className="font-semibold text-gray-900">No active subscription</h3>
                </div>
                <p className="text-sm text-gray-500 mb-4">
                  Unlock every test and full paper with a plan that fits you.
                </p>
                <Link
                  to="/pricing"
                  className="w-full flex items-center justify-center gap-2 bg-primary text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-dark transition-colors"
                >
                  View Plans <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>

          {/* Right: subscriptions */}
          <div className="lg:col-span-2 space-y-6">
            {hasActive && bestPlan && (
              <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-6 sm:p-8 text-white shadow-lg shadow-primary/20">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                  <div>
                    <div className="flex items-center gap-2 text-indigo-100 text-xs font-semibold uppercase tracking-wide mb-1.5">
                      <Zap className="w-4 h-4" /> Active subscription
                    </div>
                    <h2 className="font-bold text-2xl font-display">{bestPlan.duration} Plan</h2>
                    <p className="text-indigo-100 text-sm mt-1">
                      Active until {formatDate(activeUntil)}
                    </p>
                  </div>
                  <div className="text-left sm:text-right shrink-0">
                    <div className="text-3xl font-bold font-mono">{remainingLabel(activeUntil)}</div>
                    <div className="text-indigo-100 text-xs mt-0.5">remaining</div>
                  </div>
                </div>
                <div className="w-full bg-white/15 rounded-full h-2.5">
                  <div
                    className="bg-gradient-to-r from-saffron to-saffron-dark h-2.5 rounded-full"
                    style={{ width: `${activeProgress}%` }}
                  />
                </div>
                <p className="text-indigo-100 text-xs mt-2">
                  {activeProgress}% of your plan used
                </p>
              </div>
            )}

            {/* Plan picker. Shown to subscribers too, as the upgrade/renew
                control — hiding it once a subscription existed left no way to
                change plans from here. */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h2 className="font-semibold text-gray-900 flex items-center gap-2 mb-1">
                  <Sparkles className="w-5 h-5 text-primary" />
                  {hasActive ? 'Upgrade Your Plan' : 'Choose a Plan'}
                </h2>
                <p className="text-sm text-gray-500 mb-5">
                  {hasActive
                    ? 'Move up to a longer plan whenever you like — the time you have left is added on top of it.'
                    : 'Unlock every test and paper. Pick the plan that fits you.'}
                </p>

                {checkoutSuccess && (
                  <div className="mb-5 p-3 rounded-xl bg-green-50 border border-green-200 text-sm text-green-700">
                    {checkoutSuccess}
                  </div>
                )}
                {checkoutError && (
                  <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">
                    {checkoutError}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {pricingPlans.map((plan) => {
                    const loading = checkoutPlanId === plan.id;
                    // Shorter than what is already running = a downgrade, so it
                    // is offered but disabled rather than hidden: seeing why it
                    // is unavailable beats a gap in the grid.
                    const isLower = hasActive && plan.months < currentPlanMonths;
                    const isCurrent = hasActive && bestPlan?.id === plan.id;
                    return (
                      <div
                        key={plan.id}
                        className={`relative rounded-xl border-2 p-5 flex flex-col transition-all ${
                          isCurrent
                            ? 'border-green-400 shadow-md'
                            : isLower
                              ? 'border-gray-100 opacity-70'
                              : plan.popular
                                ? 'border-primary shadow-md'
                                : 'border-gray-100 hover:border-primary/30'
                        }`}
                      >
                        {isCurrent ? (
                          <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-600 text-white px-3 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap">
                            Current Plan
                          </span>
                        ) : plan.popular && !isLower ? (
                          <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white px-3 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap">
                            Most Popular
                          </span>
                        ) : null}

                        <div className="text-center mb-4">
                          <h3 className="font-semibold text-gray-900">{plan.duration}</h3>
                          <div className="mt-1.5">
                            <span className="text-3xl font-bold text-gray-900">₹{plan.price}</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">
                            ₹{plan.pricePerMonth.toFixed(2)}/month
                          </p>
                        </div>

                        <button
                          onClick={() => handleCheckout(plan)}
                          disabled={checkoutPlanId !== null || isLower}
                          className={`mt-auto w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
                            isCurrent
                              ? 'bg-green-600 text-white hover:bg-green-700'
                              : isLower
                                ? 'bg-gray-50 text-gray-400 border border-gray-200'
                                : plan.popular
                                  ? 'bg-primary text-white hover:bg-primary-dark'
                                  : 'bg-gray-50 text-gray-900 hover:bg-gray-100 border border-gray-200'
                          }`}
                        >
                          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                          {loading
                            ? 'Processing...'
                            : isLower
                              ? 'Shorter than your plan'
                              : isCurrent
                                ? `Extend ${plan.duration}`
                                : hasActive
                                  ? `Upgrade to ${plan.duration}`
                                  : `Buy ${plan.duration}`}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                  <BadgeCheck className="w-5 h-5 text-primary" />
                  Purchase History
                </h2>
                <span className="text-xs text-gray-400">{subscriptions.length} total</span>
              </div>

              {loading ? (
                <div className="flex items-center justify-center gap-2 py-12 text-gray-500 text-sm">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  Loading subscriptions...
                </div>
              ) : error ? (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">
                  {error}
                </div>
              ) : subscriptions.length === 0 ? (
                <div className="py-10 text-center">
                  <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Crown className="w-7 h-7 text-gray-400" />
                  </div>
                  <p className="text-gray-500 text-sm">
                    You don't have any purchases yet.
                  </p>
                  <p className="text-gray-400 text-xs mt-1">
                    Subscribe to unlock all tests and papers.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {subscriptions.map((sub) => {
                    const isUnexpired = sub.status === 'active' && sub.ends_at > nowIso;
                    return (
                      <div
                        key={sub.id}
                        className={`flex items-center justify-between gap-3 rounded-xl border p-4 ${
                          isUnexpired ? 'border-primary/10 bg-primary/5' : 'border-gray-100'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                            isUnexpired ? 'bg-primary/10' : 'bg-gray-100'
                          }`}>
                            <Zap className={`w-4 h-4 ${isUnexpired ? 'text-primary' : 'text-gray-400'}`} />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-gray-900 truncate">{sub.plan_name}</h3>
                              {isUnexpired && (
                                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700 shrink-0">
                                  Active
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5">
                              Purchased {formatDate(sub.created_at)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-sm font-semibold text-gray-700">{formatINR(sub.amount)}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 p-4 rounded-xl bg-gray-100 text-xs text-gray-500">
              <ShieldCheck className="w-4 h-4 text-success shrink-0" />
              Subscription status is checked live at the start of every test. Expired plans are
              listed above and will not unlock tests.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
