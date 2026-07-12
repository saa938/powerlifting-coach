# Liftly

**An AI powerlifting coach that closes the full loop — it programs your
training, retunes every target from the sets you log, checks your form from a
phone video, and tells you in plain words why each number moved.**

liftly.tech · pre-launch · [Founder 1] & [Founder 2] · ssanand@gmail.com

---

### The problem

Serious lifters are stuck between two bad options. Static template programs are
cheap but blind: they never adapt to the set you just did and give no feedback
on your form. A human powerlifting coach adapts and watches your technique, but
costs $100–300/month, answers async over spreadsheets and text, and can't scale.
Either way, getting form feedback means filming a lift, sending it off, and
waiting.

### What Liftly does

One product runs the whole coaching loop:

- **Programs and auto-tunes.** Log a working set — weight, reps, the RPE it felt
  like — and Liftly recomputes your next target from a rolling estimate of your
  one-rep max, then shows the new weight, the old one struck through, and a
  one-line reason. Built-in rails cap deloads and pull back reps when a newer
  lifter is grinding.
- **Reads your form.** A phone video runs through pose tracking and bar-path
  analysis to flag technique faults — no wearables, no waiting on a human.
- **Adapts on a schedule.** An optional 30-second readiness check sets a *soft*
  RPE ceiling for the day, and a weekly review surfaces one "Sunday tweak": the
  single highest-value change for next week.
- **Explains itself.** Every change comes with its reasoning on the page. Liftly
  never rewrites your program silently or tells you to train through sharp pain.

### Why now

Pose-estimation models now run on serverless GPU for cents per clip, so credible
form feedback from a phone is finally cheap. LLMs can explain a coaching
decision in plain language, so the software can show its work instead of acting
as a black box. And lifters already pay $100–300/month for human coaching
delivered over spreadsheets and text — the loop is proven; the delivery is ripe
for software margins.

### Proof it works (pre-launch, built today)

The closed loop is shipped and tested: Program → Execute → Review → Adapt, with
19 passing unit tests over the decision rules. Auto-tuning, readiness override,
weekly review, and the form-check CV pipeline (deploying on serverless GPU) are
all live in the product, alongside Stripe billing with usage metering, row-level
security on the database, and iOS/Android shells.

### Business model

Consumer subscription plus coach tooling:

- **Pro** — $12/mo or $99/yr for individual lifters.
- **Coach** — $20 per active client/mo; a coach's seats cover their whole
  roster, and each client inherits the coach tier. Coaches become a distribution
  channel, not just revenue.
- **Free** — every feature, metered, as the top of the funnel.

### Market

Bottom-up, the serviceable US market is roughly **$108M/year**: ~60M US gym
members → ~10% train barbell strength as their main modality → ~15% of those are
serious enough to pay for coaching-grade software (~0.9M lifters) at ~$120/year
blended. English-speaking markets beyond the US roughly double that, and the
$20-per-client coach channel adds B2B upside on top. The wider context is the
global fitness-app market — low tens of billions of dollars, growing ~15–20% a
year — within which Liftly owns the strength wedge. _(Assumptions are spelled out
in the source-of-truth doc and meant to be stress-tested.)_

### Why us

[Founder 1 — name + one-line background tying engineering and/or lifting
credibility to the product.] [Founder 2 — name + one-line background.] _Fill in
before sending._

### Where we are

Pre-launch with the full coaching loop already built and working. We're in early
conversations with people who believe lifters deserve a coach that explains
itself — not running a round yet.
