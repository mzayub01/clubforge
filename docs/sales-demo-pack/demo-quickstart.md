# 🚀 Demo Environment — Quick-Start Card

> Get the demo running in under 2 minutes.

---

## Demo Tenant

| | |
|---|---|
| **Club Name** | Apex MMA Academy |
| **Slug** | `apex-mma` |
| **Primary Colour** | `#e63946` (red) |
| **Tagline** | Train Hard. Fight Smart. |
| **Subscription Tier** | Pro (active) |

---

## Login Credentials

### 👤 Admin Login
| | |
|---|---|
| **Email** | `demo-admin@clubforgehq.com` |
| **Password** | `ClubForge2026!` |
| **Name** | James Rodriguez |
| **Role** | Admin |
| **URL** | `clubforgehq.com/login` |
| **After login** | Go to `/admin` for the admin dashboard |

### 👥 Member Login
| | |
|---|---|
| **Email** | `demo-member@clubforgehq.com` |
| **Password** | `ClubForge2026!` |
| **Name** | Sarah Chen |
| **Role** | Member |
| **URL** | `clubforgehq.com/login` |
| **After login** | Go to `/dashboard` for the member portal |

> **Pro tip**: Open the admin in a normal browser window and the member in an **incognito/private window** — this lets you flip between both views during the demo.

---

## Pre-Seeded Demo Data

The demo tenant comes loaded with realistic data so every screen looks populated:

### Members (7 total)

| Name | Role | Belt Rank | Membership |
|---|---|---|---|
| James Rodriguez | Admin | — | All-Access |
| Sarah Chen | Member | White (0 stripes) | Adults |
| Tom Wilson | Member | Blue (0 stripes) | Adults |
| Emma Taylor | Member | White (2 stripes) | Adults |
| Liam Patel | Member | Purple (0 stripes) | All-Access |
| Olivia Jones | Member (kid) | — | Kids |
| Noah Smith | Member (kid) | — | Kids |

### Classes (5)

| Class | Type | Day | Time |
|---|---|---|---|
| Fundamentals BJJ | BJJ | Monday | 18:00–19:30 |
| Advanced No-Gi | No-Gi | Wednesday | 19:00–20:30 |
| Kids Jiu-Jitsu | Kids | Saturday | 10:00–11:00 |
| Muay Thai | Striking | Tuesday | 18:00–19:30 |
| Open Mat | Open | Friday | 17:30–19:00 |

### Membership Types

| Plan | Price | Duration |
|---|---|---|
| Adults | £39.99/mo | 30 days |
| Kids | £24.99/mo | 30 days |
| All-Access | £69.99/mo | 30 days |

### Other Data
- **Attendance records**: 20+ check-ins across multiple members and classes
- **Belt progressions**: Grading history for 4 members
- **Announcements**: 2 active (welcome message + seminar notice)
- **Location**: Apex MMA - Central, 42 Warrior Lane, Manchester M1 4BT (capacity: 120)

---

## Key Pages to Bookmark

### Admin Pages (log in as Admin)

| Page | URL Path | What it Shows |
|---|---|---|
| Dashboard | `/admin` | KPIs, overview |
| Members | `/admin/members` | Full member directory |
| Classes | `/admin/classes` | Class schedule |
| Class Roster | `/admin/class-roster` | Per-class check-in |
| Attendance | `/admin/attendance` | Attendance analytics |
| Finance | `/admin/finance` | Revenue & subscriptions |
| Membership Types | `/admin/membership-types` | Tier configuration |
| Promo Codes | `/admin/promo-codes` | Discount codes |
| Grading Settings | `/admin/grading-settings` | Belt schemes |
| Professor Access | `/admin/professor-access` | Instructor permissions |
| Announcements | `/admin/announcements` | Club announcements |
| Invite | `/admin/invite` | Member invitations |
| Events | `/admin/events` | Event management |
| Locations | `/admin/locations` | Multi-site setup |
| Settings | `/admin/settings` | Club branding & config |
| Reports | `/admin/reports` | Analytics & reports |
| Data Export | `/admin/data-export` | CSV/JSON downloads |

### Member Pages (log in as Member)

| Page | URL Path | What it Shows |
|---|---|---|
| Dashboard | `/dashboard` | Member home |
| Classes | `/dashboard/classes` | Class schedule |
| Attendance | `/dashboard/attendance` | Check-in history |
| Progress | `/dashboard/progress` | Belt progression |
| Profile | `/dashboard/profile` | Personal details |
| Payments | `/dashboard/payments` | Payment history |
| Announcements | `/dashboard/announcements` | Club updates |

---

## Resetting Demo Data

If the demo data gets messy (someone deleted members, changed settings, etc.):

1. Open the **Supabase SQL Editor** for the project
2. Run `supabase/seed_demo_tenant.sql`
3. This will re-seed all tenant data using `ON CONFLICT DO NOTHING` — safe to run multiple times

> ⚠️ **Note**: The two base auth users (admin & member) must exist in Supabase before running the seed. If they were deleted, recreate them via the Supabase Dashboard first:
> - Admin: `demo-admin@clubforgehq.com` / `ClubForge2026!`
> - Member: `demo-member@clubforgehq.com` / `ClubForge2026!`

---

## Troubleshooting

| Issue | Fix |
|---|---|
| Can't log in | Check credentials above. Password is case-sensitive. |
| Data looks empty | Re-run `seed_demo_tenant.sql` in Supabase SQL Editor |
| "Tenant not found" error | Ensure the tenant record exists in `public.tenants` |
| Stripe features show errors | Expected in demo — Stripe price IDs are fake. Finance dashboard still works. |
| Member can't see classes | Verify their `tenant_members` and `memberships` records exist |

---

*Last updated: February 2026 · ClubForge Demo Pack v1.0*
