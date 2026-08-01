import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  ShieldAlert,
  Users,
  UserCheck,
  Activity,
  ShoppingCart,
  IndianRupee,
  BadgeCheck,
  BarChart3,
  Eye,
  Loader2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { isAdminEmail, formatINR, formatDateTime } from '../lib/admin';
import { supabase } from '../lib/supabase';
import type { AdminPurchase, AdminUser, PageView } from '../types';

type Tab = 'overview' | 'users' | 'purchases' | 'visitors';

interface Counts {
  totalUsers: number;
  loggedIn: number;
  active7d: number;
  totalPurchases: number;
  revenue: number;
  activeSubs: number;
  totalViews: number;
  viewsToday: number;
}

const tabs: { id: Tab; label: string; icon: typeof Users }[] = [
  { id: 'overview', label: 'Overview', icon: Shield },
  { id: 'users', label: 'Users & Logins', icon: Users },
  { id: 'purchases', label: 'Purchases', icon: ShoppingCart },
  { id: 'visitors', label: 'Visitors', icon: BarChart3 },
];

async function headCount(query: any): Promise<number> {
  const { count, error } = await query.select('*', { count: 'exact', head: true });
  if (error) throw error;
  return count ?? 0;
}

export default function Admin() {
  const { user, loading } = useAuth();
  const [tab, setTab] = useState<Tab>('overview');
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [counts, setCounts] = useState<Counts | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [purchases, setPurchases] = useState<AdminPurchase[]>([]);
  const [views7d, setViews7d] = useState<PageView[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const dayStart = new Date();
        dayStart.setHours(0, 0, 0, 0);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 6);
        weekAgo.setHours(0, 0, 0, 0);

        const [usersRes, purchasesRes, viewsRes, statsRes, viewCounts] = await Promise.all([
          supabase.rpc('admin_get_users'),
          supabase.rpc('admin_get_purchases'),
          supabase.from('page_views').select('*').gte('created_at', weekAgo.toISOString()).order('created_at', { ascending: false }).limit(5000),
          supabase.rpc('admin_stats'),
          Promise.all([
            headCount(supabase.from('page_views').select('*')),
            headCount(supabase.from('page_views').select('*').gte('created_at', dayStart.toISOString())),
          ]),
        ]);

        if (cancelled) return;
        if (usersRes.error) throw usersRes.error;
        if (purchasesRes.error) throw purchasesRes.error;
        if (viewsRes.error) throw viewsRes.error;
        if (statsRes.error) throw statsRes.error;

        const [totalViews, viewsToday] = viewCounts;
        const stats = (statsRes.data ?? {}) as Record<string, number>;

        setUsers((usersRes.data ?? []) as AdminUser[]);
        setPurchases((purchasesRes.data ?? []) as AdminPurchase[]);
        setViews7d((viewsRes.data ?? []) as PageView[]);
        setCounts({
          totalUsers: stats.total_users ?? 0,
          loggedIn: stats.logged_in ?? 0,
          active7d: stats.active_7d ?? 0,
          totalPurchases: stats.total_purchases ?? 0,
          revenue: stats.revenue ?? 0,
          activeSubs: stats.active_subs ?? 0,
          totalViews,
          viewsToday,
        });
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load admin data.');
      } finally {
        if (!cancelled) setDataLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const dailyViews = useMemo(() => {
    const buckets: { label: string; count: number }[] = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - i);
      buckets.push({ label: d.toLocaleDateString('en-IN', { weekday: 'short' }), count: 0 });
    }
    const byDay = new Map<string, number>();
    for (const v of views7d) {
      const key = v.created_at.slice(0, 10);
      byDay.set(key, (byDay.get(key) ?? 0) + 1);
    }
    for (const b of buckets) {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - (6 - buckets.indexOf(b)));
      const key = d.toISOString().slice(0, 10);
      b.count = byDay.get(key) ?? 0;
    }
    return buckets;
  }, [views7d]);

  const topPages = useMemo(() => {
    const countsByPath = new Map<string, number>();
    for (const v of views7d) {
      countsByPath.set(v.path, (countsByPath.get(v.path) ?? 0) + 1);
    }
    return [...countsByPath.entries()]
      .map(([path, count]) => ({ path, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [views7d]);

  const uniqueVisitors7d = useMemo(() => {
    const ids = new Set(views7d.map((v) => v.user_id).filter((id): id is string => !!id));
    return ids.size;
  }, [views7d]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAdminEmail(user?.email)) {
    return (
      <div className="min-h-[70vh] bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-10 max-w-md text-center">
          <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <ShieldAlert className="w-7 h-7 text-red-500" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Access denied</h1>
          <p className="text-sm text-gray-500 mb-6">
            This area is restricted to authorized administrators only. Your account
            ({user?.email}) is not on the admin list.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-dark transition-colors"
          >
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  const statCards = counts
    ? [
        { icon: Users, label: 'Total Users', value: counts.totalUsers.toLocaleString('en-IN'), color: 'from-blue-500 to-blue-600' },
        { icon: UserCheck, label: 'Logged-In Clients', value: counts.loggedIn.toLocaleString('en-IN'), color: 'from-green-500 to-green-600' },
        { icon: Activity, label: 'Active (7 days)', value: counts.active7d.toLocaleString('en-IN'), color: 'from-purple-500 to-purple-600' },
        { icon: ShoppingCart, label: 'Total Purchases', value: counts.totalPurchases.toLocaleString('en-IN'), color: 'from-orange-500 to-orange-600' },
        { icon: IndianRupee, label: 'Revenue', value: formatINR(counts.revenue), color: 'from-emerald-500 to-emerald-600' },
        { icon: BadgeCheck, label: 'Active Subscriptions', value: counts.activeSubs.toLocaleString('en-IN'), color: 'from-indigo-500 to-indigo-600' },
        { icon: BarChart3, label: 'Total Page Views', value: counts.totalViews.toLocaleString('en-IN'), color: 'from-cyan-500 to-cyan-600' },
        { icon: Eye, label: 'Views Today', value: counts.viewsToday.toLocaleString('en-IN'), color: 'from-rose-500 to-rose-600' },
      ]
    : [];

  const maxDaily = Math.max(...dailyViews.map((d) => d.count), 1);

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Shield className="w-6 h-6 text-primary" />
              Admin Dashboard
            </h1>
            <p className="text-gray-500 mt-1">Signed in as {user?.email}</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="flex flex-wrap gap-2 mb-6">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                tab === t.id
                  ? 'bg-primary text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-primary/40 hover:text-primary'
              }`}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}
        </div>

        {dataLoading ? (
          <div className="flex items-center justify-center gap-2 py-24 text-gray-500 text-sm">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            Loading admin data...
          </div>
        ) : (
          <>
            {tab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {statCards.map((s) => (
                    <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center`}>
                          <s.icon className="w-5 h-5 text-white" />
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-gray-900">{s.value}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <h2 className="font-semibold text-gray-900 mb-4">Recent Purchases</h2>
                    <div className="space-y-3">
                      {purchases.slice(0, 6).map((p) => (
                        <div key={p.id} className="flex items-center justify-between border border-gray-100 rounded-lg p-3">
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-gray-900 truncate">{p.email ?? 'Unknown user'}</div>
                            <div className="text-xs text-gray-500">{p.plan_name} &middot; {formatDateTime(p.created_at)}</div>
                          </div>
                          <div className="text-sm font-bold text-gray-900 shrink-0 ml-3">{formatINR(p.amount)}</div>
                        </div>
                      ))}
                      {purchases.length === 0 && <p className="text-sm text-gray-500">No purchases yet.</p>}
                    </div>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <h2 className="font-semibold text-gray-900 mb-4">Recent Sign-ups</h2>
                    <div className="space-y-3">
                      {users.slice(0, 6).map((u) => (
                        <div key={u.id} className="flex items-center justify-between border border-gray-100 rounded-lg p-3">
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-gray-900 truncate">{u.email ?? 'Unknown'}</div>
                            <div className="text-xs text-gray-500">
                              {u.full_name ? `${u.full_name} &middot; ` : ''}Signed up {formatDateTime(u.created_at)}
                            </div>
                          </div>
                          <div className={`text-xs font-medium shrink-0 ml-3 ${u.last_sign_in_at ? 'text-success' : 'text-gray-400'}`}>
                            {u.last_sign_in_at ? 'Logged in' : 'No login'}
                          </div>
                        </div>
                      ))}
                      {users.length === 0 && <p className="text-sm text-gray-500">No users yet.</p>}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {tab === 'users' && (
              <div className="bg-white rounded-xl border border-gray-200 p-5 overflow-x-auto">
                <h2 className="font-semibold text-gray-900 mb-4">Registered Users & Login Activity</h2>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 text-left text-xs text-gray-500">
                      <th className="py-3 pr-4 font-medium">Email</th>
                      <th className="py-3 pr-4 font-medium">Name</th>
                      <th className="py-3 pr-4 font-medium">Signed Up</th>
                      <th className="py-3 font-medium">Last Login</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} className="border-b border-gray-100 last:border-0">
                        <td className="py-3 pr-4 font-medium text-gray-900">{u.email ?? '—'}</td>
                        <td className="py-3 pr-4 text-gray-600">{u.full_name ?? '—'}</td>
                        <td className="py-3 pr-4 text-gray-600">{formatDateTime(u.created_at)}</td>
                        <td className="py-3">
                          {u.last_sign_in_at ? (
                            <span className="text-gray-600">{formatDateTime(u.last_sign_in_at)}</span>
                          ) : (
                            <span className="text-gray-400">Never</span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {users.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-6 text-center text-gray-500">No users yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {tab === 'purchases' && (
              <div className="bg-white rounded-xl border border-gray-200 p-5 overflow-x-auto">
                <h2 className="font-semibold text-gray-900 mb-4">Purchase History</h2>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 text-left text-xs text-gray-500">
                      <th className="py-3 pr-4 font-medium">User</th>
                      <th className="py-3 pr-4 font-medium">Plan</th>
                      <th className="py-3 pr-4 font-medium">Amount</th>
                      <th className="py-3 pr-4 font-medium">Status</th>
                      <th className="py-3 pr-4 font-medium">Order ID</th>
                      <th className="py-3 font-medium">Purchased</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchases.map((p) => (
                      <tr key={p.id} className="border-b border-gray-100 last:border-0">
                        <td className="py-3 pr-4 font-medium text-gray-900">{p.email ?? 'Unknown'}</td>
                        <td className="py-3 pr-4 text-gray-600">{p.plan_name}</td>
                        <td className="py-3 pr-4 font-semibold text-gray-900">{formatINR(p.amount)}</td>
                        <td className="py-3 pr-4">
                          <span className={`text-xs font-medium px-2 py-1 rounded-md ${p.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="py-3 pr-4 text-gray-500 font-mono text-xs">{p.razorpay_order_id ?? '—'}</td>
                        <td className="py-3 text-gray-600">{formatDateTime(p.created_at)}</td>
                      </tr>
                    ))}
                    {purchases.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-6 text-center text-gray-500">No purchases yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {tab === 'visitors' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'Total Page Views', value: counts?.totalViews.toLocaleString('en-IN') ?? '—', color: 'from-cyan-500 to-cyan-600', icon: BarChart3 },
                    { label: 'Views Today', value: counts?.viewsToday.toLocaleString('en-IN') ?? '—', color: 'from-rose-500 to-rose-600', icon: Eye },
                    { label: 'Views (7 days)', value: views7d.length.toLocaleString('en-IN'), color: 'from-blue-500 to-blue-600', icon: Activity },
                    { label: 'Logged-in Visitors (7d)', value: uniqueVisitors7d.toLocaleString('en-IN'), color: 'from-purple-500 to-purple-600', icon: UserCheck },
                  ].map((s) => (
                    <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center`}>
                          <s.icon className="w-5 h-5 text-white" />
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-gray-900">{s.value}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                      <h2 className="font-semibold text-gray-900 mb-5">Views per Day (last 7 days)</h2>
                      <div className="flex items-end justify-between gap-2 h-40">
                        {dailyViews.map((d, i) => (
                          <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                            <span className="text-xs font-semibold text-gray-700">{d.count}</span>
                            <div
                              className="w-full max-w-12 rounded-t-lg bg-gradient-to-t from-primary to-purple-500"
                              style={{ height: `${Math.max((d.count / maxDaily) * 100, 2)}%` }}
                            />
                            <span className="text-xs text-gray-400">{d.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 p-5 overflow-x-auto">
                      <h2 className="font-semibold text-gray-900 mb-4">Recent Visits</h2>
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-200 text-left text-xs text-gray-500">
                            <th className="py-3 pr-4 font-medium">Page</th>
                            <th className="py-3 pr-4 font-medium">User</th>
                            <th className="py-3 font-medium">Time</th>
                          </tr>
                        </thead>
                        <tbody>
                          {views7d.slice(0, 20).map((v) => (
                            <tr key={v.id} className="border-b border-gray-100 last:border-0">
                              <td className="py-3 pr-4 font-mono text-xs text-primary">{v.path}</td>
                              <td className="py-3 pr-4 text-gray-600">{v.user_id ? 'Signed in' : 'Guest'}</td>
                              <td className="py-3 text-gray-600">{formatDateTime(v.created_at)}</td>
                            </tr>
                          ))}
                          {views7d.length === 0 && (
                            <tr>
                              <td colSpan={3} className="py-6 text-center text-gray-500">No visits recorded yet.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl border border-gray-200 p-5 h-fit">
                    <h2 className="font-semibold text-gray-900 mb-4">Top Pages (7 days)</h2>
                    <div className="space-y-4">
                      {topPages.map((p) => (
                        <div key={p.path}>
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="font-mono text-xs text-gray-700 truncate">{p.path}</span>
                            <span className="text-gray-500 font-medium text-xs">{p.count}</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-1.5">
                            <div
                              className="bg-primary h-1.5 rounded-full"
                              style={{ width: `${(p.count / topPages[0].count) * 100}%` }}
                            />
                          </div>
                        </div>
                      ))}
                      {topPages.length === 0 && <p className="text-sm text-gray-500">No data yet.</p>}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
