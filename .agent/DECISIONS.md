# ClubForge — Decision Log & Design Principles

> **Last updated:** 2026-07-02 (Phase 4 in progress)

---

## Core Principles

### 1. Club Operators Are the Customer
Every feature and UX decision serves the **club owner first**. Members are important, but the person paying for ClubForge is the operator. Admin dashboard must be the best part of the product.

### 2. SaaS-Native, Not Retrofitted
ClubForge is not a single-club app with multi-tenancy bolted on. Every new feature must be designed tenant-aware from the start. No hardcoded tenant assumptions.

### 3. Your Data Is Yours
Club owners own their data. Export anytime, no lock-in. This is a trust signal and a competitive differentiator. Data retained 90 days after cancellation, then purged.

### 4. Progression System Is the Moat
Belt/rank progression with grading + coach feedback + audit trail is what no competitor has. This is the primary differentiator and should be protected and enhanced.

### 5. Premium Look, Fast Experience
The UI must feel premium. Glassmorphism, gold accent, subtle animations. No generic Bootstrap look. Performance matters — fast page loads, responsive interactions.

---

## Major Decisions Made

### Naming & Branding
| Decision | Chosen | Alternatives Considered | Rationale |
|----------|--------|------------------------|-----------|
| Platform name | **ClubForge** | DojoHub, Sport of Kings | Generic enough for all club types, not just martial arts |
| Domain | `clubforgehq.com` | clubforge.io, clubforge.app | `.com` conveys professionalism |
| Subdomain pattern | `{slug}.clubforgehq.com` | `app.clubforge.com/{slug}` | Feels like each club has their own domain |

### Architecture
| Decision | Chosen | Alternatives Considered | Rationale |
|----------|--------|------------------------|-----------|
| Tenant resolution | Subdomain-based | Path-based (`/t/{slug}/`) | Cleaner URLs, feels more premium, each club gets "own site" |
| RLS enforcement | Supabase RLS with `current_tenant_id()` | Application-level filtering | Security at DB layer, impossible to leak cross-tenant data |
| Auth provider | Supabase Auth | NextAuth, Clerk | Already using Supabase for DB, simplifies stack |
| Provisioning | Service-role Supabase client | Client-side with elevated permissions | Bypasses RLS for atomic multi-table inserts, no auth edge cases |

### Pricing & Billing
| Decision | Chosen | Alternatives Considered | Rationale |
|----------|--------|------------------------|-----------|
| Tier names | Starter / Pro / Elite | Free / Growth / Enterprise | "Starter" implies low barrier, "Elite" implies exclusivity |
| Pricing | £39 / £129 / £349 | Lower entry, higher enterprise | Undercuts Mindbody (£139+) while including belt system |
| Platform fee | 2.5% on member payments | Flat rate, higher % | Transparent, aligns incentive (we grow when clubs grow) |
| Trial duration | 14 days | 7, 30 | 14 days enough to set up club + see value, not so long they forget |
| Payment during signup | **Collect payment method** | Card-free trial | Reduces abandoned trials, higher conversion, still 14 days free |
| Annual discount | 20% off | 10%, 25% | Standard SaaS practice, meaningful but not excessive |

### Registration Flows
| Decision | Chosen | Alternatives Considered | Rationale |
|----------|--------|------------------------|-----------|
| Club owner signup URL | `/get-started` | `/signup`, `/register` | `/register` already exists as member signup (1700 lines), `/get-started` is action-oriented |
| Club owner signup flow | 5-step wizard | Single long form | Reduces cognitive load, clear progress indicator |
| Member signup | Keep existing `/register` | Build new | 1700-line page works, will be adapted for per-tenant use in Phase 4 |
| Slug input | Auto-generate from club name, editable | Manual only | Reduces friction, most owners accept the auto-generated slug |

