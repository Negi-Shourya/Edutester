// Route tests: every app route + the Supabase API endpoints they use.
// Prints HTTP status codes for each route and what happens on access.
// Usage: node scripts/route-test.mjs  (dev server on :5173 optional)

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const env = {};
for (const line of readFileSync(join(root, '.env'), 'utf8').split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z0-9_]+)=(.*)$/);
  if (m) env[m[1]] = m[2].trim();
}

const SUPABASE_URL = env.SUPABASE_URL || 'https://gvsgromfsqvywawauzfi.supabase.co';
const ANON_KEY = env.SUPABASE_PUBLISHABLE_KEY;
const SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;
const APP_BASE = process.env.APP_BASE || 'http://localhost:5173';

if (!ANON_KEY || !SERVICE_ROLE_KEY) {
  console.error('Missing Supabase keys in .env');
  process.exit(1);
}

const jsonHeaders = { 'Content-Type': 'application/json' };

async function call(method, url, { headers = {}, body } = {}) {
  const res = await fetch(url, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(15000),
  });
  const text = await res.text();
  let parsed = text;
  try { parsed = JSON.parse(text); } catch { /* keep raw */ }
  return { status: res.status, body: parsed };
}

const summarize = (body) => {
  if (typeof body !== 'object' || body === null) {
    const s = String(body).replace(/\s+/g, ' ').trim();
    return s.length > 90 ? s.slice(0, 87) + '...' : s;
  }
  const first = Array.isArray(body) ? body[0] : body;
  if (Array.isArray(body)) return `[] ${body.length} row(s)`;
  return JSON.stringify(first).slice(0, 100);
};

const rows = [];
const add = (kind, route, status, detail, expect) =>
  rows.push({ kind, route, status, detail, pass: status === expect });

// ---------------------------------------------------------------------------
// SPA frontend routes (served by the Vite dev server; auth is client-side)
// ---------------------------------------------------------------------------
const spaRoutes = [
  { path: '/', note: 'public - Home page renders', expect: 200 },
  { path: '/pricing', note: 'public - Pricing page renders', expect: 200 },
  { path: '/login', note: 'public - Login form renders', expect: 200 },
  { path: '/signup', note: 'public - Signup form renders', expect: 200 },
  { path: '/dashboard', note: 'protected - signed out => client redirects to /login', expect: 200 },
  { path: '/chapter-tests', note: 'protected - signed out => client redirects to /login', expect: 200 },
  { path: '/paper-tests', note: 'protected - signed out => client redirects to /login', expect: 200 },
  { path: '/test', note: 'protected - signed out => client redirects to /login; navbar hidden', expect: 200 },
  { path: '/admin', note: 'protected + admin email gate - signed out => redirect to /login', expect: 200 },
  { path: '/nope-not-a-page', note: 'unknown path - SPA fallback serves index.html', expect: 200 },
];

let spaReachable = true;
try {
  for (const r of spaRoutes) {
    const res = await fetch(`${APP_BASE}${r.path}`, { signal: AbortSignal.timeout(8000) });
    const type = res.headers.get('content-type') ?? '';
    add('FRONTEND', `${r.path}`, res.status, `${r.note} | ${type.split(';')[0]}`, r.expect);
  }
} catch {
  spaReachable = false;
  console.warn('(Vite dev server not running on :5173 - skipping frontend route tests)\n');
}

// ---------------------------------------------------------------------------
// Supabase API routes
// ---------------------------------------------------------------------------
const api = (path) => `${SUPABASE_URL}${path}`;

// No key at all
let res = await call('GET', api('/rest/v1/papers'));
add('API', 'GET /rest/v1/papers (no apikey)', res.status, summarize(res.body), 401);

// Anon key only
res = await call('GET', api('/rest/v1/papers'), { headers: { apikey: ANON_KEY } });
add('API', 'GET /rest/v1/papers (anon)', res.status, summarize(res.body), 200);

