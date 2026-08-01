import { useCallback, useEffect, useState } from 'react';
import { supabase } from './supabase';
import { useAuth } from '../context/AuthContext';
import type { Subscription } from '../types';

// The single test available for free to signed-in users without a subscription.
export const FREE_TRIAL_TEST_ID = 'ch-phy-1';
export const FREE_TRIAL_PAPER_KEY = '02-apr-morning';

export function useSubscriptionAccess() {
  const { user } = useAuth();
  const [activeSubscription, setActiveSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) {
      setActiveSubscription(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .gt('ends_at', now)
      .order('ends_at', { ascending: false })
      .limit(1);
    setActiveSubscription((data?.[0] as Subscription) ?? null);
    if (error) console.error('Failed to load subscription', error.message);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    activeSubscription,
    hasAccess: !!activeSubscription,
    loading,
    refresh,
  };
}
