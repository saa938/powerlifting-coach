# Liftly — Go-to-Market Strategy

**Prepared:** 2026-07-06
**Product:** liftly.tech — AI powerlifting coach (adaptive block periodization, CV form check, nutrition, AI chat) + coach console (roster triage, per-seat billing) + coach marketplace.
**Grounding:** this doc builds on the primary research in `docs/market-research-outreach.md` (June 2026 IG DM study), the live pricing/caps in `src/lib/limits.ts` and `src/lib/stripe.ts`, and July 2026 competitor/market research (sources at bottom).

---

## 1. The one-paragraph strategy

Liftly sells the $100/mo remote-coaching loop (video review + RPE + weekly sheet update) as software: instant instead of weekly, $12/mo instead of $100, with a real coach console so human coaches join the funnel instead of fighting it. We win the **intermediate milestone-chaser** (the "get me to a 1000 total" lifter) through the channel our own research proved works — direct, peer-to-peer contact in a community that answers cold DMs — amplified by coach-in-bio referral partnerships, SEO content that's already built, and short-form form-check content that demos the product in 15 seconds. We do **not** chase elite lifters (they autoregulate by feel and don't buy programs) and we do **not** sell the form check as a grader (the community treats form as individual judgment — we sell prioritized, individualized cues).

## 2. Market

