# Deploying

The site is a static Vite SPA. `dist/` is served straight off Cloudflare's edge
by `wrangler.jsonc` — there is no Worker script, so nothing here executes
server-side code or reads runtime environment variables.

The API side is unaffected by any of this: the browser talks to Supabase
directly over PostgREST, and the two edge functions (`score-attempt`,
`razorpay-*`) run on Supabase, not on Cloudflare.

## One-time: create a Cloudflare API token

Wrangler needs a token to deploy. In the Cloudflare dashboard:

    My Profile -> API Tokens -> Create Token -> "Edit Cloudflare Workers"

Then add it to the git-ignored `env` file:

    CLOUDFLARE_API_TOKEN=...

## Deploy

    npm run deploy

That runs `tsc -b && vite build` and then `wrangler deploy`. To publish a
preview version without moving production traffic, use `npm run cf:preview`.

## Environment variables

Only the three `VITE_` variables matter to this deployment, and they are baked
in at **build** time — Vite substitutes `import.meta.env.VITE_*` into the bundle
during `vite build`, before Cloudflare ever sees the output. If you build
locally and `wrangler deploy`, your local `.env` supplies them and there is
nothing to configure in Cloudflare at all.

If you instead connect the GitHub repo to Cloudflare's own build system, set
these three in the **build** environment (not as Worker secrets):

| Variable | Why it is safe to expose |
| --- | --- |
| `VITE_SUPABASE_URL` | Public project URL. |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Anon key. RLS is the real access control. |
| `VITE_RAZORPAY_KEY_ID` | Public by design; it identifies the merchant in Checkout. |

### What must NOT go on Cloudflare

`SUPABASE_SERVICE_ROLE_KEY` and `RAZORPAY_KEY_SECRET` belong to the Supabase
Edge Functions, which read them from Supabase's own secret store:

    npx supabase secrets set --env-file ./env

The service-role key **bypasses every RLS policy** — with it, anyone can read
`question_keys` (the answer keys the whole scoring design exists to protect) and
every student's attempts. It has no use in a static deployment: no code in
`dist/` could read it even if it were set. Putting it in a build environment is
strictly a way to risk it being inlined into a public bundle.

After changing a paper, a question, or an answer key, redeploy `score-attempt` —
it caches papers and keys at module scope for the isolate's lifetime:

    npx supabase functions deploy score-attempt

## SPA routing

`not_found_handling: "single-page-application"` makes the edge return
`index.html` with a 200 for any path that is not a file, so refreshing on
`/dashboard` or `/test?paper=neet-2020` works.

One consequence worth knowing: a **missing** asset also returns `index.html`
rather than a 404. That is safe for the published papers because
`fetchStaticPaper()` in `src/data/questions.ts` parses inside a `try`/`catch` —
HTML where JSON was expected throws, and the loader falls back to the database
instead of rendering an empty exam. Verified against `wrangler dev`.
