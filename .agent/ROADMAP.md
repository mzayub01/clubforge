# ClubForge — Roadmap & Progress

> **Last updated:** 2026-09-05
> **Current Phase:** Phase 4 in progress (Member Experience)

---

## Transformation Timeline

| Phase | Name | Status | Key Deliverables |
|-------|------|--------|-----------------|
| 0 | Rebranding | ✅ Done | Sport of Kings → DojoHub → ClubForge |
| 1 | Multi-Tenancy Foundation | ✅ Done | tenant_id on all tables, RLS, middleware, context |
| 2 | Public Platform (SaaS Marketing) | ✅ Done | Landing page, pricing, demo, about, FAQ, privacy, terms |
| 3 | Onboarding & Provisioning | ✅ Done | Onboarding wizard, provisioning API, feature gate, Stripe plans, trial |
| **4** | **Member Experience** | 🔶 In progress | Per-tenant registration, theming, tenant settings, Stripe Connect, guardian/child flow, profile media |
| 5 | Platform Operations | ⬜ Planned | Super-admin dashboard, usage metering, tenant management |
| 6 | Scale & Differentiation | ⬜ Planned | Terminology engine, automation, custom domains, white-label |

---

## Phase 1 Details — Multi-Tenancy Foundation ✅

**What was built:**
- Added `tenant_id` UUID column to all 20 tables
- Created `tenants` and `tenant_members` tables
- Implemented RLS policies on every table using `current_tenant_id()` function
- Built subdomain-based tenant resolution middleware (`src/middleware.ts`)
- Created server-side tenant context (`getTenantId()`, `requireTenantId()`)
- Created client-side tenant context (`useTenant()` hook, `TenantProvider`)
- Updated all API routes to include tenant context
- Updated admin pages for tenant scoping

**Migrations:** `001_multi_tenancy.sql`, `002_tenant_resolution_fallback.sql`, `003_tenant_gap_fix.sql`

---

## Phase 2 Details — Public Platform ✅

**What was built:**
- Full SaaS landing page with hero, pain→solution, features, pricing preview, CTA
- 3-tier pricing comparison page with FAQ
- Demo booking form with self-service trial fallback
- About page (company origin story)
- FAQ with 16 questions across 5 categories (accordion UI)
- SaaS-context privacy policy (data processor vs controller, GDPR)
- SaaS-context terms of service (subscriptions, data ownership, 2.5% fee)
- Updated Navbar (Features, Pricing, Demo, Login, "Start Free Trial" CTA)
- Updated Footer (Product, Company, Legal columns)

**Deleted:** `/launch` (birthday page), `/naseeha` (redirect), `/join` (location picker)
**Fixed:** Dead `/join` link in `checkout/cancel/page.tsx` → `/pricing`

---

## Phase 3 Details — Onboarding & Provisioning ✅

**What was built:**
- Schema migration `004_onboarding_schema.sql` (tier rename, onboarding columns, INSERT RLS)
- Feature gate service (`feature-gate.ts`) — tier-based access + usage limits
- Stripe plans config (`stripe-plans.ts`) — plan mapping + price ID placeholders
- Service-role Supabase client (`supabase/admin.ts`) — for provisioning
- Trial management utilities (`trial.ts`) — 14-day countdown + warnings
- 5-step onboarding wizard (`/get-started`) — Your Details → Club → Location → Plan → Review
- Provisioning API (`/api/onboard`) — atomic pipeline: auth → tenant → profile → member → location → Stripe
- Slug availability API (`/api/check-slug`) — with reserved word blocking
- Updated types: `SubscriptionTier` → `'starter' | 'pro' | 'elite'`

**TODO before going live:**
- [ ] Run `004_onboarding_schema.sql` on Supabase
- [ ] Set `SUPABASE_SERVICE_ROLE_KEY` env var
- [ ] Create 3 Stripe Products with Price IDs
- [ ] Set `STRIPE_PRICE_*` env vars

---

## Phase 4 Plan — Member Experience

**Goal:** Club members can self-register and use their club's branded portal.

| Item | Description | Complexity |
|------|-------------|-----------|
| Per-tenant member registration | Adapt `/register` for `/{slug}/register` | High (1700-line page refactor) |
| Dynamic theming | Apply tenant's `primary_color` + logo across member-facing pages | Medium |
| Tenant settings page | `/admin/settings` — branding, contact info, terminology config | Medium |
| Stripe Connect onboarding | Club owner links their Stripe account at `/admin/settings/payments` | High |
| Member payment flow | Members pay club's connected Stripe account, ClubForge takes 2.5% | High |

---

## Phase 4 Progress — Member Experience 🔶