### Guardian / Child Accounts & Profile Media
| Decision | Chosen | Rationale |
|----------|--------|-----------|
| Child accounts | Phantom Supabase auth users linked via `profiles.parent_guardian_id`, `is_child = true` | Each child gets its own profile + membership while a guardian manages them |
| Guardian access to child data | Admin-backed `/api/member/*` (and `/api/parent/*`) endpoints that validate the parent-child link | `profiles`/`memberships` RLS has **no guardian policy** (only `auth.uid() = user_id` or admin), so the browser client can't touch a child's rows |
| Parent→child payments | `checkout-connected` validates the relationship instead of a strict `user.id === userId` check | A strict match returned 403 for every parent-paying-for-child checkout |
| Profile photo upload | Server-side via `POST /api/upload-profile-image` (admin client → public `avatars` bucket) | Client-side upload to `profile-images` was subject to Storage RLS / signup session and failed **silently**, saving null URLs |
| Mandatory photo | Validated in the register wizard AND upload runs before signup, hard-failing registration if a required photo can't be saved | "Mandatory" must guarantee the photo is stored, not merely selected |
| `isGuardianOnly` | Derived from "parent has **no membership row at all**" (any status) | Active-only misclassified a parent with a *pending* membership as guardian-only and hid their own payment banner |
| Pending membership on dashboard | Treated as "needs payment": shows Complete-Membership banner, hides the membership stat card | A pending row is not a real membership |
| Child announcement emails | Routed to the guardian's real email (children have dummy `@child.clubforge.local` addresses), deduped by destination | Children can't receive email; the guardian is the right recipient |

### Pages Removed
| Page | Reason |
|------|--------|
| `/launch` | Birthday celebration — club-specific, not SaaS |
| `/naseeha` | Redirect to `/dashboard/naseeha` — club-specific |
| `/join` | Location picker — per-club concept, not platform-level |

### Pages Retained
| Page | Reason |
|------|--------|
| `/waiver` | Waivers are relevant for individual clubs — kept as base template |
| `/register` | Will become per-tenant member registration in Phase 4 |
| `/waitlist-confirmation` | Waitlist concept applies to SaaS platform |

---

## Feature Gating Design

Features are gated server-side using `src/lib/feature-gate.ts`:

```
Starter: members, classes, attendance, basic_reports, belt_progression, 
         check_in, announcements, single_location, stripe_billing

Pro:     + events, email_templates, waitlist, advanced_reports, 
         multi_location, videos, naseeha, grading_feedback, 
         data_export_csv, data_export_json

Elite:   + custom_domain, api_access, white_label, automation, 
         unlimited_locations, priority_support, data_export_api, 
         webhooks, sla
```

Usage limits enforced per tier:
- Starter: 150 members, 1 location, 3 staff, 20 classes, 5 events
- Pro: 750 members, 3 locations, 10 staff, 100 classes, 50 events
- Elite: Unlimited everything

---

## Security Principles

1. **RLS everywhere** — every table has tenant_id + RLS policies. No exceptions.
2. **Service role only on server** — `supabase/admin.ts` never exposed to client
3. **Stripe handles PCI** — no card data stored in our DB
4. **Auto-cleanup on failure** — provisioning API deletes auth user if later steps fail
5. **Reserved slugs** — system names (www, api, admin, etc.) blocked from tenant use

---

## Patterns & Conventions

### File Naming
- Pages: `src/app/{route}/page.tsx`
- API routes: `src/app/api/{name}/route.ts`
- Components: `src/components/{ComponentName}.tsx` (PascalCase)
- Lib files: `src/lib/{name}.ts` (kebab-case)

### Component Patterns
- Server components by default (no `'use client'` unless needed)
- Client components marked with `'use client'` directive
- Inline styles for page-level components (using CSS variables)
- `glass-card` CSS class for card containers

### API Route Patterns
- Always validate with early returns
- Use `requireTenantId()` for tenant-scoped routes
- Use `createAdminClient()` for provisioning operations
- Template: validate → authenticate → authorize → execute → respond