// Public read on other content tables
for (const t of ['sections', 'questions', 'question_options', 'subsections']) {
  res = await call('GET', api(`/rest/v1/${t}?limit=1`), { headers: { apikey: ANON_KEY } });
  add('API', `GET /rest/v1/${t} (anon)`, res.status, summarize(res.body), 200);
}

// Answer keys must NOT be readable through the Data API (RLS on, no grants):
// anon and authenticated users get an error, never answer data.
res = await call('GET', api('/rest/v1/question_keys?limit=1'), { headers: { apikey: ANON_KEY } });
add('API', 'GET /rest/v1/question_keys (anon)', res.status, summarize(res.body), 401);

// question_diagrams (stored HTML figures) is dropped entirely.
res = await call('GET', api('/rest/v1/question_diagrams?limit=1'), { headers: { apikey: ANON_KEY } });
add('API', 'GET /rest/v1/question_diagrams (anon)', res.status, summarize(res.body), 404);

// Anon write attempt on a public-read-only table
res = await call('POST', api('/rest/v1/papers'), {
  headers: { apikey: ANON_KEY, ...jsonHeaders },
  body: { key: 'x' },
});
add('API', 'POST /rest/v1/papers (anon write)', res.status, summarize(res.body), 401);

// Edge functions without a JWT
for (const fn of ['razorpay-create-order', 'razorpay-verify', 'score-attempt']) {
  res = await call('POST', api(`/functions/v1/${fn}`), {
    headers: { ...jsonHeaders },
    body: { planId: '1month' },
  });
  add('API', `POST /functions/v1/${fn} (no auth)`, res.status, summarize(res.body), 401);
}

// Edge functions with anon key but no user JWT
res = await call('POST', api('/functions/v1/razorpay-create-order'), {
  headers: { apikey: ANON_KEY, ...jsonHeaders },
  body: { planId: '1month' },
});
add('API', 'POST /functions/v1/razorpay-create-order (apikey, no JWT)', res.status, summarize(res.body), 401);

// Auth endpoints
res = await call('POST', api('/auth/v1/token?grant_type=password'), {
  headers: { apikey: ANON_KEY, ...jsonHeaders },
  body: { email: 'route-test@test.dev', password: 'wrong-password' },
});
add('API', 'POST /auth/v1/token (bad credentials)', res.status, summarize(res.body), 400);

res = await call('GET', api('/auth/v1/user'), { headers: { apikey: ANON_KEY, Authorization: 'Bearer invalid.token.here' } });
add('API', 'GET /auth/v1/user (invalid token)', res.status, summarize(res.body), 403);

// Storage
res = await call('GET', api('/storage/v1/object/public/question-images/nope.svg'), { headers: { apikey: ANON_KEY } });
add('API', 'GET /storage/v1/object/public/question-images/nope.svg', res.status, summarize(res.body), 400);

// ---------------------------------------------------------------------------
// Authenticated session tests (throwaway user, cleaned up afterwards)
// ---------------------------------------------------------------------------
const TEST_EMAIL = 'route-test@test.dev';
const TEST_PASSWORD = 'TestPass123!';

res = await call('POST', api('/auth/v1/admin/users'), {
  headers: { apikey: SERVICE_ROLE_KEY, Authorization: `Bearer ${SERVICE_ROLE_KEY}`, ...jsonHeaders },
  body: { email: TEST_EMAIL, password: TEST_PASSWORD, email_confirm: true },
});
const testUserId = res.body?.id;
let userToken = null;