**Done so far (2026-06 → 2026-07):**
- Per-tenant member registration live at `/register` (adult + child), tenant-themed.
- Stripe Connect member payments — members pay the club's connected account, 2.5%
  platform fee (`/api/stripe/checkout-connected`, `checkout-success`).
- Tenant settings page (`/admin/settings`), including `require_profile_photo`.
- **Guardian / child flow** (see ARCHITECTURE → Guardian/Child Accounts):
  - Parent→child Stripe checkout (relationship-validated, was 403 for everyone).
  - Admin-backed `/api/member/*` endpoints (profile GET/PATCH, memberships,
    attendance-count, children) so guardians can view **and edit** children despite
    no guardian RLS policy.
  - Dashboard fixes: correct default profile, pending-membership banner, membership
    card gated to `active`, `isGuardianOnly` derived from "any membership row".
- **Profile pictures:** reliable server-side upload (`/api/upload-profile-image` →
  public `avatars` bucket); mandatory-photo enforced + hard-fails registration when
  it can't be saved; `AvatarUpload` uses the same path; dashboard reminder prompts
  members/guardians to add a missing photo.
- **Tenant/auth resolution hardening (2026-07):** member catalog endpoints and
  admin auth (`requireAuth`) now resolve the tenant from the request context
  (subdomain/custom domain), not the user's `tenant_members` rows. Fixed the
  guardian **empty location dropdown / "Failed to load membership options"**
  (reporter-confirmed) and platform-admin/multi-tenant 403s on admin endpoints.
- **Announcement emails (2026-07):** fixed a 500 that broke *all* announcement
  sends — the recipient query used an invalid `profiles!inner` embed on
  `memberships` (no FK). Now fetches profiles separately; child accounts route to
  the guardian's real email (deduped); legacy unlinked children fall back to
  their own real email. Modal shows a recipient-count preview (countOnly dry run
  of the same endpoint) before sending, and an opt-in checkbox to also include
  pending-payment members (default off).
- **Admin members page stats (2026-07):** membership-status stat cards with
  descriptors (Total Profiles / Active / Pending Payment / No Membership —
  mutually exclusive buckets), clickable as toggling filters; matching status
  dropdown options.
- **Promo codes (2026-07):** page always showed "Stripe Not Activated" because it
  gated on `stripe_account_id`, which `/api/admin/settings` strips as sensitive —
  now gates on a safe `has_stripe_account` boolean. `/api/stripe/coupons` was
  unauthenticated and trusted a client-supplied account id; now requires tenant
  admin (connected account resolved server-side) or platform admin (platform
  account), rate-limited.
- **Admin member editing (2026-07):** Edit Member modal now edits personal
  details (name, email incl. login email via auth admin API, phone, DOB) and
  membership tier (records only — not Stripe billing) via
  `POST /api/admin/update-member`. Members-page modals render via `ModalPortal`
  (portal to body) so dialogs are always viewport-centred — inline rendering
  could land them at the bottom of long pages. Stripe selectors (edit member +
  member profile) are schema-driven: hidden for no-stripe schemas
  (has_stripes=false presets), 0..max_stripes otherwise with 4/12 fallback.
- **Guardian child check-in (2026-07):** every guardian check-in 403'd — the
  endpoint validated the parent-child link by reading the child's profile with
  the user-scoped client (profiles RLS has no guardian policy). Lookups now use
  the admin client (fix `c75519d`); covers TodayClassCard, classes page and
  instructor attendance, which share `/api/attendance/checkin`. Sweeping the
  same pattern found two more (fix `315e5ab`): professor promotions silently
  updated 0 rows (grading/promote belt write ran as the caller; only admins
  pass RLS), and multisite available-locations 404'd for guardians (now has
  explicit auth + admin-client, tenant-scoped reads).
- **Platform mail merge (2026-07):** personal from-addresses (gmail etc.) made
  Resend reject the whole send. Unverified from-domains are now rewritten to
  `Name <noreply@clubforgehq.com>` with the requested address as Reply-To
  (verified domains configurable via `RESEND_VERIFIED_DOMAINS`).
- **Modal system overhaul (2026-07):** root cause of mis-anchored/clipped modals
  found — `.page-transition` (template.tsx) entrance animation persisted an
  identity transform (fill-mode both), making page divs the containing block for
  position:fixed; keyframes now end at `transform: none`. Overlay is scrollable
  with `.modal` centred via margin:auto + 90dvh (tall modals no longer clip the
  top). Since the CSS fix alone didn't resolve it in the field, ALL 23 modals
  across 17 files now render via `ModalPortal` (portal to document.body + scroll
  lock) — this is the convention for any new modal (see DECISIONS → CSS Gotcha).