**Category size.** OpenPowerlifting tracks ~992k unique competitive lifters (3.9M meet entries, 62.8k meets) and the sport is growing ~5.9%/yr, fastest (8.8%/yr) in the 21–25 cohort — exactly the demographic that lives on Instagram/TikTok and pays for apps. Competitive lifters are the visible tip: for every meet entrant there are many gym powerlifters running Sheiko/531/GZCLP off spreadsheets (Boostcamp alone markets 11,000+ programs; LiftVault's spreadsheet library is a top SEO property in the niche).

**Serviceable market, bottom-up.** Three buyer pools:
1. **Self-coached intermediates** (core): run free spreadsheets or $35/mo JuggernautAI; milestone-driven; want feedback, not just numbers. If US+EN market is ~500k active gym powerlifters and 10% will pay for software, that's ~50k × $99–144/yr ≈ **$5–7M ARR** attainable ceiling for the athlete side alone.
2. **Coached athletes** ($100–300/mo): our research's "Sam" client. We convert them directly (cheaper) or via their coach (console).
3. **Small remote coaches** (5–30 clients on Sheets+WhatsApp): the B2B2C wedge. Each coach conversion brings their whole roster at $20/seat/mo.

**Competitor map & where we fit.**

| Competitor | Price | What they are | Our edge |
|---|---|---|---|
| JuggernautAI | $34.99/mo, $349.99/yr | Best-known AI programming (Chad W. Smith brand) | 1/3 the price; form check + nutrition + chat they don't have; no coach console |
| Boostcamp | Free / $59.99/yr Pro | Program library + tracker | We adapt the program; they host static templates. Their free tier is our top-of-funnel competitor, not their Pro |
| Sheiko app, Alpha Progression, Dr. Muscle | $5–20/mo | Single-method or generic AI progression | Sport-specific: RPE autoregulation + meet peaking + form check |
| TrueCoach / CoachRx | $29–165/mo + 2–5% payment fees | Coach delivery tools (all sports) | They're a filing cabinet; we do the first pass on every client (triage + drafted adjustments) and we're powerlifting-native |
| Human remote coach (RTS $99–220/mo, TSA ~$190–240/cycle, "Sam" $100/mo) | $100–300/mo | The real incumbent | Instant turnaround vs weekly; 1/8 the price; and via the console we *arm* them instead of only competing |

**Naming risk (act on this).** "Liftly" is used by at least six unrelated fitness apps (gym trackers, voice loggers, a goliftly.com). Handles like @liftly are taken. Mitigations: (a) brand consistently as **Liftly · AI Powerlifting Coach** with @getliftly / @liftlyhq handles; (b) never buy the bare "liftly" keyword; own "AI powerlifting coach" instead; (c) before any paid spend or app-store submission, run a proper trademark search in class 9/41/42 — a rename is cheap now and expensive in six months. SEO note: our domain liftly.tech + powerlifting-specific content means we don't collide with the trackers in search intent.

## 3. ICP and positioning

**Primary ICP — "the 1000-total chaser."** 20–35, 1–4 years of structured training, totals ~800–1200 lb, follows strong lifters on IG, copies their programs, asks them questions in DMs (we literally watched this happen). Round-number goal, no system to reach it. Willing to pay: anchored by $35/mo JuggernautAI and $100/mo human coaches. Buys when they see *their own* lift analyzed, not a feature list.
- Message: **"Your coach charges $100/mo to look at your videos once a week. Liftly looks at every set, tonight, for $12."**

**Secondary ICP — the small remote coach.** 5–30 clients, $80–150/mo each, Google Sheets + WhatsApp video + weekly rebuild. Tedium: watching every video, rebuilding sheets, chasing check-ins. Fear: an app replacing them. Position the console as **leverage, not replacement**: "The AI takes the first pass. You approve every change. Nothing ships without your sign-off" (already the landing-page copy — keep it). $20/seat/mo is margin-positive for them at any client price above ~$40/mo, and per-active-client billing matches roster churn.
- Message: **"Coach twice the roster at the same quality. Your eyes, everywhere."**

**Explicit anti-ICPs** (from the research): elite/by-feel lifters (won't follow a program; use them as *distribution*, not customers), CrossFit/general fitness (dilutes the sport-specific moat), federations/teams (sales cycle too slow for now).

**Positioning statement.** For intermediate powerlifters chasing a milestone total, Liftly is the AI coach that runs the same loop as a $100/mo human coach — watch the video, read the RPE, adjust the program — instantly and for $12/mo. Unlike JuggernautAI (programming only) or TrueCoach (a delivery tool), Liftly closes the whole loop: program → form check → readiness → adaptation, and gives human coaches a console instead of a fight.

**Form-check framing rule** (research finding 6): never "pass/fail", never a grade. Always "here's the one thing to fix first, on *your* leverages." This is both honest (matches how coaches think) and defensible (a grader invites nitpick videos from experts; prioritized cues invite discussion).

## 4. Pricing (validate, don't change)

Current: Free (3 form checks/wk, 30 AI calls/wk — whole product unlocked, metered), Pro $12/mo or $99/yr (100 checks/mo, 600 AI/mo), Coach $20/active-client/mo (200 checks/client, unlimited AI). Unit costs ~$0.005/form check → 90–95% gross margin (see `src/lib/stripe.ts`).

Why this is right for launch: free tier is a *real* coach (not a teaser) → community won't call it a bait app; $12 vs Juggernaut's $35 makes switching an easy tweet; $99/yr ≈ one month of a human coach — use that line everywhere. Two adds worth testing later, not now: a $199 "meet prep" one-off (8-week peak + openers, mirrors TSA's $240 custom-cycle price point) and a founding-coach lifetime discount (see §6).

## 5. Channels, ranked by evidence

1. **Peer/influencer DM outreach (proven by us).** Near-100% reply rate to cold DMs in this community. Run the playbook in `docs/outreach-list.md`: 10 DMs/day, personalized to a recent lift post, free Pro for the lifter + a form-check of their own video as the hook. Goal: 20 coach-in-bio partners in 90 days.
2. **Coach referral loop (the incumbent funnel, borrowed).** Every strong athlete funnels followers to a "coach in bio." Give partner coaches: free console until 5 clients, a referral code (their followers get an extended trial; they get 20% of year-one revenue on athletes who don't want a human coach, paid quarterly). The coach keeps their brand; we're infrastructure.
3. **Short-form form-check content (product-as-content).** The form check IS a demo: 15-second before/after bar-path overlays, "AI reads this lifter's RPE from bar speed — was it right?" TikTok/IG Reels/YT Shorts. 3 posts/wk minimum, native per platform. Duet/stitch big lifts with the analysis overlay (ask permission → that's also outreach).
4. **SEO (already built, extend).** 5 solid guides live (RPE, block periodization, form check, nutrition, AI apps comparison — the money keyword). Sitemap/canonicals/robots fixed in this session; AI-crawler-friendly robots.txt already welcomes GPTBot/Claude/Perplexity (good: "best AI powerlifting coach" queries in chatbots are a growing referrer). Next 10 posts target program-name keywords where Boostcamp/LiftVault rank: "Calgary Barbell program review", "Sheiko vs RPE", "first powerlifting meet checklist", "e1RM calculator" (build the calculator as a free tool page — link magnet).
5. **Reddit/Discord (earn, don't spam).** r/powerlifting (~500k) bans self-promo outside megathreads: participate as lifters, share the free e1RM tool when asked, run one transparent "we built this, roast us" post from the founder account when the product is polished. Powerlifting Discords (federation, RTS, SBS communities): same rule — be useful first.
6. **Paid (later).** Not until organic proves the message. When ready: IG/TikTok retargeting off the form-check content only; never bid on "liftly" (name collision wastes spend).

## 6. Launch sequencing (90 days)

**Phase 0 — Ship-blocker week (now).**
- Restore the Supabase project (it's currently dead — the whole backend is down; see session notes), re-run the smoke tests, and re-seed demo data.
- Trademark search on "Liftly"; register @getliftly/@liftlyhq handles everywhere (kit in `docs/social-launch-kit.md`).
- Instrument: Vercel Analytics is in; add signup-source attribution (a `?ref=` param persisted through onboarding → `athletes` metadata) so channel ROI is measurable from day one.

**Phase 1 — Founding cohort (weeks 1–4).** Goal: 100 athletes, 5 coaches, zero paid spend.
- Re-open the ~8 warm DM threads from the June research with the finished product (they already talked to us — warmest leads we own).
- "Sam" gets white-glove onboarding as coach #1; his roster is the console case study.
- 25 outreach DMs/wk from the founder handle (not the brand): offer free Pro + a personal form-check review.
- Post the build-in-public thread on X + one r/powerlifting megathread entry.
- Success metric: ≥40% of signups run a form check in week 1 (activation), ≥25% W4 retention on loggers.

**Phase 2 — Coach-in-bio flywheel (weeks 5–8).** Goal: 20 partners, 500 athletes.
- Convert Phase-1 relationships into referral codes + revenue share.
- Ship the "share my form check" public page (route exists: `/api/formcheck/share`) with Liftly branding → every shared check is an ad.
- 3 short-form posts/wk; start the duet/stitch motion.
- Publish the e1RM calculator tool page + 4 new SEO posts.

**Phase 3 — Meet-season push (weeks 9–13).** Goal: 1,500 athletes, $3k MRR, 40 coach seats.
- Meet-prep angle: partner athletes post "peaking with Liftly" through a real meet; sponsor 3–5 mid-tier lifters' meet entries (~$100 each — cheapest sports sponsorship in existence).
- Leaderboard content: "Liftly athletes totaled X kg at USAPL Y" — the marketplace leaderboard page becomes social proof.
- First paid retargeting test if organic CAC < $15.

## 7. Metrics that decide things

| Metric | Target | What it decides |
|---|---|---|
| DM → signup rate | ≥25% | Below → the offer, not the channel, is wrong; change the hook |
| Signup → first form check (7d) | ≥40% | Below → onboarding friction; the form check must be minute-one magic |
| W4 logging retention | ≥25% | Below → program quality problem; fix before scaling any channel |
| Free → Pro (90d) | ≥5% | Below → meter too generous or value prop soft; tune `PLAN_CAPS` |
| Coach seats / partner coach | ≥4 | Below → console isn't saving real time; sit with coaches and watch |
| Organic CAC (time-loaded) | <$15 | Above → stop, fix retention first |
| Gross margin | ≥85% | Watch Modal GPU + Gemini costs per `stripe.ts` notes |

## 8. Risks & pre-committed responses

1. **Supabase free tier as prod.** It just auto-paused and took the site down. Before any launch traffic: move to Supabase Pro ($25/mo) or at minimum a keep-alive cron. This is a $25 fix for a company-killing failure mode.
2. **Name collision.** Six other Liftlys. Decision rule: if trademark search shows a live mark in fitness software, rename before Phase 2 (candidates should keep the lift + tech shape: e.g. "Liftly" → decision for founder, not this doc).
3. **CV form-check skepticism from experts.** Mitigation is the framing rule (§3) plus publishing our velocity-loss→RPE methodology as a blog post — transparency converts the skeptics who lead opinion.
4. **A coach backlash narrative ("AI taking coaching jobs").** The console + revenue share IS the mitigation; lead every coach conversation with "you approve every change."
5. **JuggernautAI ships a form check.** Our moat is loop-closure + price + coach channel, not any single feature; accelerate coach lock-in (per-seat billing = switching cost).
6. **LLM/GPU cost spike.** Caps are env-tunable (`PLAN_CAPS`); margins have 10x headroom; provider layer is already dual-vendor.

## 9. Sources

- Primary: `docs/market-research-outreach.md` (June 2026 DM study — ICP, $100/mo coach anchor, channel proof).
- [JuggernautAI pricing](https://www.juggernautai.app/pricing), [Arvo pricing roundup](https://arvo.guru/vs/juggernaut-ai), [PowerliftingTechnique review](https://powerliftingtechnique.com/juggernaut-ai-review/)
- [Boostcamp](https://www.boostcamp.app/) and [Boostcamp powerlifting comparison](https://www.boostcamp.app/best/powerlifting)
- [TrueCoach pricing](https://truecoach.co/pricing/), [2026 coaching-software pricing comparison](https://assistantcoach.fit/blog/real-cost-fitness-coaching-software/), [CoachRx](https://www.coachrx.app/)
- [RTS coaching](https://store.reactivetrainingsystems.com/collections/coaching) ($99–220/mo), [TSA weekly coaching](https://www.thestrengthathlete.com/weeklycoaching), [Calgary Barbell app](https://www.calgarybarbell.com/training-app)
- [TuffWraps powerlifting statistics](https://www.tuffwraps.com/blogs/news/powerlifting-statistics) (OpenPowerlifting: ~992k lifters, 5.9%/yr growth, 8.8%/yr in 21–25)
- Liftly name collisions: [App Store 1](https://apps.apple.com/us/app/liftly-gym-tracker/id6762517196), [2](https://apps.apple.com/us/app/liftly-voice-workout-logging/id6752257498), [3](https://apps.apple.com/us/app/liftly-custom-workout-plans/id6752532677), [goliftly.com](https://www.goliftly.com/), [liftlygym.com](https://liftlygym.com/)
