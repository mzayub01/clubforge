'use client';

import Link from 'next/link';
import { useState, useMemo } from 'react';
import {
    Search, BookOpen, Users, MapPin, Calendar, CheckCircle,
    Video, Award, CreditCard, Settings, Palette, Mail, Shield,
    HelpCircle, ArrowRight, ChevronDown, ChevronRight,
    UserPlus, ClipboardList, Bell, BarChart3, Ticket,
    GraduationCap, FileText, Megaphone, ExternalLink,
} from 'lucide-react';

// ===============================================
// Help Center Data
// ===============================================

interface HelpArticle {
    id: string;
    title: string;
    content: string;
    tags: string[];
}

interface HelpCategory {
    id: string;
    title: string;
    description: string;
    icon: React.ComponentType<{ size?: number; color?: string }>;
    articles: HelpArticle[];
}

const helpCategories: HelpCategory[] = [
    {
        id: 'getting-started',
        title: 'Getting Started',
        description: 'Set up your club, complete onboarding, and get your first members.',
        icon: BookOpen,
        articles: [
            {
                id: 'onboarding-wizard',
                title: 'Completing the Setup Wizard',
                content: `When you first sign up for ClubForge, the **Setup Wizard** will guide you through everything you need to get your club running.

**Step 1 — Club Profile**: Enter your club name, tagline, and contact details. Upload your logo (recommended 200×200px, PNG or SVG). Your club URL will be automatically generated based on your club name (e.g. \`your-club.clubforgehq.com\`).

**Step 2 — Add a Location**: Every club needs at least one location. Enter the address and any capacity limits. You can add more locations later from **Admin → Your Club → Locations**.

**Step 3 — Create Membership Plans**: Set up the membership tiers you offer (e.g. "Adult Monthly", "Junior Pay-as-you-go"). You can specify pricing, billing intervals, and which locations each membership applies to.

**Step 4 — Set Up Classes**: Create your class schedule — name, day, time, location, and capacity. You can assign instructors to classes once you've added them.

**Step 5 — Invite Your Team**: Add your instructors and coaches. They'll receive an invitation email and get their own instructor dashboard.

> **Tip**: You can also visit **Admin → Settings** at any time to revisit these steps.`,
                tags: ['setup', 'onboarding', 'getting started', 'wizard', 'first time'],
            },
            {
                id: 'admin-dashboard',
                title: 'Understanding the Admin Dashboard',
                content: `Your admin dashboard is home base — it gives you a real-time snapshot of your club's health.

**Quick Stats**: At the top, you'll see your total members, active memberships, classes this week, and today's attendance.

**Setup Progress**: If you haven't completed all setup steps, a checklist will guide you through the remaining items.

**Revenue Overview**: See your monthly revenue, trial status, and current plan.

**Navigation**: Use the sidebar on desktop (or bottom nav on mobile) to navigate between sections:
- **Overview** — Dashboard with stats and setup progress
- **Members** — All Members, Memberships, Waitlist, Instructors, Professor Access, Invite Members
- **Your Club** — Locations, Membership Plans, Classes, Class Roster, Grading
- **Engagement** — Announcements, Events, Videos, Weekly Wisdom, Email Templates, Promo Codes
- **Money** — Finance and Attendance reports
- **Settings** — Club configuration, branding, and payments
- **Help Centre** — You're here!`,
                tags: ['dashboard', 'overview', 'navigation', 'home', 'admin'],
            },
            {
                id: 'sharing-registration',
                title: 'Sharing Your Registration Link',
                content: `Once your club is set up, you can start accepting members immediately.

**Your registration link**: \`your-club.clubforgehq.com/register\`

This link takes new members to a branded registration page that shows:
- Your club name and logo
- Available locations (if multi-site)
- Membership types with pricing
- Club etiquette/rules (if configured)
- Liability waiver acceptance
- Payment via Stripe (if connected)

**How to share it**:
- Add it to your website or social media bios
- Share in your club WhatsApp group
- Print it on flyers with a QR code
- Include it in welcome emails

> **Note**: If Stripe isn't connected, members can still register — their membership will be created as "pending" and you can activate it manually from the Memberships page.`,
                tags: ['registration', 'sign up', 'join', 'link', 'invite', 'share', 'url'],
            },
        ],
    },
    {
        id: 'members',
        title: 'Managing Members',
        description: 'Add, edit, and manage your club members and their profiles.',
        icon: Users,
        articles: [
            {
                id: 'viewing-members',
                title: 'Viewing & Searching Members',
                content: `Navigate to **Admin → Members → All Members** to see all your club members.

**Search**: Use the search bar to find members by first name, last name, or email.

**Member cards** show each member's:
- Name, email, and profile photo
- Belt/rank (if applicable)
- Membership status (active, pending, expired)
- Join date

**Click a member** to view their full profile including attendance history, belt progression, and contact details.`,
                tags: ['members', 'search', 'find', 'view', 'list', 'profiles'],
            },
            {
                id: 'adding-members-manually',
                title: 'Adding Members Manually',
                content: `While most members will self-register via your registration link, you can also add them manually.

**Admin → Members → Invite Members**

1. Enter the member's email address
2. They'll receive an invitation email with a link to complete their registration
3. When they click the link, they'll create a password and fill in their profile details

> **Tip**: For children, the parent/guardian registers an account first, then adds their children via the member portal.`,
                tags: ['add member', 'create', 'invite', 'manual', 'new member'],
            },
            {
                id: 'member-roles',
                title: 'Understanding Member Roles',
                content: `ClubForge has three main user roles:

**Admin** — Full access to all settings, data, and management features. Typically the club owner or business manager. Can:
- Manage all members, classes, locations, and settings
- View financial data and reports
- Connect Stripe and manage billing
- Add/remove instructors

**Instructor** — Limited dashboard for coaches and teachers. Can:
- View class rosters and take attendance
- Record student progress and belt promotions
- Submit feedback on students
- Access their assigned classes

**Member** — The member portal. Can:
- View their dashboard, upcoming classes, and events
- Check in to classes
- View their belt progression and history
- Update their profile
- RSVP to events

> **Note**: Role assignments are managed by admins through the **Admin → Members → All Members** page.`,
                tags: ['roles', 'admin', 'instructor', 'member', 'permissions', 'access'],
            },
        ],
    },
    {
        id: 'memberships',
        title: 'Memberships & Billing',
        description: 'Set up membership types, manage subscriptions, and handle payments.',
        icon: CreditCard,
        articles: [
            {
                id: 'membership-types',
                title: 'Creating Membership Plans',
                content: `Go to **Admin → Your Club → Membership Plans** to configure the memberships your club offers.

Each membership type needs:
- **Name** — e.g. "Adult Monthly", "Junior Quarterly", "Family Annual"
- **Price** — the amount charged
- **Billing interval** — monthly, quarterly, or annually
- **Location** — which location(s) this membership applies to

**Location modes** (configurable in Settings → Branding):
- **Per Location**: Members choose a specific location when registering. Best for clubs with distinct branches.
- **All Locations**: One membership covers all locations. Members can attend anywhere.

> **Tip**: You can deactivate membership types without deleting them. Deactivated types won't appear on the registration page but existing members keep their membership.`,
                tags: ['membership types', 'pricing', 'tiers', 'plans', 'billing', 'subscriptions'],
            },
            {
                id: 'managing-memberships',
                title: 'Managing Active Memberships',
                content: `View all memberships at **Admin → Members → Memberships**.

**Statuses**:
- 🟢 **Active** — Current, paid-up membership
- 🟡 **Pending** — Registered but awaiting payment (or manual activation)
- 🔴 **Expired** — Membership has lapsed
- ⏸️ **Cancelled** — Member or admin cancelled

**Actions you can take**:
- **Activate** — Approve pending memberships
- **Cancel** — End a membership immediately
- **Change type** — Move a member to a different membership tier
- **Extend** — Manually extend the expiry date

> **If Stripe is connected**: Members pay automatically via Stripe. Active memberships will renew automatically. You can manage refunds and cancellations from your Stripe Dashboard.`,
                tags: ['memberships', 'active', 'pending', 'expired', 'manage', 'status', 'payments'],
            },
            {
                id: 'stripe-connect',
                title: 'Setting Up Stripe Payments',
                content: `ClubForge uses **Stripe Connect** so payments go directly to your bank account.

**To connect Stripe**:
1. Go to **Admin → Settings → Payments tab**
2. Click **"Connect with Stripe"**
3. You'll be redirected to Stripe to create or connect an account
4. Complete the Stripe onboarding (identity verification, bank details)
5. Once done, you'll be redirected back to ClubForge with a success message

**How payments work**:
- When a member registers and chooses a paid membership, they pay via Stripe Checkout
- The payment goes directly to your Stripe account
- ClubForge takes a **2.5% platform fee** per transaction
- Stripe's standard processing fees also apply (typically 1.4% + 20p for UK cards)
- Payouts go directly to your bank on your configured Stripe schedule

**Without Stripe**: Members can still register — memberships are created as "pending" and you activate them manually after receiving payment offline.`,
                tags: ['stripe', 'payments', 'connect', 'billing', 'bank', 'fees', 'payout'],
            },
            {
                id: 'waitlist',
                title: 'Managing the Waitlist',
                content: `If a membership type or location is at capacity, new members are automatically placed on a **waitlist**.

View and manage the waitlist at **Admin → Members → Waitlist**.

**How it works**:
1. You set capacity limits on location membership configurations
2. When capacity is reached, the registration page shows "Join Waitlist" instead of "Register"
3. The member fills in their details and gets a confirmation that they're on the waiting list
4. When a spot opens, you can approve waitlisted members from the admin dashboard

> **Tip**: Use the waitlist strategically — it creates demand and lets you manage growth at your own pace.`,
                tags: ['waitlist', 'capacity', 'waiting list', 'full', 'limit'],
            },
        ],
    },
    {
        id: 'classes',
        title: 'Classes & Schedule',
        description: 'Create your class schedule, assign instructors, and manage capacity.',
        icon: Calendar,
        articles: [
            {
                id: 'creating-classes',
                title: 'Creating & Editing Classes',
                content: `Go to **Admin → Your Club → Classes** to manage your class schedule.

**To create a class**, click the **"Add Class"** button and fill in:
- **Name** — e.g. "Adult BJJ", "Kids Karate", "Open Mat"
- **Day** — Which day of the week
- **Time** — Start time and duration
- **Location** — Which of your locations this class runs at
- **Instructor** — Assign a coach (optional)
- **Capacity** — Maximum students per class (leave blank for unlimited)
- **Membership types** — Which membership types can attend this class

**To edit or deactivate** a class, click it in the list and update the details.

> **Tip**: Want different instructors on different weeks? You can update the instructor assignment as needed — the change takes effect from the next class.`,
                tags: ['classes', 'schedule', 'create', 'timetable', 'add class', 'capacity'],
            },
            {
                id: 'class-roster',
                title: 'Class Rosters',
                content: `View the roster for any class at **Admin → Your Club → Class Roster**.

The roster shows:
- All members who are eligible for the class (based on their membership type)
- Their attendance streak and total check-ins
- Their belt/rank level

**Instructors** can also view their class rosters from the **Instructor Dashboard → Classes** page, so they always know who to expect on the mat.`,
                tags: ['roster', 'class list', 'students', 'who is in class'],
            },
            {
                id: 'instructor-access',
                title: 'Managing Instructor Access',
                content: `Control which instructors have access to which classes via **Admin → Members → Professor Access**.

**Assign instructors to classes** — each instructor will only see the classes they're assigned to in their instructor dashboard.

**Instructor capabilities**:
- View their class roster
- Take attendance / check-in members
- Record promotions and belt progression
- Leave feedback on student performance

**Adding a new instructor**:
1. Create them as a member (or they self-register)
2. Go to **Admin → Members → All Members** and change their role to "Instructor"
3. Assign them to their classes via **Admin → Members → Professor Access**`,
                tags: ['instructors', 'coaches', 'teacher', 'access', 'assign', 'professor'],
            },
        ],
    },
    {
        id: 'attendance',
        title: 'Attendance Tracking',
        description: 'Track class attendance, view reports, and monitor member engagement.',
        icon: CheckCircle,
        articles: [
            {
                id: 'how-checkin-works',
                title: 'How Check-In Works',
                content: `ClubForge makes attendance tracking effortless with **one-tap check-in**.

**For members**:
1. Log in to the member portal
2. On the dashboard, they'll see a **"Today's Class"** card showing their next eligible class
3. Tap **"Check In"** — available from 1 hour before the class starts until the class ends
4. A confirmation appears with a success message

**For instructors and admins**:
- Instructors can check in members manually from the instructor dashboard
- Admins can view and manage all attendance from **Admin → Money → Attendance**

**For parents**:
- Parents can check in their children through the parent portal
- They see the same "Today's Class" card for each child

> **Note**: Check-in is available from **1 hour before** the class start time. Members won't see the check-in button outside this window.`,
                tags: ['check in', 'check-in', 'attendance', 'turn up', 'present', 'tap in'],
            },
            {
                id: 'attendance-reports',
                title: 'Viewing Attendance Reports',
                content: `View attendance data at **Admin → Money → Attendance**.

**What you can see**:
- Full attendance history for all classes
- Filter by date range, class, or member
- Total check-ins per member
- Class attendance averages

**Member-level view**: Click any member to see their personal attendance history — which classes they attended, when they last trained, and their attendance streak.

**Why it matters**: Attendance data is one of the most valuable tools for retention. Members who stop training often churn — monitoring attendance lets you reach out before they leave.`,
                tags: ['attendance', 'reports', 'history', 'tracking', 'analytics', 'retention'],
            },
        ],
    },
    {
        id: 'belt-progression',
        title: 'Belt & Rank Progression',
        description: 'Manage grading schemes, record promotions, and track student progress.',
        icon: Award,
        articles: [
            {
                id: 'belt-overview',
                title: 'Belt Progression Overview',
                content: `ClubForge includes a **full structured ranking system** — one of our unique features that no other platform offers natively.

**What's included**:
- Separate **adult and youth** belt schemes
- Full **grading history** with timestamps and recorded-by data
- **Instructor feedback** forms for each student
- **Promotion audit trail** — who promoted whom and when
- Belt display on member profiles and class rosters

**How promotions work**:
1. An instructor assesses a student (tracked via the instructor dashboard)
2. The instructor records a promotion — selecting the new belt level
3. The promotion is logged with a timestamp and the instructor's name
4. The member sees their updated belt on their profile

> **Tip**: Use the **Professor Feedback** feature to leave detailed notes on student performance before and after gradings. These build up into a progression journal that members really value.`,
                tags: ['belt', 'rank', 'grading', 'promotion', 'progression', 'martial arts', 'level'],
            },
            {
                id: 'professor-feedback',
                title: 'Leaving Student Feedback',
                content: `Instructors can leave structured feedback on students via **Instructor Dashboard → Students** or through the **Admin → Your Club → Grading** page.

**Feedback includes**:
- The student's name and current belt level
- Free-text notes from the instructor
- Date and timestamp

**Where members see it**: Members can view their received feedback on their **Belt Progress** page in the member portal.

> **Tip**: Regular feedback builds trust and retention. Even a brief note after a class — "Great guard passing today, keep working the underhook" — goes a long way in showing members you care about their development.`,
                tags: ['feedback', 'professor', 'instructor', 'notes', 'progress', 'review'],
            },
        ],
    },
    {
        id: 'events',
        title: 'Events',
        description: 'Create events, manage RSVPs, and run one-off sessions or seminars.',
        icon: Ticket,
        articles: [
            {
                id: 'creating-events',
                title: 'Creating Events',
                content: `Events are for things outside your regular class schedule — seminars, gradings, open days, competitions, social events.

Go to **Admin → Engagement → Events** and click **"Create Event"**.

**Event details**:
- **Title** — e.g. "Belt Grading Day", "Open Mat Sunday", "Guest Seminar"
- **Description** — Full details about the event
- **Date and time** — When it happens
- **Location** — Where it takes place
- **Capacity** — Maximum attendees (optional)

**RSVPs**: Members can RSVP to events from their member portal. You can see who's coming from the admin events page.

> **Tip**: Use events for belt gradings — it's a great way to manage who signs up and track capacity.`,
                tags: ['events', 'seminar', 'grading', 'competition', 'social', 'rsvp', 'create event'],
            },
        ],
    },
    {
        id: 'communication',
        title: 'Communication',
        description: 'Announcements, email templates, and keeping your members informed.',
        icon: Megaphone,
        articles: [
            {
                id: 'announcements',
                title: 'Sending Announcements',
                content: `Keep your members in the loop with announcements at **Admin → Engagement → Announcements**.

**Create an announcement**:
- **Title** — Headline text
- **Content** — Full message body
- **Visibility** — Choose who sees it

Announcements appear on the member dashboard so they're visible as soon as members log in.

> **Tip**: Use announcements for schedule changes, upcoming events, or club news. It's a great alternative to WhatsApp groups for official communications.`,
                tags: ['announcements', 'news', 'notifications', 'communication', 'messages'],
            },
            {
                id: 'email-templates',
                title: 'Email Templates',
                content: `Manage your club's email templates at **Admin → Engagement → Email Templates**.

ClubForge sends automated emails for key events:
- **Welcome email** — Sent when a new member registers
- **Membership confirmation** — Sent after successful payment
- **Event RSVP confirmation** — Sent when a member RSVPs

You can customise the content of these templates to match your club's tone and branding.

> **Note**: All emails are sent from your configured ClubForge domain and include your club logo and branding.`,
                tags: ['email', 'templates', 'automated', 'welcome', 'confirmation'],
            },
            {
                id: 'weekly-wisdom',
                title: 'Weekly Inspiration',
                content: `The **Weekly Wisdom** feature (found at **Admin → Engagement → Weekly Wisdom**) lets you share inspirational quotes, advice, or wisdom with your members.

**How it works**:
- Create entries with a title, content, and optional category
- Members see the latest wisdom on their dashboard
- Great for sharing martial arts philosophy, motivational quotes, or club values

This feature is especially popular with martial arts clubs that value discipline, respect, and personal development beyond physical training.`,
                tags: ['inspiration', 'quotes', 'motivation', 'wisdom', 'weekly'],
            },
        ],
    },
    {
        id: 'videos',
        title: 'Video Library',
        description: 'Upload and share instructional videos with your members.',
        icon: Video,
        articles: [
            {
                id: 'managing-videos',
                title: 'Managing Your Video Library',
                content: `Build a training resource library at **Admin → Engagement → Videos**.

**Adding videos**:
- **Title** — Descriptive name (e.g. "Triangle Choke from Guard")
- **Video URL** — Link to YouTube, Vimeo, or any hosted video
- **Category / Tags** — Organise by technique, belt level, or topic

**Where members see them**: Members access the video library from their portal at the **Videos** page. They can browse and search for techniques.

> **Tip**: Upload technique breakdowns, drill demonstrations, or even competition footage. A solid video library adds massive value to your membership — members train smarter between classes.`,
                tags: ['videos', 'library', 'tutorials', 'techniques', 'instructional', 'youtube'],
            },
        ],
    },
    {
        id: 'locations',
        title: 'Multi-Location Management',
        description: 'Add locations, configure capacity, and manage multi-site operations.',
        icon: MapPin,
        articles: [
            {
                id: 'managing-locations',
                title: 'Managing Locations',
                content: `Manage your club's physical locations at **Admin → Your Club → Locations**.

**Adding a location**:
- **Name** — e.g. "Main Gym", "City Centre Branch"
- **Address** — Full address
- **Capacity** — Maximum members at this location (optional)

**Location-specific configuration**:
- You can configure which membership types are available at each location
- Classes are assigned to specific locations
- Attendance is tracked per location

> **Multi-site plans**: Starter plans support 1 location, Pro supports up to 3, and Elite supports unlimited locations.`,
                tags: ['locations', 'sites', 'branches', 'multi-site', 'address', 'gym'],
            },
            {
                id: 'capacity-management',
                title: 'Capacity & Membership Limits',
                content: `Control how many members can join at each location through **Location Membership Configs**.

This is especially useful for:
- Gyms with limited mat or floor space
- Clubs that want to maintain quality by limiting class sizes
- Managing demand through waitlists

**Setting capacity**:
1. Go to **Admin → Your Club → Locations**
2. Edit a location and set the capacity
3. When capacity is reached, new registrations for that location will go to the waitlist automatically

> **Tip**: Set capacity slightly below your actual limit to maintain a premium feel and keep class quality high.`,
                tags: ['capacity', 'limits', 'size', 'maximum', 'members', 'waitlist'],
            },
        ],
    },
    {
        id: 'promo-codes',
        title: 'Promotions & Discounts',
        description: 'Create promo codes, run special offers, and incentivise sign-ups.',
        icon: Ticket,
        articles: [
            {
                id: 'promo-codes',
                title: 'Creating Promo Codes',
                content: `Create discount codes at **Admin → Engagement → Promo Codes** to incentivise sign-ups and reward loyalty.

**Promo code options**:
- **Code** — The text code members enter (e.g. "SUMMER50", "FRIEND20")
- **Discount type** — Percentage off or fixed amount
- **Usage limits** — Maximum number of times the code can be used
- **Expiry date** — When the offer ends

**Where members use them**: During the registration checkout process, members can enter a promo code to apply the discount.

> **Tip**: Create a referral code for existing members — give them a unique code to share that offers a discount to new sign-ups. Great for word-of-mouth growth.`,
                tags: ['promo', 'discount', 'coupon', 'offer', 'code', 'referral'],
            },
        ],
    },
    {
        id: 'settings',
        title: 'Settings & Configuration',
        description: 'Configure your club profile, branding, payments, and subscription.',
        icon: Settings,
        articles: [
            {
                id: 'general-settings',
                title: 'General Settings',
                content: `Access club settings at **Admin → Settings → General**.

**Configurable fields**:
- **Club Name** — Displayed across the platform
- **Club URL** — Your subdomain (auto-generated, can be customised on Elite)
- **Tagline** — A short description shown on your club's portal
- **Contact Email** — For member enquiries
- **Contact Phone** — Displayed on your club portal

Settings are auto-saved when you click "Save Changes".`,
                tags: ['settings', 'general', 'name', 'url', 'contact', 'profile'],
            },
            {
                id: 'branding-settings',
                title: 'Branding & Customisation',
                content: `Make ClubForge truly yours at **Admin → Settings → Branding**.

**Visual Identity**:
- **Club Logo** — Upload your logo (PNG or SVG, 200×200px recommended). It appears in the sidebar, member portal, and registration page.
- **Brand Colour** — Pick your primary colour. It's used across the entire portal — buttons, accents, headers.

**Registration Content**:
- **Welcome Message** — Shown at the top of your registration page
- **Etiquette / Rules** — Members must acknowledge these before completing registration. Leave blank to skip.
- **Liability Waiver** — Custom waiver text members must accept. Leave blank to use the default.

**Membership Settings**:
- **Location Mode** — "Per Location" (members choose a location) or "All Locations" (one membership covers all sites).
- **Require Profile Photo** — Toggle whether members must upload a photo during registration.`,
                tags: ['branding', 'logo', 'colour', 'color', 'theme', 'customise', 'waiver', 'registration'],
            },
            {
                id: 'subscription-plans',
                title: 'ClubForge Subscription Plans',
                content: `View and manage your ClubForge plan at **Admin → Settings → Subscription**.

**Available plans**:

| Plan | Monthly | Annual (save 20%) | Members | Locations |
|------|---------|-------------------|---------|-----------|
| **Starter** | £39/mo | £31/mo | Up to 150 | 1 |
| **Pro** | £129/mo | £103/mo | Up to 750 | 3 |
| **Elite** | £349/mo | £279/mo | Unlimited | Unlimited |

**Pro adds**: Advanced email templates, priority support, 3 locations, up to 750 members.

**Elite adds**: Unlimited everything, custom domain, white-label branding, dedicated support, API access.

**All plans include**: 14-day free Pro trial, member management, classes, attendance, belt progression, events, videos, and Stripe integration.

> **Tip**: Start with the free trial — it gives you full Pro access so you can explore everything. You can downgrade to Starter anytime.`,
                tags: ['pricing', 'plan', 'subscription', 'upgrade', 'tier', 'starter', 'pro', 'elite'],
            },
        ],
    },
    {
        id: 'security',
        title: 'Security & Data',
        description: 'Data privacy, security features, and export options.',
        icon: Shield,
        articles: [
            {
                id: 'data-isolation',
                title: 'Data Security & Tenant Isolation',
                content: `ClubForge takes data security seriously. Here's how we protect your club's data:

**Row-Level Security (RLS)**: Every database table uses Row-Level Security policies that ensure complete data isolation between clubs. Club A can never see Club B's data — not even accidentally.

**Encryption**: All data is encrypted in transit (TLS 1.3) and at rest.

**Authentication**: Secure email/password authentication with PKCE-based session management.

**No data sharing**: We never share your data with third parties, advertisers, or other clubs.

**Data export**: You can always export your data. Your data belongs to you, not us.`,
                tags: ['security', 'privacy', 'data', 'encryption', 'rls', 'isolation', 'gdpr'],
            },
            {
                id: 'data-export',
                title: 'Exporting Your Data',
                content: `You can export your member data at any time.

**How to export**:
- From **Admin → Members → All Members**, look for the export/download option
- Choose CSV format for spreadsheet-compatible output

**What's included**: Member names, emails, membership types, belt ranks, join dates, and contact details.

> **Our promise**: Your data belongs to you. If you ever decide to leave ClubForge, you can export everything. No lock-in, no hostage data.`,
                tags: ['export', 'download', 'csv', 'data', 'backup', 'migration'],
            },
        ],
    },
    {
        id: 'support',
        title: 'Getting Support',
        description: 'How to get help, report issues, and contact the ClubForge team.',
        icon: HelpCircle,
        articles: [
            {
                id: 'contact-support',
                title: 'Contacting Support',
                content: `We're here to help! Here's how to reach us:

**Email**: [support@clubforgehq.com](mailto:support@clubforgehq.com)

**Response times**:
- 🥉 **Starter** — Email support, 48-hour response
- 🥈 **Pro** — Priority email, 24-hour response
- 🥇 **Elite** — Dedicated support with SLA guarantee

**When contacting support, please include**:
1. Your club name
2. A clear description of the issue or question
3. Screenshots if applicable (especially for UI issues)
4. The steps you took that led to the problem`,
                tags: ['support', 'help', 'contact', 'email', 'issue', 'bug', 'problem'],
            },
            {
                id: 'common-issues',
                title: 'Common Issues & Troubleshooting',
                content: `**"Members can't register"**
- Check that your registration link is correct: \`your-club.clubforgehq.com/register\`
- Verify you have at least one active membership type
- If Stripe isn't connected, membership will be "pending" — this is normal

**"Attendance check-in button isn't showing"**
- Check-in is only available from **1 hour before** class start time
- The member must have an active membership for a type that includes that class
- Make sure the class is scheduled for today

**"Stripe payments aren't working"**
- Verify Stripe Connect is set up: **Admin → Settings → Payments**
- If showing "pending", you may need to complete Stripe's identity verification
- Check your Stripe Dashboard for any account issues

**"I can't see my data in the admin dashboard"**
- Make sure you're logged in with an admin account
- If you just signed up, the setup wizard should guide you through initial configuration
- Try refreshing the page — some data loads asynchronously

**"Member listed as pending"**
- Without Stripe: you need to manually activate memberships from **Admin → Members → Memberships**
- With Stripe: payment may not have completed — check Stripe Dashboard for the transaction status`,
                tags: ['troubleshooting', 'issues', 'problems', 'fix', 'not working', 'error', 'help'],
            },
        ],
    },
];

