// Admin identity lives in the database: auth.users.app_metadata.role =
// 'admin' (set server-side, users cannot edit it). The server re-checks the
// same flag inside every admin_* function, so this client-side check only
// decides whether to show the admin UI.
export function isAdmin(user: { app_metadata?: Record<string, unknown> } | null | undefined): boolean {
  return user?.app_metadata?.role === 'admin';
}

export function formatINR(paise: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(paise / 100);
}

export function formatDateTime(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