### Supabase Patterns
- Server components: `createClient()` from `@/lib/supabase/server`
- Client components: `createClient()` from `@/lib/supabase/client`
- Admin operations: `createAdminClient()` from `@/lib/supabase/admin`
- Always `.eq('tenant_id', tenantId)` in queries (RLS is defense-in-depth)
- **No FK between `memberships` and `profiles`** (both only FK `auth.users`). Do
  NOT embed `profile:profiles!inner(...)` on `memberships` — PostgREST can't
  resolve the relationship and the whole query errors. Fetch member `user_id`s,
  then their profiles via `.in('user_id', …)`, and join in JS (see
  `/api/email/announcement`, and the admin members page).

### Tenant & Auth Resolution (IMPORTANT — caused multiple prod bugs)
Resolve the tenant from the **request context** (subdomain / custom domain →
`x-tenant-id` / `x-tenant-slug`, via `getTenantId()`), NOT by gating on the
user's `tenant_members` / `profiles` rows. Guardians, platform admins, and
multi-tenant users often lack a matching row, so membership-gated resolution
returns null/wrong and silently breaks flows.
- `requireAuth` (auth-guard) resolves role **scoped to the request tenant** and
  falls back to `platform_admins` (acting as admin of the browsed tenant) —
  mirrors the admin CRUD route. Never use an unscoped `.single()` on
  `tenant_members` (breaks for users in >1 tenant).
- Member catalog endpoints (`/api/member/locations-tiers`) and `/api/parent/add-child`
  resolve via `getTenantId()` first, `resolveTenantForUser` only as fallback.
  `resolveTenantForUser` itself falls back to `profiles.tenant_id`.
- Symptoms this class produced: guardian empty location dropdown / "Failed to
  load membership options" (fix `22e7560`). The `requireAuth` hardening
  (`4ca81cb`) prevents platform admins / multi-tenant users from getting spurious
  403s on admin endpoints. (NB: the HaMeem announcement-email "undefined sent,
  undefined failed" was a *separate* 500 — the recipient query embedded
  `profile:profiles!inner(...)` on `memberships`, but there is **no FK between
  memberships and profiles** (both only FK `auth.users`), so PostgREST couldn't
  resolve the embed; fix `e0b5216` fetches profiles separately. Not this auth
  class, and not the null-email guess (`0b00b21` was defensive hardening only).
  Verify with SQL/schema/logs before assuming.)

### Stripe Patterns
- Lazy initialization: `getStripeClient()` returns null if not configured
- Check `isStripeConfigured()` before Stripe operations
- Use `stripe-plans.ts` for plan/price mapping
- Platform fee: 2.5% via `PLATFORM_FEE_PERCENT` constant

---

## Known Technical Debt

1. **Build cache issue:** `.next/dev` sometimes caches references to deleted pages. Fix: `Remove-Item .next -Recurse -Force` before building.
2. **Stripe API version mismatch:** Legacy export uses `'2025-12-15.clover'`, new code uses `'2024-06-20'`. Should be unified.
3. **Register page size:** 1700 lines — needs refactoring into sub-components when adapted for per-tenant use.
4. **Professor vs Coach:** Role enum still uses `professor` — planned rename to `coach` in future migration.
5. **Tenant type duplication:** `Tenant` interface defined in both `types.ts` and `tenant.ts` — should be consolidated.
6. **Legacy null avatars:** members who registered before the server-side upload fix have `profile_image_url = null` and must re-upload (a dashboard reminder now prompts this). All new uploads land in the public `avatars` bucket via `/api/upload-profile-image`.
7. **Self-editable rank:** the member profile page lets a member (or a guardian for a child) change belt rank/stripes directly. Pre-existing behaviour, preserved — revisit if self-promotion should be blocked.
8. **`avatars` bucket auto-create:** several routes lazily `createBucket('avatars')` at runtime instead of a migration provisioning it. Consider a storage migration + explicit RLS policies.

---

## User Preferences (from conversations)

- Prefers collecting **payment method during signup** (not card-free trials)
- Public pages must **strongly reflect SaaS vision** — no single-club language
- Appreciates the **glassmorphism + gold/dark** aesthetic
- Values **comprehensive context preservation** for future sessions
- Wants each phase to be **build-verified** before moving on
- Comfortable with **incremental migrations** rather than a single big-bang schema change
