# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Primary: the club owner / head coach** of a martial arts club (BJJ, MMA,
  karate, judo, taekwondo, boxing, kickboxing, Muay Thai), usually UK-based and
  usually running the club alongside teaching. Today they hold it together with
  spreadsheets, WhatsApp groups and a separate payment tool. They evaluate
  ClubForge on a phone or laptop between classes and pay for it themselves.
- **Secondary:** instructors (rosters, check-in, grading), members and
  parents/guardians (check-in, rank progress, membership and payments).

## Product Purpose

ClubForge is multi-tenant club management software: members, class timetable,
attendance, belt/rank progression, Stripe billing and a branded member portal
in one system, per club. Success is a club owner starting a trial at
`/get-started` and running their club from it.

## Positioning

Built for martial arts specifically: belt and rank progression with grading
history, coach feedback and an audit trail is native, not a bolt-on. It began
as the software for a working martial arts academy (originally "Sport of
Kings") before becoming a SaaS product.

## Operating Context

- Each club gets `{slug}.clubforgehq.com` (custom domain on Elite), with its own
  logo and colours for members.
- Club owners sign up through a 5-step wizard, choose a plan and enter card
  details in Stripe Checkout; a 14-day free trial follows and they are not
  charged until it ends.
- Members pay the club by card through Stripe Connect; the money goes to the
  club's own connected Stripe account.

## Capabilities and Constraints

Confirmed in code (2026-11):
- Members: profiles, roles, family/guardian accounts with child members,
  self-registration from the club link, admin "Add member", CSV export, a
  club-level waitlist.
- Classes: weekly timetable, instructor, location, capacity limit. Members see
  upcoming classes and check in. **There is no class booking and no per-class
  waitlist.**
- Attendance: one-tap member check-in, instructor class roster, attendance
  reports (by day, check-ins, averages).
- Rank progression: presets for BJJ adult, BJJ kids, karate, taekwondo, judo;
  stripes; promotion history with coach and feedback; can be switched off per
  club. **No custom rank-system builder.**
- Payments: Stripe subscriptions, one-off payments, invoices, promo codes,
  automatic email to the member on a failed payment, pending-payment reminders,
  finance view (revenue, subscription status), member payment portal.
- Events and ticketing; video library (Pro+); multi-location; advanced reports
  (churn rate, tenure, revenue by plan, belt distribution).
- A setup guide in the admin dashboard (`SetupWizard`) walks a new club through
  logo, locations, memberships, classes and belt system.
- Custom domain per club on Elite (for example hameem.uk), with the club's own
  logo and colours throughout.
- Policy: a cancelled club's data is kept for 90 days, then purged; owners can
  export at any time (.agent/DECISIONS.md, principle 3).
- **No tenant API keys or outbound webhooks exist**, although `/pricing` lists
  "API access & webhooks" on Elite. Do not repeat it elsewhere.
- **No measured setup time or usage statistics exist** ("most clubs…", "in
  under 10 minutes"). Describe the steps instead.
- **No member-import tool exists in the app**, although `/pricing` says CSV
  import is supported and offers migration assistance on Pro and Elite.
  Open decision for the owner: build it, or reword that claim.
- Pricing: Starter £39, Pro £129, Elite £349 per month (20% off annually);
  2.5% platform fee on member payments; no per-member charge, no setup fee.
  Plan limits: Starter 150 members / 1 location; Pro 750 / 3; Elite unlimited.

## Brand Commitments

- Name ClubForge; logo files in `public/logo-clubforge-*.svg`.
- Gold `#C5A456` accent on navy `#0F172A`; Outfit for headings, Inter for body
  (loaded in `src/app/layout.tsx`).
- Public pages speak to club owners about the platform, never as a single club.
- Plain UK English. Claims must be true of the product as it is today.

## Evidence on Hand

- A demo club, "Apex MMA Academy" (`apex-mma`), with 7 sample profiles. Too
  sparse for marketing screenshots, so the homepage uses illustrated versions of
  the real screens with sample data, labelled as such.
- The origin story (built inside a working academy) is real and already
  published.
- **No customer testimonials, logos with permission, case studies, review
  scores or usage statistics exist yet.** Do not invent any. Draft quotes
  awaiting sign-off from real club owners live in
  `src/components/home/social-proof.ts`.
- No competitor comparison pages exist yet (planned in `.agent/SEO_PLAN.md` C1).
- Pro is **not** the most-chosen plan among active clubs (2026-11-22: 7 Starter,
  6 Elite, 2 Pro), so it is labelled "Recommended", not "Most popular".
- A real photograph of the academy would strengthen the origin story; the
  owner has not supplied one and none may be generated.

## Product Principles

1. The club owner is the customer; every public page answers "what do I get and
   what does it cost" quickly.
2. Show the product doing its job rather than describing it.
3. Say only what the product does today; label sample data as sample data.
4. Progression (belts, gradings, feedback) is the differentiator; give it room.
5. Fast pages: marketing routes are statically rendered.
