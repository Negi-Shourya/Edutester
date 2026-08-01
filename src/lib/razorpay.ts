import { supabase } from './supabase';

const API_URL = import.meta.env.VITE_API_URL || '';
const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID;

if (!RAZORPAY_KEY_ID) {
  throw new Error('Missing VITE_RAZORPAY_KEY_ID in .env');
}

export interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface CheckoutPlan {
  id: string;
  name: string;
}

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
    };
  }
}

let scriptPromise: Promise<void> | null = null;

function loadRazorpayScript(): Promise<void> {
  if (window.Razorpay) return Promise.resolve();
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Razorpay checkout.'));
      document.body.appendChild(script);
    });
  }
  return scriptPromise;
}

async function authedFetch(path: string, body: unknown): Promise<{ ok: boolean; data: any }> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new Error('Please sign in to continue.');
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Something went wrong.');
  return { ok: res.ok, data };
}

export interface CheckoutResult {
  paymentId: string;
  orderId: string;
  subscription: Record<string, unknown>;
}

export async function checkoutPlan(plan: CheckoutPlan): Promise<CheckoutResult> {
  const { data: orderData } = await authedFetch('/api/payments/create-order', {
    planId: plan.id,
  });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  await loadRazorpayScript();
  const RazorpayCtor = window.Razorpay;
  if (!RazorpayCtor) throw new Error('Razorpay checkout is unavailable.');

  return new Promise((resolve, reject) => {
    const razorpay = new RazorpayCtor({
      key: orderData.keyId,
      order_id: orderData.orderId,
      name: 'EduTester',
      description: `${orderData.planName} subscription`,
      amount: orderData.amount,
      currency: orderData.currency,
      theme: { color: '#4f46e5' },
      prefill: { email: session?.user?.email ?? '' },
      handler: async (response: RazorpayResponse) => {
        try {
          const { data } = await authedFetch('/api/payments/verify', {
            orderId: response.razorpay_order_id,
            paymentId: response.razorpay_payment_id,
            signature: response.razorpay_signature,
          });
          resolve({
            paymentId: response.razorpay_payment_id,
            orderId: response.razorpay_order_id,
            subscription: data.subscription,
          });
        } catch (err) {
          reject(err);
        }
      },
      modal: {
        ondismiss: () => reject(new Error('Payment cancelled.')),
      },
    });
    razorpay.open();
  });
}
