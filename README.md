# Liftly — AI Powerlifting Coach

Block periodization that adapts every session. Coach-quality form check from your phone. Macros that respect your sport. Live at [liftly.tech](https://liftly.tech).

## Stack

- Next.js 14 (App Router) + TypeScript, Tailwind CSS (dark, industrial design system)
- Clerk — authentication for both lifters and coaches (email + password, Google OAuth)
- Supabase — Postgres (via the transaction pooler, `postgres.js`)
- LLM layer (`src/lib/ai.ts`) — provider-agnostic: Gemini (`gemini-2.5-flash`, default) or Anthropic Claude, switched by `LLM_PROVIDER`
- Python CV sidecar (`cv-service/`) — FastAPI + MediaPipe pose; bar path, rep timing, velocity-loss → RPE estimation
- Stripe — Pro ($12/mo, $99/yr) and Coach ($20/seat/mo, quantity = active clients) subscriptions + usage metering
- Recharts — e1RM, bodyweight, and weekly tonnage charts
- Capacitor — Android/iOS shells
- GSAP + Lenis + Three.js — landing page

## Setup

1. `npm install`
2. Copy `.env.example` to `.env.local` and fill in: Clerk publishable/secret keys + `DATABASE_URL` (transaction pooler, port 6543), `GEMINI_API_KEY` (or `ANTHROPIC_API_KEY` with `LLM_PROVIDER=anthropic`), Stripe keys + price IDs, `CV_SERVICE_URL`.
3. `npm run db:init` to create tables (also auto-created on first request).
4. `npm run dev` → http://localhost:3000

Tests: `npm test` (decision rules, readiness, limits, triage, weekly review, suggestions).

## Surfaces

| Surface | Routes | What it does |
|---|---|---|
| Athlete app | `/dashboard`, `/program`, `/progress`, `/nutrition`, `/formcheck`, `/chat`, `/coaching`, `/profile` | Adaptive program, session logging, readiness check-ins, CV form checks, AI coach chat, macro targets + AI meal plans |
| Coach console | `/coach`, `/coach/roster`, `/coach/clients/[id]`, `/coach/bulk`, `/coach/applications`, `/coach/posts`, `/coach/reviews`, `/coach/profile` | Roster triage (AI first-pass, coach approves), bulk programming, client detail, marketplace profile |
| Marketplace | `/coaches`, `/coaches/leaderboard`, `/coach/[username]` | Public coach directory, reviews, follows, applications |
| Admin | `/admin`, `/admin/reviews`, `/admin/reports` | Coach application review, content moderation (gated by `ADMIN_EMAILS` allowlist) |
| Marketing | `/`, `/pricing`, `/blog/*`, `/privacy`, `/terms` | Landing, pricing, SEO guides |

## How the pieces fit

- **Auth** (`src/lib/auth.ts`, `src/lib/coach-auth.ts`): Clerk session, resolved to our own rows via `athletes.clerk_user_id` / `coaches.clerk_user_id`. `athletes.id` is an internal uuid and deliberately *not* the auth id — fifteen tables cascade off it, so a provider swap stays a one-column change. On a user's first sign-in the Clerk identity claims any existing row with the same **verified** email, which is how pre-Clerk lifters and coach roster invites keep their data.
- **Billing** (`src/lib/limits.ts`, `src/lib/stripe.ts`): free tier is fully unlocked but metered (3 form checks/wk, 30 AI calls/wk); Pro raises the meters; a paying coach's active clients inherit the coach tier. Stripe webhook is the source of truth.
- **Program adaptation** (`src/lib/decision-rules.ts`, `docs/how-the-program-adapts.md`): readiness dials + logged RPE + form-check findings drive per-session caps and weekly tweaks. Deterministic rules decide; the LLM explains.
- **Form check** (`src/app/api/formcheck/`, `cv-service/`): pose estimation segments reps, measures concentric slowdown → RPE band, calibrates to the lifter over time; the LLM coaches from measured numbers only.

## Deploying

Vercel for the app (all state in Supabase — the filesystem is read-only). Set every var from `.env.example` in Vercel env. The CV sidecar deploys separately (see `cv-service/README.md`; Modal GPU notes in `src/lib/stripe.ts` margin comments). Stripe: add a webhook endpoint for `/api/stripe/webhook` and set `STRIPE_WEBHOOK_SECRET`.

## License

Private project. No license granted.