- **Security hardening — responsible disclosure (2026-09-05):** an external
  researcher reported, and we confirmed live: anon SELECT on `tenants` (13
  active rows incl. contact + Stripe ids), bucket-wide `tenant-assets`
  policies (any signed-in user could list/overwrite/delete any club's logo —
  All Out Warriors' logo was destroyed during their proof), self-editable
  `profiles.role` (a real escalation via `resolveTenantForUser`'s profile
  fallback, not just a control-plane gap), and 42P17 recursion on
  `tenant_members`. Also found in the same pass: owner UPDATE on `tenants`
  allowed self-service tier/status changes; 004's INSERT policies let any
  signed-in user create tenants directly (any slug/tier); `avatars` and
  `videos` had the same policy shape. Fix = `014_security_hardening_authz.sql` + app release
  (middleware / manifest / check-slug / dashboard layout read `tenants_public`
  or use the admin client; logos upload via `/api/admin/upload-logo`; videos
  upload to `videos/<tenantId>/`). Verify with
  `scripts/verify-security-posture.mjs`; one-off cleanup flags in
  `scripts/cleanup-disclosure-2026-09.mjs`.
  **Status 2026-09-05:** 014 applied by the owner; verify script all-PASS
  (anon probes, plus storage/tenant probes signed in as an admin account);
  squatted `info@alloutwarriors.com` auth user deleted; All Out Warriors'
  dead `logo_url` cleared (club must re-upload). **Still pending:** enable
  CAPTCHA + Auth rate limits in the Supabase dashboard (needs token wiring in
  `/register`, `/get-started`, `/login`); researcher to validate with a plain
  member account (the role self-edit probe is inconclusive for admin accounts
  — admins may edit roles in their own club by design), then delete their two
  trial accounts (`scripts/cleanup-disclosure-2026-09.mjs
  --delete-researcher-accounts --yes`).

**Still open in Phase 4:**
- Per-tenant registration page refactor (still ~1700 lines).
- Dynamic theming coverage audit across all member-facing pages.
- Backfill/prompt existing members with `profile_image_url = null`.

---

## Phase 5 Plan — Platform Operations

**Goal:** ClubForge team can manage all tenants from a central dashboard.

**Started early (2026-09-05) — `/platform/tenants` tenant health view:**
per-tenant Status (is_active + subscription status), Stripe Connect state
(connected / pending setup / not connected, from `stripe_connect_enabled` +
`stripe_account_id`), Trial ends (days left, "ended Xd ago" for lapsed
trials), and Last used (latest auth sign-in across the tenant's members,
owner and guardian profiles, or latest attendance check-in — computed in
`GET /api/platform/tenants` from auth users — RPC `platform_user_activity()`
if optional migration 015 is applied, else adaptive `listUsers` paging that
skips the one corrupt auth row — plus `attendance.check_in_time`; cached 2 min). Clickable summary chips filter (active,
inactive, on trial, trial ended, past due, Stripe connected / not), sort by
last used / trial ending / newest / members / name. Detail panel adds owner
email + last sign-in, billing-customer presence, Stripe account id, last
sign-in vs last check-in.

| Item | Description |
|------|-------------|
| Super-admin dashboard | `/platform-admin` — tenant list, revenue, health metrics |
| Usage metering | Track member count, location count per tenant for limit enforcement |
| Tenant management | Upgrade/downgrade, suspend, extend trial, impersonate |
| Platform analytics | MRR, churn rate, trial conversions, ARPU |
| Broadcast messaging | Platform-wide announcements to all club owners |

---

## Phase 6 Plan — Scale & Differentiation

**Goal:** Features that no competitor has.

| Item | Description |
|------|-------------|
| Dynamic terminology engine | "Belt" → "Rank" → "Grade" based on club type |
| Automation workflows | Grading → email notification → certificate generation |
| Custom domain mapping | Pro+ clubs map their own domain via Vercel API |
| White-label CSS injection | Elite clubs customize colors, fonts, logo placement |
| Content marketing | Blog, docs, API docs, changelog |

---

## Competitor Landscape

| Competitor | Price/mo | ClubForge Advantage |
|-----------|---------|-------------------|
| Mindbody | £139-£699 | Cheaper, faster, progression system |
| Glofox | £110-£300 | Belt/rank system, white-label |
| Gymdesk | £65-£125 | Multi-tenant, belt system, modern UI |
| Zen Planner | £99-£227 | Modern stack, faster UX |

**ClubForge's moat:** Structured progression system (belt → grading → coach feedback → audit trail). No competitor has this end-to-end.
