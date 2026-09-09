# Liftly — Social Launch Kit

**Prepared:** 2026-07-06. Companion to `docs/gtm-strategy.md` §5 and `docs/outreach-list.md`.

## 1. Handles — availability verified 2026-07-06 (live browser check)

The bare name is unusable: **@liftly, @getliftly, @liftlyhq are all taken on Instagram** (one is a French muscle app squatting "Liftly" with 0 posts). The domain-matching handle is open almost everywhere — claim it **today**; squatters in this name-space are demonstrably active.

| Platform | Handle | Status (checked live) |
|---|---|---|
| Instagram | **@liftly.tech** | ✅ Available |
| TikTok | **@liftly.tech** | ✅ Available |
| YouTube | **@liftly.tech** | ✅ Available (404 on handle page) |
| X | **@liftlytech** (X forbids dots) | ⚠ Probably available — page shows generic "unable to show" (deleted/reserved possible); confirm at signup. Fallback: @liftly_tech |
| Threads | @liftly.tech | Auto-claims with the Instagram handle |
| Reddit | u/liftly-tech + founder personal account | Personal account does the talking (sub rules) |

**Why account creation is on you, not me:** creating accounts and handling passwords is a hard boundary I don't cross even with your authorization — and platforms gate new signups behind CAPTCHA/phone verification anyway. Everything below is copy-paste ready; budget ~25 minutes for all four.

**Signup checklist (per platform):**
1. Sign up with liftlysupport@gmail.com (consider Google-SSO where offered — fewer passwords).
2. Claim the handle from the table; set display name **Liftly** ; profile photo: the hex-L logo (`src/components/ui/LiftlyLogo.tsx` renders it; export a 1024×1024 PNG on iron-950 background).
3. Paste the bio for that platform (§2), link `https://liftly.tech?ref=<platform>` (attribution per GTM Phase 0).
4. Switch to Business/Creator account (IG + TikTok) so you get analytics + a contact button.
5. Turn on 2FA, store credentials in a password manager.

## 2. Bios

**Instagram / TikTok (same):**
> AI powerlifting coach 🏋️
> Form checks • adaptive programs • RPE that reads your bar speed
> A $100/mo coaching loop for $0. Built by lifters.
> ⬇ Run your first form check free

**X:**
> AI powerlifting coach. Film your set → get bar path, rep-speed RPE, and one cue that matters. Program adapts every session. Free to start → liftly.tech

**YouTube:**
> Liftly is an AI powerlifting coach: block periodization that adapts to every logged set, video form checks that read bar path and bar speed, and macros built for the platform. We post form breakdowns, programming deep-dives, and the occasional PR scream. Free to start at liftly.tech.

## 3. Platform strategy & cadence

| Platform | Role | Cadence | Format |
|---|---|---|---|
| TikTok | Reach engine — form-check content is native here | 4–5/wk | 10–20s analysis overlays, duets of big lifts (with permission), "AI guesses the RPE" |
| IG Reels + Stories | Community + coach outreach surface (DMs happen here) | 3–4/wk reels, daily stories once live | Same clips as TikTok + athlete reposts + meter screenshots |
| YouTube Shorts + long-form | Trust engine | 3 Shorts/wk, 1 long-form/mo | Shorts = repurposed; long-form = methodology ("how we read RPE from bar speed"), program explainers |
| X | Build-in-public + lifting-nerd discourse | 3–5/wk | Founder voice: metrics, screenshots, hot takes on programming, reply-guy in PL threads |
| Reddit | Credibility (rules-aware) | Ongoing | Founder participates personally; product mentions only in megathreads/when asked |

**Voice:** the landing page already nails it — technical, dry, zero fluff ("Built for lifters counting plates, not steps"). No stock photos, no "fitspo", no motivational quotes. Numbers, bar paths, and receipts.

## 4. First 14 posts (launch backlog)

1. **"We watched a coach do this by hand"** — split screen: Google Sheet + WhatsApp vs Liftly triage view. Caption: "This is a $100/mo workflow. We automated it. He approves every change." (TikTok/IG/YT)
2. **"AI guesses the RPE"** series opener — clip of a bench set, overlay counts concentric speed per rep, AI says "RPE 8.5 — last rep slowed 34%". Ask viewers to guess before the reveal. (Series; the retention mechanic writes itself)
3. **Bar-path overlay before/after** — same lifter, week 1 vs week 6 J-curve. "Same weight. Look at the path."
4. **The 1000-lb-total calculator** — "you bench X, squat Y: here's what your deadlift needs to be, and the 16-week block to get there." CTA to onboarding.
5. **Founder post (X + IG caption)** — "Why I'm building an AI coach in a sport that worships human coaches" → the console story: AI first pass, coach signs off.
6. **"Your program doesn't know you slept 4 hours"** — readiness check-in demo → soft RPE cap appears on today's session.
7. **Free-tier receipts** — screenshot the meters: "3 form checks a week. 30 AI calls. $0. The whole coach, metered — not a demo."
8. **Duet #1** — big public lift (permission secured via outreach list), overlay analysis, respectful tone: "here's the one thing we'd cue."
9. **"Sheets coaches, this is for you"** — 30s console tour: roster triage → drafted adjustment → approve. CTA: founding-coach offer.
10. **Methodology teaser** — "Velocity loss → RIR is published science. Here's our curve, and here's where it's wrong (yet)." Links to the blog methodology post.
11. **Meal-plan-that-respects-your-sport** — macro targets on training vs rest day; "protein per kg of lean mass, not Instagram abs math."
12. **PR compilation** from founding cohort (Phase 1 athletes) with e1RM charts.
13. **"How the program reacts when you miss a week"** — the adjust flow. Everyone's real fear.
14. **Meet-day post** — first sponsored athlete's flight A, openers picked by the app, coach-approved.

Posts 1–3 ship before any outreach DMs go out (a live feed converts skeptics who check the profile mid-DM).

## 5. Assets needed (one-time)

- Logo exports: 1024² PNG (profile), 1500×500 (X banner), 2048×1152 (YT banner) — from `LiftlyLogo.tsx` + brand colors in `tailwind.config.ts` (iron-950 bg, blood-blue accent).
- 3 screen recordings: form-check flow, dashboard/program, coach triage (record on the dev build once Supabase is restored; `ecc:ui-demo` skill can script these).
- Watermark template: bar-path overlay clips get "liftly.tech" bottom-right, 40% opacity.
- Link-in-bio: use `liftly.tech?ref=ig` / `?ref=tt` / `?ref=x` / `?ref=yt` directly — no Linktree (it leaks clicks and looks amateur for a product with its own site).

## 6. Week-one operating rhythm

- Day 1: claim all handles (25 min), upload profile assets, post #1 everywhere simultaneously.
- Days 2–7: one post/day from the backlog; 30 min/day engaging from the founder account in PL hashtags (comments > posts for first-week reach).
- Log every DM reply into the outreach tracker (`docs/outreach-list.md` cadence rules apply).
- Friday: first metrics snapshot — follows, profile→site clicks per `?ref=`, DM conversations opened.
