import { supabase } from './supabase';

const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID;

if (!RAZORPAY_KEY_ID) {
  throw new Error('Missing VITE_RAZORPAY_KEY_ID in .env');
}

export interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayFailure {
  error?: {
    code?: string;
    description?: string;
    reason?: string;
  };
}

interface CheckoutPlan {
  id: string;
  name: string;
}

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
      on: (event: string, handler: (response: unknown) => void) => void;
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

async function invokeEdgeFunction(name: string, body: Record<string, unknown>): Promise<any> {
  const { data, error } = await supabase.functions.invoke(name, { body });
  if (error) throw new Error(error.message || 'Something went wrong.');
  return data;
}

// Typed checkout errors so pages can show the right message and offer the
// right next step (retry vs. automatic recovery check).
export type PaymentErrorCode = 'CANCELLED' | 'FAILED' | 'VERIFY_NETWORK' | 'VERIFY_REJECTED';

export class PaymentError extends Error {
  code: PaymentErrorCode;
  // Set when money may have moved but access isn't confirmed — the app
  // should run resumePendingOrder() rather than asking the user to pay again.
  orderId: string | null;

  constructor(code: PaymentErrorCode, message: string, orderId: string | null = null) {
    super(message);
    this.code = code;
    this.orderId = orderId;
  }
}

export interface CheckoutResult {
  paymentId: string;
  orderId: string;
  subscription: Record<string, unknown>;
}

// A checkout that dies after create-order leaves a local trace so the app
// can ask the server "did that order actually get paid?" on the next visit.
// Cleared on every terminal outcome (success, cancel, definitive failure).
const PENDING_KEY = 'edutester_pending_order';
const PENDING_TTL_MS = 24 * 60 * 60 * 1000;

interface PendingOrder {
  orderId: string;
  createdAt: number;
}

function savePendingOrder(orderId: string) {
  try {
    localStorage.setItem(PENDING_KEY, JSON.stringify({ orderId, createdAt: Date.now() }));
  } catch {
    // Private mode etc. — recovery just won't survive a reload.
  }
}

function readPendingOrder(): PendingOrder | null {
  try {
    const raw = localStorage.getItem(PENDING_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PendingOrder;
    if (!parsed.orderId || Date.now() - parsed.createdAt > PENDING_TTL_MS) {
      localStorage.removeItem(PENDING_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function clearPendingOrder() {
  try {
    localStorage.removeItem(PENDING_KEY);
  } catch {
    // ignore
  }
}

function isNetworkError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return /fetch|network|load failed|timeout|timed out|502|503|504|something went wrong/i.test(msg);
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

// Verify with retries on transport failures. Safe to repeat: the server
// provisions idempotently per order, so a retry can never double-charge or
// double-provision.
async function verifyWithRetry(orderId: string, paymentId: string, signature: string): Promise<any> {
  let lastErr: unknown = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      return await invokeEdgeFunction('razorpay-verify', { orderId, paymentId, signature });
    } catch (err) {
      lastErr = err;
      // The server actively rejected the payment (bad signature, wrong
      // user/plan/amount) — retrying is pointless.
      if (!isNetworkError(err)) throw err;
      if (attempt < 2) await sleep(1000 * (attempt + 1));
    }
  }
  throw lastErr;
}

function friendlyFailureMessage(failure: RazorpayFailure): string {
  const reason = failure?.error?.reason ?? '';
  const description = failure?.error?.description ?? '';
  if (/insufficient|fund/i.test(`${reason} ${description}`)) {
    return 'Payment failed: insufficient funds. No money was deducted.';
  }
  if (/bank|declined|issuer/i.test(`${reason} ${description}`)) {
    return 'Your bank declined this payment. No money was deducted — try another method.';
  }
  if (/timeout|timed out/i.test(`${reason} ${description}`)) {
    return 'The payment timed out. If money was deducted, it will be refunded automatically — or tap below and we will check.';
  }
  return description || 'Payment failed before completion. No money was deducted.';
}

export async function checkoutPlan(
  plan: CheckoutPlan,
  couponCode?: string | null
): Promise<CheckoutResult> {
  const orderData = await invokeEdgeFunction('razorpay-create-order', {
    planId: plan.id,
    couponCode: couponCode ?? undefined,
  });

  const orderId = orderData.orderId as string;
  savePendingOrder(orderId);

  const {
    data: { session },
  } = await supabase.auth.getSession();

  await loadRazorpayScript();
  const RazorpayCtor = window.Razorpay;
  if (!RazorpayCtor) {
    clearPendingOrder();
    throw new Error('Razorpay checkout is unavailable.');
  }

  return new Promise((resolve, reject) => {
    const razorpay = new RazorpayCtor({
      key: orderData.keyId,
      order_id: orderId,
      name: 'EduTester',
      description: `${orderData.planName} subscription`,
      amount: orderData.amount,
      currency: orderData.currency,
      theme: { color: '#4f46e5' },
      prefill: { email: session?.user?.email ?? '' },
      // Bank/UPI-level failure (declined, insufficient funds, timed out).
      // Without this, declines are silent and look like user cancellation.
      handler: async (response: RazorpayResponse) => {
        try {
          const data = await verifyWithRetry(
            response.razorpay_order_id,
            response.razorpay_payment_id,
            response.razorpay_signature
          );
          clearPendingOrder();
          resolve({
            paymentId: response.razorpay_payment_id,
            orderId: response.razorpay_order_id,
            subscription: data.subscription,
          });
        } catch (err) {
          if (isNetworkError(err)) {
            // The bank may have approved the payment but we couldn't confirm
            // it. Keep the pending trace so resumePendingOrder() (and the
            // webhook backstop) can complete provisioning.
            reject(
              new PaymentError(
                'VERIFY_NETWORK',
                'Connection lost while confirming your payment. Do not pay again — reopen this page and we will check automatically.',
                orderId
              )
            );
          } else {
            clearPendingOrder();
            reject(
              new PaymentError(
                'VERIFY_REJECTED',
                err instanceof Error ? err.message : 'Payment verification failed.',
                null
              )
            );
          }
        }
      },
      modal: {
        ondismiss: () => {
          // Dismiss with no payment attempt: nothing moved, discard the trace.
          clearPendingOrder();
          reject(new PaymentError('CANCELLED', 'Payment cancelled.'));
        },
      },
    });
    razorpay.on('payment.failed', (resp: unknown) => {
      clearPendingOrder();
      reject(new PaymentError('FAILED', friendlyFailureMessage(resp as RazorpayFailure)));
    });
    razorpay.open();
  });
}

export interface ResumeResult {
  recovered: boolean;
  subscription?: Record<string, unknown>;
}

// Reconcile an interrupted checkout: asks the server whether the pending
// order was actually paid and provisions access if so. Returns
// { recovered: true } when a subscription came out of it (already active or
// newly provisioned), { recovered: false } when nothing was paid.
export async function resumePendingOrder(): Promise<ResumeResult> {
  const pending = readPendingOrder();
  if (!pending) return { recovered: false };
  try {
    const data = await invokeEdgeFunction('razorpay-order-status', {
      orderId: pending.orderId,
    });
    if (data?.paid && data?.subscription) {
      clearPendingOrder();
      return { recovered: true, subscription: data.subscription };
    }
    // Not paid — nothing moved, safe to discard and start over.
    if (data && data.paid === false) clearPendingOrder();
    return { recovered: false };
  } catch {
    // Server unreachable — keep the trace and try again next time.
    return { recovered: false };
  }
}
