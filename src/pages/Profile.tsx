import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Mail, Calendar, Clock, BadgeCheck, Crown, Sparkles, ArrowRight,
  Loader2, ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { formatINR } from '../lib/admin';
import type { Subscription } from '../types';

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

export default function Profile() {
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const { data, error: err } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100);
      if (cancelled) return;
      if (err) {
        setError(err.message);
      } else {
        setSubscriptions((data ?? []) as Subscription[]);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const nowIso = new Date().toISOString();
  const active = subscriptions.filter(
    (s) => s.status === 'active' && s.ends_at > nowIso
  );
  const past = subscriptions.filter((s) => !(s.status === 'active' && s.ends_at > nowIso));

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
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
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-purple-600 text-white flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-md">
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

            {active.length === 0 && (
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 rounded-2xl p-6">
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
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                  <BadgeCheck className="w-5 h-5 text-primary" />
                  Active Subscriptions
                </h2>
                <span className="text-xs text-gray-400">{active.length} active</span>
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
              ) : active.length === 0 ? (
                <div className="py-10 text-center">
                  <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Crown className="w-7 h-7 text-gray-400" />
                  </div>
                  <p className="text-gray-500 text-sm">
                    You don't have any ongoing subscriptions yet.
                  </p>
                  <p className="text-gray-400 text-xs mt-1">
                    Subscribe to unlock all tests and papers.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {active.map((sub) => {
                    const remaining = daysRemaining(sub.ends_at);
                    const totalMs =
                      new Date(sub.ends_at).getTime() - new Date(sub.starts_at).getTime();
                    const elapsed = Math.min(
                      Math.max(totalMs - (new Date(sub.ends_at).getTime() - Date.now()), 0),
                      totalMs
                    );
                    const pct = totalMs > 0 ? Math.round((elapsed / totalMs) * 100) : 0;
                    return (
                      <div
                        key={sub.id}
                        className="border border-indigo-100 bg-gradient-to-br from-indigo-50/60 to-white rounded-xl p-5"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-gray-900">{sub.plan_name}</h3>
                              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                                Active
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              Purchased {formatDate(sub.created_at)}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-gray-900">{formatINR(sub.amount)}</div>
                            <div className="text-xs text-gray-400">{sub.plan_id}</div>
                          </div>
                        </div>
                        <div className="mb-1.5 flex items-center justify-between text-xs">
                          <span className="text-gray-500">Expires on {formatDate(sub.ends_at)}</span>
                          <span className="font-medium text-primary">{remaining} days left</span>
                        </div>
                        <div className="w-full bg-indigo-100 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-primary to-purple-600 h-2 rounded-full"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {past.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h2 className="font-semibold text-gray-900 flex items-center gap-2 mb-5">
                  <Clock className="w-5 h-5 text-gray-400" />
                  Past Subscriptions
                </h2>
                <div className="space-y-3">
                  {past.map((sub) => (
                    <div
                      key={sub.id}
                      className="flex items-center justify-between border border-gray-100 rounded-xl p-4"
                    >
                      <div>
                        <div className="text-sm font-medium text-gray-700">{sub.plan_name}</div>
                        <div className="text-xs text-gray-400">
                          {formatDate(sub.starts_at)} – {formatDate(sub.ends_at)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-gray-700">{formatINR(sub.amount)}</div>
                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                          Expired
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

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
