# ClubForge — Project Architecture & Context

> **Last updated:** 2026-07-02 (Phase 4 in progress — guardian/child flow, member payments, profile media, modal system)
> **Repository:** `c:\Users\user\dev\dojohub`
> **Live Domain:** `clubforgehq.com`

---

## What is ClubForge?

ClubForge is a **multi-tenant SaaS platform** for managing clubs (martial arts gyms, boxing clubs, dance studios, etc). It's the operating system that handles members, classes, attendance, billing, belt progression, and everything else a club operator needs.

**Origin:** Built originally as "Sport of Kings" (a single BJJ club app), then rebranded to "DojoHub", then to **"ClubForge"** as part of the SaaS transformation.

**Business Model:**
- Club owners pay ClubForge a monthly subscription (Starter £39 / Pro £129 / Elite £349)
- ClubForge takes 2.5% platform fee on member payments processed through Stripe Connect
- 14-day free trial, payment method required at signup

---

## Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| **Framework** | Next.js 14 (App Router) | `src/app` directory structure |
| **Language** | TypeScript | Strict mode enabled |
| **UI** | React 19 | Client + Server components |
| **Styling** | CSS Variables + Glassmorphism | Dark theme, gold (#c5a456) accent |
| **Icons** | Lucide React | Consistent icon library |
| **Auth** | Supabase Auth | Email/password, session cookies |
| **Database** | Supabase (PostgreSQL) | RLS enforced on all tables |
| **Payments** | Stripe | Platform subscriptions + Connect for club billing |
| **Deployment** | Vercel | Edge middleware, auto-deploy |
| **Email** | React Email templates | Stored in `src/lib/email-templates/` |

---

## Multi-Tenancy Architecture

### How Tenants Work

1. **Subdomain-based resolution:** `{slug}.clubforgehq.com` → middleware extracts slug
2. **Middleware** (`src/middleware.ts`) sets `x-tenant-id` and `x-tenant-slug` headers
3. **Server components** use `getTenantId()` / `requireTenantId()` from `src/lib/tenant.ts`
4. **Client components** use `useTenant()` hook from `src/lib/tenant-provider.tsx`
5. **Database** enforces isolation via RLS policies using `current_tenant_id()` function

### Tenant Resolution Flow

```
Browser → {slug}.clubforgehq.com
  → middleware.ts
    → extractSlugFromHost(host)
    → Supabase query: tenants WHERE slug = ? AND is_active = true
    → Sets x-tenant-id header
  → Server component / API route
    → getTenantId() reads header
    → All Supabase queries automatically scoped by tenant_id
```

### Database: Key Tables

| Table | Purpose | Tenant-scoped? |
|-------|---------|---------------|
| `tenants` | Club instances (slug, name, tier, Stripe IDs) | Root table |
| `tenant_members` | User ↔ Tenant junction with role | Yes |
| `profiles` | User details (name, belt, contact) | Yes |
| `locations` | Training venues | Yes |
| `membership_types` | Pricing/membership plans | Yes |
| `memberships` | Active member subscriptions | Yes |
| `classes` | Recurring class schedule | Yes |
| `attendance` | Check-in records | Yes |
| `belt_progression` | Belt/rank history | Yes |
| `events` | Seminars, competitions | Yes |
| `event_rsvps` | Event registrations + payments | Yes |
| `announcements` | Club news/updates | Yes |
| `videos` | Technique library | Yes |
| `naseeha` | Weekly advice/content | Yes |
| `waitlist` | Capacity overflow queue | Yes |

### Subscription Model

| Tier | Price | Members | Locations | Staff |
|------|-------|---------|-----------|-------|
| **Starter** | £39/mo (£31 annual) | 150 | 1 | 3 |
| **Pro** | £129/mo (£103 annual) | 750 | 3 | 10 |
| **Elite** | £349/mo (£279 annual) | ∞ | ∞ | ∞ |

Type enum: `'starter' | 'pro' | 'elite'` (updated from old `'free' | 'pro' | 'enterprise'`)

### Subscription Lifecycle

```
trialing → active (payment method added)
trialing → cancelled (trial expires)
active → past_due (payment fails)
past_due → active (payment recovered)
past_due → cancelled (3 failed attempts)
active → cancelled (owner cancels)
cancelled → active (resubscribes)
```

---

## Directory Structure

```
src/
├── app/
│   ├── (public pages)
│   │   ├── page.tsx          # SaaS landing page
│   │   ├── pricing/          # 3-tier comparison
│   │   ├── demo/             # Book a demo form
│   │   ├── about/            # Company story
│   │   ├── faq/              # SaaS FAQ (16 questions)
│   │   ├── privacy/          # SaaS privacy policy
│   │   ├── terms/            # SaaS terms of service
│   │   ├── get-started/      # Club owner onboarding wizard (5-step)
│   │   ├── login/            # Auth
│   │   └── register/         # Member registration (1700 lines, per-tenant in Phase 4)
│   │
│   ├── admin/                # Club admin dashboard
│   │   ├── page.tsx          # Admin overview
│   │   ├── members/          # Member management
│   │   ├── classes/          # Class scheduling
│   │   ├── events/           # Event management
│   │   ├── membership-types/ # Plan configuration
│   │   ├── reports/          # Analytics/reports
│   │   └── schedule/         # Schedule templates
│   │
│   ├── dashboard/            # Member dashboard
│   │   ├── page.tsx          # Member overview
│   │   ├── membership/       # Membership details
│   │   ├── progress/         # Belt progression
│   │   ├── events/           # Event RSVP
│   │   └── videos/           # Technique library
│   │
│   ├── instructor/           # Instructor dashboard
│   ├── professor/            # Professor dashboard
│   │
│   └── api/
│       ├── onboard/          # Tenant provisioning
│       ├── check-slug/       # Slug availability check
│       ├── stripe/           # Stripe webhooks/checkout
│       ├── admin/            # Admin operations
│       ├── attendance/       # Check-in
│       ├── grading/          # Belt promotions
│       └── email/            # Email sending
│
├── lib/
│   ├── types.ts              # All TypeScript interfaces
│   ├── tenant.ts             # Server-side tenant context
│   ├── tenant-provider.tsx   # Client-side tenant context
│   ├── feature-gate.ts       # Tier-based feature access control
│   ├── stripe.ts             # Stripe client (lazy init)
│   ├── stripe-plans.ts       # Plan config + Price IDs
│   ├── trial.ts              # Trial status calculator
│   ├── email.ts              # Email sending
│   ├── email-templates/      # React Email templates
│   ├── supabase/
│   │   ├── client.ts         # Browser Supabase client
│   │   ├── server.ts         # Server Supabase client
│   │   ├── middleware.ts     # Auth session refresh
│   │   └── admin.ts          # Service-role client (bypass RLS)
│   └── hooks/
│       └── useTenantId.ts    # Client hook for tenant ID
│
├── components/
│   ├── Navbar.tsx            # SaaS navigation
│   ├── Footer.tsx            # SaaS footer
│   ├── BJJBelt.tsx           # Belt rank display
│   ├── BeltSelector.tsx      # Belt picker
│   ├── Avatar.tsx            # User avatar
│   ├── AvatarUpload.tsx      # Avatar upload
│   ├── dashboard/            # Dashboard-specific components
│   ├── events/               # Event components
│   └── grading/              # Grading components
│
└── middleware.ts             # Root middleware (tenant + auth)
```

---

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (server-only, for provisioning) |
| `STRIPE_SECRET_KEY` | Stripe secret key (server-only) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |
| `STRIPE_PRICE_STARTER_MONTHLY` | Stripe Price ID for Starter monthly |
| `STRIPE_PRICE_STARTER_ANNUAL` | Stripe Price ID for Starter annual |
| `STRIPE_PRICE_PRO_MONTHLY` | Stripe Price ID for Pro monthly |
| `STRIPE_PRICE_PRO_ANNUAL` | Stripe Price ID for Pro annual |
| `STRIPE_PRICE_ELITE_MONTHLY` | Stripe Price ID for Elite monthly |
| `STRIPE_PRICE_ELITE_ANNUAL` | Stripe Price ID for Elite annual |
| `NEXT_PUBLIC_BASE_DOMAIN` | Base domain (default: `clubforgehq.com`) |

---

## Roles & Permissions

| Role | Scope | Capabilities |
|------|-------|-------------|
| **Admin** | Tenant-wide | Everything within the tenant (members, classes, events, settings) |
| **Instructor** | Assigned classes | Teach classes, take attendance, view assigned members |
| **Professor** | Assigned classes | Attendance, grading, feedback, belt promotions |
| **Member** | Own data | View schedule, check-in, view belt progress, RSVP to events |

> **Note:** Current DB enum is `member | instructor | professor | admin`. Future plans include adding `owner`, `coach`, and `staff` roles.

---

## Guardian / Child Accounts

A guardian (parent) can register and manage one or more children. Each child is a
**separate Supabase auth user** ("phantom" account) with its own `profiles` row,
linked to the guardian via `profiles.parent_guardian_id` (→ guardian's `profiles.id`)
and flagged `is_child = true`. Children may have their own `memberships`.

**RLS caveat (important):** `profiles`/`memberships` RLS only grants access when
`auth.uid() = user_id` (or admin/instructor). There is **no guardian policy**, so a
guardian's *browser* client cannot read or write a child's rows. All
guardian-on-behalf-of-child access therefore goes through **admin-backed API routes**
that re-validate the parent-child relationship server-side:

| Endpoint | Purpose |
|----------|---------|
| `GET /api/member/profile?userId=` | Read own or a child's full profile |
| `PATCH /api/member/profile` | Update own or a child's profile (whitelisted fields, admin client) |
| `GET /api/member/memberships?userId=` | Read own or a child's memberships |
| `GET /api/member/attendance-count?userId=` | Attendance count for own or a child |
| `GET /api/member/children` | List a guardian's children |
| `POST /api/parent/add-child` | Create a child (profile + membership + optional photo) |
| `POST /api/upload-profile-image` | Server-side avatar upload (admin → `avatars` bucket) |
| `POST /api/attendance/checkin` | Check in self or a child (guardian validated via admin client) |
| `GET /api/multisite/available-locations` | Multisite options for self or a child (auth: self/guardian/staff) |

The member dashboard uses a profile switcher (`DashboardProvider` + `ChildSwitcher`)
to select which profile (`selectedProfileId`) is viewed. Two derived flags drive
guardian UI, computed in `dashboard/layout.tsx`:
- `hasParentMembership` — parent has an **active** membership → controls the default
  selected profile (own vs first child).
- `isGuardianOnly` — parent has **no membership row at all** (any status) → suppresses
  the payment banner on the guardian's own profile. (Deliberately *not* active-only,
  so a parent with a pending membership still sees their own payment banner.)

Payments for a child are made by the guardian; `POST /api/stripe/checkout-connected`
allows a parent→child payment after validating the relationship.

### Profile Images / Storage
- Uploads go **server-side** through `POST /api/upload-profile-image` using the admin
  client into the public **`avatars`** bucket (auto-created if missing), path
  `profile-images/...`. This replaced client-side uploads to a `profile-images`
  bucket, which were subject to Storage RLS / signup-session state and failed
  *silently* (saving `null`).
- Rendered via `next/image`; `next.config.ts` allowlists
  `*.supabase.co/storage/v1/object/public/**`.
- Club setting `require_profile_photo` makes the photo mandatory at registration; the
  register flow uploads **before** account creation and hard-fails registration if a
  required photo can't be saved (no orphaned auth user, no silent null).

---

## Design System

### Colour Palette
- **Primary Gold:** `#c5a456` (used for CTAs, accents, highlights)
- **Background:** Dark gradient (`#0F172A` → `#1E293B`)
- **Dark Green:** `#1a3a2a` (secondary accent, nature/growth feel)
- **Text:** White/light gray hierarchy

### Design Language
- **Glassmorphism** cards (`backdrop-filter: blur`, semi-transparent backgrounds)
- **Gold accent** on all interactive elements
- **Subtle animations** (hover effects, transitions)
- **CSS Variables** for theming (`--color-gold`, `--bg-primary`, etc.)
- **Lucide React** icons throughout

### Key CSS Variables
```css
--color-gold: #c5a456
--color-green: #22c55e
--color-red: #ef4444
--bg-primary: dark background
--bg-secondary: slightly lighter card background
--text-primary: white/near-white
--text-secondary: gray
--text-tertiary: darker gray
--border-light: subtle border color
--radius-lg: border radius
--radius-xl: larger border radius
--radius-full: pill shape
--space-1 through --space-8: spacing scale
```

---

## Migrations History

| # | File | Phase | Purpose |
|---|------|-------|---------|
| 001 | `001_multi_tenancy.sql` | 1 | Tenants + tenant_members tables, tenant_id on all tables, RLS |
| 002 | `002_tenant_resolution_fallback.sql` | 1 | Fallback tenant resolution helpers |
| 003 | `003_tenant_gap_fix.sql` | 1 | Gap fixes for tenant context propagation |
| 004 | `004_onboarding_schema.sql` | 3 | Tier rename (free→starter, enterprise→elite), new columns, INSERT policies |