if (testUserId) {
  res = await call('POST', api('/auth/v1/token?grant_type=password'), {
    headers: { apikey: ANON_KEY, ...jsonHeaders },
    body: { email: TEST_EMAIL, password: TEST_PASSWORD },
  });
  userToken = res.body?.access_token ?? null;

  const auth = { apikey: ANON_KEY, Authorization: `Bearer ${userToken}`, ...jsonHeaders };
  if (userToken) {
    res = await call('GET', api('/rest/v1/subscriptions'), { headers: auth });
    add('API', 'GET /rest/v1/subscriptions (signed-in user)', res.status, summarize(res.body), 200);

    res = await call('GET', api('/rest/v1/page_views'), { headers: auth });
    add('API', 'GET /rest/v1/page_views (non-admin user)', res.status, summarize(res.body), 200);

    res = await call('POST', api('/rest/v1/page_views'), {
      headers: { apikey: ANON_KEY, Authorization: `Bearer ${userToken}`, ...jsonHeaders },
      body: { path: '/route-test-probe' },
    });
    add('API', 'POST /rest/v1/page_views (signed-in user)', res.status, 'visitor tracking insert', 201);

    res = await call('POST', api('/rest/v1/page_views'), {
      headers: { apikey: ANON_KEY, ...jsonHeaders },
      body: { path: '/route-test-probe-anon' },
    });
    add('API', 'POST /rest/v1/page_views (anon)', res.status, 'anon flood attempt must be rejected', 401);

    res = await call('POST', api('/functions/v1/razorpay-create-order'), {
      headers: { apikey: ANON_KEY, Authorization: `Bearer ${userToken}`, ...jsonHeaders },
      body: { planId: '1month' },
    });
    add('API', 'POST /functions/v1/razorpay-create-order (JWT, valid plan)', res.status, summarize(res.body), 200);

    res = await call('POST', api('/functions/v1/razorpay-create-order'), {
      headers: { apikey: ANON_KEY, Authorization: `Bearer ${userToken}`, ...jsonHeaders },
      body: { planId: 'bogus-plan' },
    });
    add('API', 'POST /functions/v1/razorpay-create-order (JWT, bad plan)', res.status, summarize(res.body), 400);

    res = await call('POST', api('/rest/v1/rpc/admin_stats'), { headers: auth, body: {} });
    add('API', 'POST /rest/v1/rpc/admin_stats (non-admin)', res.status, 'null (denied by is_admin())', 200);
  }

  // Cleanup: page view probe + test user
  await call('DELETE', api('/rest/v1/page_views?path=eq./route-test-probe'), {
    headers: { apikey: SERVICE_ROLE_KEY, Authorization: `Bearer ${SERVICE_ROLE_KEY}` },
  });
  await call('DELETE', api(`/auth/v1/admin/users/${testUserId}`), {
    headers: { apikey: SERVICE_ROLE_KEY, Authorization: `Bearer ${SERVICE_ROLE_KEY}` },
  });
}

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------
console.log('='.repeat(118));
console.log(' ROUTE TEST REPORT  (SPA via Vite dev server + Supabase API)');
console.log('='.repeat(118));

for (const kind of ['FRONTEND', 'API']) {
  const group = rows.filter((r) => r.kind === kind);
  if (kind === 'FRONTEND' && !spaReachable) continue;
  console.log(`\n${kind === 'FRONTEND' ? 'FRONTEND ROUTES' : 'SUPABASE API ROUTES'}`);
  console.log('-'.repeat(118));
  const w = Math.max(...group.map((r) => r.route.length)) + 2;
  for (const r of group) {
    const mark = r.pass ? 'PASS' : 'FAIL';
    const markColored = r.pass ? `\x1b[32m${mark}\x1b[0m` : `\x1b[31m${mark}\x1b[0m`;
    console.log(`  ${r.route.padEnd(w)} ${String(r.status).padStart(3)}   ${markColored.padEnd(8)} ${r.detail}`);
  }
  const passed = group.filter((r) => r.pass).length;
  const total = group.length;
  const statuses = [...new Set(group.map((r) => r.status))].sort((a, b) => a - b);
  console.log(`\n  ${passed}/${total} passed | status codes seen: ${statuses.join(', ')}`);
}

const allPassed = rows.filter((r) => r.pass).length;
const allTotal = rows.length;
console.log('\n' + '='.repeat(118));
console.log(` OVERALL: ${allPassed}/${allTotal} routes passed`);
console.log('='.repeat(118));
