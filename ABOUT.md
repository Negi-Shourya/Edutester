# About Edutester

Edutester is an exam simulation platform designed to closely mimic the National Testing Agency (NTA) interface for major Indian entrance exams like **JEE Main** and **NEET**. It provides students with a highly realistic testing environment, featuring a familiar question palette (color-coded for answered, marked, not visited), section-based navigation (e.g., Physics, Chemistry, Botany, Zoology for NEET), and a strict countdown timer.

The platform's primary goal is to host a vast repository of accurately extracted past papers (such as NEET 2020-2025 and JEE Main 2026), reliably rendering complex mathematical equations, chemical formulas, and vector diagrams using KaTeX and curated image assets.

## Tech Stack

- **Frontend Framework**: React 19 + TypeScript
- **Build Tool**: Vite (static SPA)
- **Styling**: Tailwind CSS v4 + Lucide React (for icons)
- **Routing**: React Router v7
- **Animations**: Framer Motion
- **Math Rendering**: KaTeX
- **Linting**: Oxlint

## Infrastructure & Hosting

### Supabase (Backend & Database)
Supabase serves as the core backend for the platform:
- **PostgreSQL Database**: Stores all structured exam data across multiple tables (`papers`, `questions`, `question_options`, `question_keys`).
- **Supabase Storage**: Hosts raw and curated figure assets/images for questions and options, referenced directly in the database via `figure_url`.
- **Security & APIs**: Relies on Row Level Security (RLS) for access control, while sensitive operations (like payments/subscriptions) are meant for Supabase Edge Functions.

### Cloudflare Workers (Static Hosting)
Instead of executing a server-side Worker script, the project leverages Cloudflare Workers' static assets serving capabilities:
- **Edge Delivery**: The entire Vite-built static SPA (`dist/` directory) is served directly from Cloudflare's edge network for incredibly low latency.
- **Client-Side Routing**: Configured with `not_found_handling: "single-page-application"` in `wrangler.jsonc` so that any unmatched routes (like `/dashboard` or `/test`) gracefully fall back to `index.html`, allowing React Router to take over routing on the client side.
- **Performance**: Serving built static assets from the edge dramatically cuts down load times and ensures the frontend behaves reliably and fast.