// ===============================================
// Component
// ===============================================

export default function HelpCenterPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [activeArticle, setActiveArticle] = useState<string | null>(null);

    // Search across all articles
    const searchResults = useMemo(() => {
        if (!searchQuery.trim()) return [];
        const q = searchQuery.toLowerCase();
        const results: { category: HelpCategory; article: HelpArticle }[] = [];
        for (const cat of helpCategories) {
            for (const art of cat.articles) {
                if (
                    art.title.toLowerCase().includes(q) ||
                    art.content.toLowerCase().includes(q) ||
                    art.tags.some(t => t.includes(q))
                ) {
                    results.push({ category: cat, article: art });
                }
            }
        }
        return results;
    }, [searchQuery]);

    const isSearching = searchQuery.trim().length > 0;

    // Currently viewing article
    const currentArticle = activeArticle
        ? helpCategories
            .flatMap(c => c.articles.map(a => ({ ...a, categoryTitle: c.title })))
            .find(a => a.id === activeArticle)
        : null;

    return (
        <>
            <main>
                {/* Hero */}
                <section style={{
                    background: 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-primary) 100%)',
                    padding: 'var(--space-16) var(--space-6)',
                    textAlign: 'center',
                }}>
                    <div style={{ maxWidth: '700px', margin: '0 auto' }}>
                        <div style={{
                            width: '64px', height: '64px', borderRadius: 'var(--radius-full)',
                            background: 'var(--color-gold-gradient)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto var(--space-6)',
                        }}>
                            <BookOpen size={28} color="var(--color-black)" />
                        </div>
                        <h1 style={{ marginBottom: 'var(--space-4)' }}>Help Centre</h1>
                        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-xl)', marginBottom: 'var(--space-8)' }}>
                            Everything you need to run your club on ClubForge. Guides, tips, and troubleshooting for gym owners and coaches.
                        </p>

                        {/* Search */}
                        <div style={{
                            position: 'relative', maxWidth: '500px', margin: '0 auto',
                        }}>
                            <Search
                                size={20}
                                color="var(--text-tertiary)"
                                style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }}
                            />
                            <input
                                type="text"
                                placeholder="Search help articles..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '16px 16px 16px 48px',
                                    background: 'var(--bg-primary)',
                                    border: '2px solid var(--border-light)',
                                    borderRadius: 'var(--radius-xl, 16px)',
                                    color: 'var(--text-primary)',
                                    fontSize: 'var(--text-base)',
                                    outline: 'none',
                                    transition: 'border-color 0.2s ease',
                                }}
                                onFocus={e => e.target.style.borderColor = 'var(--color-gold)'}
                                onBlur={e => e.target.style.borderColor = 'var(--border-light)'}
                            />
                        </div>
                    </div>
                </section>

                {/* Content */}
                <section style={{
                    background: 'var(--bg-primary)',
                    padding: 'var(--space-6) var(--space-6) var(--space-16)',
                }}>
                    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>

                        {/* Search Results */}
                        {isSearching && (
                            <div style={{ marginBottom: 'var(--space-8)' }}>
                                <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
                                    {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for &quot;{searchQuery}&quot;
                                </p>
                                {searchResults.length === 0 ? (
                                    <div className="glass-card" style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
                                        <HelpCircle size={40} color="var(--text-tertiary)" style={{ marginBottom: 'var(--space-3)' }} />
                                        <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
                                            No articles match your search. Try different keywords or{' '}
                                            <a href="mailto:support@clubforgehq.com" style={{ color: 'var(--color-gold)' }}>contact support</a>.
                                        </p>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                                        {searchResults.map(({ category, article }) => (
                                            <div
                                                key={article.id}
                                                className="glass-card"
                                                style={{ padding: 'var(--space-4) var(--space-5)', cursor: 'pointer' }}
                                                onClick={() => {
                                                    setActiveCategory(category.id);
                                                    setActiveArticle(article.id);
                                                    setSearchQuery('');
                                                }}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                                                    <category.icon size={20} color="var(--color-gold)" />
                                                    <div style={{ flex: 1 }}>
                                                        <h4 style={{ margin: 0, fontSize: 'var(--text-base)' }}>{article.title}</h4>
                                                        <p style={{ margin: '4px 0 0', color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)' }}>
                                                            {category.title}
                                                        </p>
                                                    </div>
                                                    <ChevronRight size={18} color="var(--text-tertiary)" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Article View */}
                        {!isSearching && activeArticle && currentArticle ? (
                            <div>
                                {/* Breadcrumb */}
                                <div style={{
                                    display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
                                    marginBottom: 'var(--space-6)', flexWrap: 'wrap',
                                }}>
                                    <button
                                        onClick={() => { setActiveCategory(null); setActiveArticle(null); }}
                                        style={{
                                            background: 'none', border: 'none', color: 'var(--color-gold)',
                                            cursor: 'pointer', padding: 0, fontSize: 'var(--text-sm)',
                                        }}
                                    >
                                        Help Centre
                                    </button>
                                    <ChevronRight size={14} color="var(--text-tertiary)" />
                                    <button
                                        onClick={() => setActiveArticle(null)}
                                        style={{
                                            background: 'none', border: 'none', color: 'var(--color-gold)',
                                            cursor: 'pointer', padding: 0, fontSize: 'var(--text-sm)',
                                        }}
                                    >
                                        {currentArticle.categoryTitle}
                                    </button>
                                    <ChevronRight size={14} color="var(--text-tertiary)" />
                                    <span style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
                                        {currentArticle.title}
                                    </span>
                                </div>

                                {/* Article Content */}
                                <div className="glass-card" style={{ padding: 'var(--space-8)' }}>
                                    <h2 style={{ marginBottom: 'var(--space-6)' }}>{currentArticle.title}</h2>
                                    <div
                                        className="help-article-content"
                                        style={{
                                            color: 'var(--text-secondary)',
                                            lineHeight: '1.8',
                                            fontSize: 'var(--text-base)',
                                        }}
                                        dangerouslySetInnerHTML={{
                                            __html: formatMarkdown(currentArticle.content),
                                        }}
                                    />
                                </div>
                            </div>
                        ) : !isSearching && activeCategory ? (
                            /* Category View */
                            (() => {
                                const cat = helpCategories.find(c => c.id === activeCategory);
                                if (!cat) return null;
                                return (
                                    <div>
                                        {/* Breadcrumb */}
                                        <div style={{
                                            display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
                                            marginBottom: 'var(--space-6)',
                                        }}>
                                            <button
                                                onClick={() => { setActiveCategory(null); setActiveArticle(null); }}
                                                style={{
                                                    background: 'none', border: 'none', color: 'var(--color-gold)',
                                                    cursor: 'pointer', padding: 0, fontSize: 'var(--text-sm)',
                                                }}
                                            >
                                                Help Centre
                                            </button>
                                            <ChevronRight size={14} color="var(--text-tertiary)" />
                                            <span style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
                                                {cat.title}
                                            </span>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
                                            <div style={{
                                                width: '48px', height: '48px', borderRadius: 'var(--radius-lg)',
                                                background: 'rgba(197, 164, 86, 0.15)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            }}>
                                                <cat.icon size={24} color="var(--color-gold)" />
                                            </div>
                                            <div>
                                                <h2 style={{ margin: 0 }}>{cat.title}</h2>
                                                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
                                                    {cat.description}
                                                </p>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                                            {cat.articles.map(article => (
                                                <div
                                                    key={article.id}
                                                    className="glass-card"
                                                    style={{
                                                        padding: 'var(--space-5)',
                                                        cursor: 'pointer',
                                                        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                                                    }}
                                                    onClick={() => setActiveArticle(article.id)}
                                                    onMouseEnter={e => {
                                                        (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
                                                    }}
                                                    onMouseLeave={e => {
                                                        (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                                                    }}
                                                >
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                        <div>
                                                            <h4 style={{ margin: 0, fontSize: 'var(--text-base)' }}>{article.title}</h4>
                                                            <p style={{
                                                                margin: '6px 0 0', color: 'var(--text-tertiary)',
                                                                fontSize: 'var(--text-sm)',
                                                                display: '-webkit-box', WebkitLineClamp: 2,
                                                                WebkitBoxOrient: 'vertical', overflow: 'hidden',
                                                            }}>
                                                                {article.content.slice(0, 120).replace(/[*#>`\n]/g, ' ').trim()}...
                                                            </p>
                                                        </div>
                                                        <ChevronRight size={20} color="var(--text-tertiary)" style={{ flexShrink: 0, marginLeft: 'var(--space-3)' }} />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })()
                        ) : !isSearching ? (
                            /* Category Grid */
                            <div>
                                <h2 style={{ textAlign: 'center', marginBottom: 'var(--space-2)' }}>Browse by Topic</h2>
                                <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: 'var(--space-8)' }}>
                                    Select a category to explore guides and how-tos.
                                </p>
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                                    gap: 'var(--space-4)',
                                }}>
                                    {helpCategories.map(cat => (
                                        <div
                                            key={cat.id}
                                            className="glass-card"
                                            style={{
                                                padding: 'var(--space-6)',
                                                cursor: 'pointer',
                                                transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                                            }}
                                            onClick={() => setActiveCategory(cat.id)}
                                            onMouseEnter={e => {
                                                (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                                            }}
                                            onMouseLeave={e => {
                                                (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                                            }}
                                        >
                                            <div style={{
                                                width: '48px', height: '48px', borderRadius: 'var(--radius-lg)',
                                                background: 'rgba(197, 164, 86, 0.15)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                marginBottom: 'var(--space-4)',
                                            }}>
                                                <cat.icon size={24} color="var(--color-gold)" />
                                            </div>
                                            <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-2)' }}>
                                                {cat.title}
                                            </h3>
                                            <p style={{
                                                color: 'var(--text-secondary)', fontSize: 'var(--text-sm)',
                                                margin: '0 0 var(--space-3)', lineHeight: '1.6',
                                            }}>
                                                {cat.description}
                                            </p>
                                            <span style={{
                                                color: 'var(--text-tertiary)', fontSize: 'var(--text-xs)',
                                            }}>
                                                {cat.articles.length} article{cat.articles.length !== 1 ? 's' : ''}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : null}
                    </div>
                </section>

                {/* CTA */}
                <section style={{
                    background: 'var(--bg-secondary)',
                    padding: 'var(--space-16) var(--space-6)',
                    textAlign: 'center',
                }}>
                    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                        <h2 style={{ marginBottom: 'var(--space-4)' }}>Still need help?</h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-6)' }}>
                            Our team is here for you. Get in touch and we&apos;ll help you sort it out.
                        </p>
                        <div style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <a href="mailto:support@clubforgehq.com" className="btn btn-primary btn-lg">
                                <Mail size={20} />
                                Email Support
                            </a>
                            <Link href="/demo" className="btn btn-outline btn-lg">
                                Book a Demo
                            </Link>
                        </div>
                    </div>
                </section>
            </main>

            <style jsx>{`
                .help-article-content h2,
                .help-article-content h3,
                .help-article-content h4 {
                    color: var(--text-primary);
                    margin-top: 1.5em;
                    margin-bottom: 0.5em;
                }
                .help-article-content p {
                    margin-bottom: 1em;
                }
                .help-article-content strong {
                    color: var(--text-primary);
                }
                .help-article-content ul, .help-article-content ol {
                    padding-left: 1.5em;
                    margin-bottom: 1em;
                }
                .help-article-content li {
                    margin-bottom: 0.4em;
                }
                .help-article-content code {
                    background: var(--bg-secondary);
                    padding: 2px 6px;
                    border-radius: 4px;
                    font-size: 0.9em;
                    color: var(--color-gold);
                }
                .help-article-content blockquote {
                    border-left: 3px solid var(--color-gold);
                    margin: 1em 0;
                    padding: 0.75em 1em;
                    background: rgba(197, 164, 86, 0.05);
                    border-radius: 0 var(--radius-md) var(--radius-md) 0;
                }
                .help-article-content blockquote p {
                    margin: 0;
                }
                .help-article-content table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 1em 0;
                }
                .help-article-content th,
                .help-article-content td {
                    padding: 0.6em 0.8em;
                    border: 1px solid var(--border-light);
                    text-align: left;
                    font-size: var(--text-sm);
                }
                .help-article-content th {
                    background: var(--bg-secondary);
                    color: var(--text-primary);
                    font-weight: 600;
                }
            `}</style>
        </>
    );
}

// ===============================================
// Simple markdown-to-HTML converter
// ===============================================
function formatMarkdown(md: string): string {
    let html = md
        // Headers
        .replace(/^### (.+)$/gm, '<h4>$1</h4>')
        .replace(/^## (.+)$/gm, '<h3>$1</h3>')
        // Bold
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        // Inline code
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        // Links
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color: var(--color-gold)">$1</a>')
        // Blockquotes
        .replace(/^> (.+)$/gm, '<blockquote><p>$1</p></blockquote>')
        // Unordered lists
        .replace(/^- (.+)$/gm, '<li>$1</li>');

    // Wrap consecutive <li> in <ul>
    html = html.replace(/((?:<li>.*<\/li>\n?)+)/g, '<ul>$1</ul>');

    // Tables
    html = html.replace(/\n\|(.+)\|\n\|[-| ]+\|\n((?:\|.+\|\n?)+)/g, (_match, headerRow: string, bodyRows: string) => {
        const headers = headerRow.split('|').map((h: string) => h.trim()).filter(Boolean);
        const rows = bodyRows.trim().split('\n').map((row: string) =>
            row.split('|').map((c: string) => c.trim()).filter(Boolean)
        );
        return `<table><thead><tr>${headers.map((h: string) => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.map((row: string[]) => `<tr>${row.map((c: string) => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
    });

    // Paragraphs (lines not already wrapped)
    html = html
        .split('\n\n')
        .map(block => {
            const trimmed = block.trim();
            if (!trimmed) return '';
            if (trimmed.startsWith('<')) return trimmed;
            return `<p>${trimmed.replace(/\n/g, '<br/>')}</p>`;
        })
        .join('\n');

    return html;
}
