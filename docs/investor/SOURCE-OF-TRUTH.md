# Liftly — Investor Source of Truth

The single reference every investor document must agree with. Update this file
first; then update the deck, memo, model, and applications to match. If a number
appears in two places, it must be this number.

_Last updated: 2026-06-25 · Stage: pre-launch_

---

## Company

- **Name:** Liftly (liftly.tech)
- **One sentence:** Liftly is an AI powerlifting coach that programs your
  training, retunes every target from the sets you log, checks your form from a
  phone video, and tells you in plain words why each number moved.
- **Category:** Adaptive strength-training software (B2C subscription + B2B
  coach tooling)

## Stage & traction (be precise — do not inflate)

- **Status:** Pre-launch. Product is built and working; not yet publicly
  launched. No paying users yet.
- **Allowed claims:** product capability, depth of the closed loop, test
  coverage, why-now timing.
- **Not allowed:** user counts, MRR, retention, growth rates. None exist yet.

## What is actually built (proof points)

All shipped and in the repo:

- **Closed coaching loop** — Program → Execute → Review → Adapt, with 19 passing
  unit tests over the decision rules.
- **Auto-tuning targets** — next-session weights are recomputed from logged
  reps×RPE via a rolling e1RM estimate, with a deload rail (caps drops near
  −10%) and a rep-regression rail for newer lifters. Each change shows the new
  weight, the old one struck through, and a one-line reason.
- **Readiness check** — optional 30-second check-in returns green/amber/red and
  a *soft* RPE ceiling. Never forces a deload; never rewrites the program
  silently.
- **Weekly review** — planned vs. actual (sessions, tonnage, top sets) plus one
  "Sunday tweak": the single highest-value change for next week.
- **Form-check CV** — phone-video pose tracking and bar-path analysis, deploying
  on serverless GPU (Modal).
- **B2B coach console** — coaches manage a client roster; clients inherit the
  coach's plan.
- **Infrastructure** — Stripe billing + live entitlement metering, Postgres
  (Supabase) with row-level security enabled, iOS/Android shells via Capacitor.

## Pricing (canonical — from `src/lib/limits.ts`)

| Plan  | Price                 | Form checks      | AI messages       |
|-------|-----------------------|------------------|-------------------|
| Free  | $0 (metered funnel)   | 3 / week         | 30 / week         |
| Pro   | $12/mo or $99/yr      | 100 / month      | 600 / month       |
| Coach | $20 / active client/mo| 200 /client/month| unlimited         |

- Free unlocks every feature but is metered.
- A coach's paying seats cover their whole active roster; each client inherits
  the coach tier. This makes coaches a distribution channel, not just revenue.
- **Blended consumer ARPU assumption:** ~$120/yr (between $99 annual and $144
  monthly-paid). Used in all market math below.

## Market sizing (assumptions are explicit; adjust here, not downstream)

**Bottom-up serviceable market (lead with this):**

| Step | Assumption | Value |
|------|------------|-------|
| US gym members | industry estimates | ~60M |
| Barbell-strength-primary share | 10% | ~6M |
| Serious/programmed lifters who'd pay for coaching-grade software | 15% | ~0.9M |
| Blended ARPU | $120/yr | — |
| **Bottom-up SAM (US consumer)** | 0.9M × $120 | **~$108M/yr** |

- English-speaking markets beyond the US (UK, CA, AU, EU) roughly double the
  reachable consumer base over time.
- **B2B upside:** tens of thousands of independent strength coaches; at $20 per
  active client even a modest roster per coach compounds the consumer number and
  brings ready-made user acquisition.

**Top-down (upside framing only):** the global fitness-app market is in the low
tens of billions of dollars and growing ~15–20%/yr (directional industry
figures). Liftly targets the strength/powerlifting wedge inside it.

> Every market number above is an estimate built from the labeled assumptions.
> Change an assumption here and propagate it to all other documents.

## Why now

1. **Form analysis is finally cheap.** Pose-estimation models run on serverless
   GPU for cents per clip — credible form feedback from a phone, no wearables.
2. **LLMs can explain coaching decisions** in plain language, so the software can
   show its reasoning instead of acting as a black box.
3. **Lifters already pay for human coaching** ($100–300/mo) delivered over
   spreadsheets and text. The loop is proven; the delivery is ripe for software
   margins.

## Differentiation

- **Explainable, not black-box** — a reason on the page for every change.
- **The whole loop in one product** — programming + logging + adaptation + form,
  vs. point tools that do only one.
- **Two-sided** — direct-to-lifter plus coach-led distribution.

## Competition (for consistency across docs)

- Static templates / spreadsheets (e.g. Boostcamp, Juggernaut-style plans) —
  don't adapt, no form feedback.
- Generic trackers (Strong, Hevy) — log only, no coaching.
- Human powerlifting coaches — adaptive and personal, but expensive, async, and
  unscalable.

## Team

- **Cofounders:** [Founder 1 — name, one-line background] · [Founder 2 — name,
  one-line background]. _Fill in before sending._

## The ask

- **No dollar ask yet.** Currently in conversations with early believers; not
  running a priced round. When this changes, set raise size + instrument +
  milestones here first.
