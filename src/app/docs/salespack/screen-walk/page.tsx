'use client';

import Link from 'next/link';
import { useState } from 'react';

/* ── Types ───────────────────────────────────────────── */
interface Step {
    action: string;
    see: string;
    tip?: string;
}
interface Screen {
    id: string;
    icon: string;
    title: string;
    url: string;
    steps: Step[];
}

/* ── DATA: Admin Screens ─────────────────────────────── */
const adminScreens: Screen[] = [
    {
        id: 'login',
        icon: '🔑',
        title: 'Log In as Admin',
        url: '/login',
        steps: [
            { action: 'Go to clubforgehq.com/login', see: 'Login page with email and password fields, white card on a dark background with the ClubForge logo.' },
            { action: 'Enter demo-admin@clubforgehq.com and ClubForge2026!', see: 'Fields fill in. Hit the "Sign In" button.' },
            { action: 'Click "Sign In"', see: 'You\'re redirected to /admin — the Admin Dashboard. A greeting says "Good afternoon, James! 👋"', tip: 'If login fails, double-check the password is case-sensitive — capital C, capital F, exclamation mark.' },
        ],
    },
    {
        id: 'dashboard',
        icon: '📊',
        title: 'Admin Dashboard',
        url: '/admin',
        steps: [
            { action: 'You\'re now on the Admin Dashboard', see: 'A personalised greeting at the top: "Good afternoon, James! 👋" with "Here\'s what\'s happening with your club today."' },
            { action: 'Look at the 4 KPI stat cards', see: '4 cards in a row: Total Members (gold icon), Active Memberships (green ✓), Active Classes (purple calendar), Monthly Revenue (gold £ sign). Each shows a live number pulled from the database.', tip: '🎯 WOW MOMENT: Point out that these are LIVE numbers — not a mock dashboard. This is real data.' },
            { action: 'Look at "Today\'s Snapshot" section below', see: '3 cards: Check-ins Today, Active Memberships, Monthly Revenue — all with large bold numbers in gold/green.' },
            { action: 'Look at "Quick Actions" section', see: 'Clickable action cards: Manage Members, Manage Classes, View Finance, Club Settings — each with an icon and description.' },
            { action: 'Scroll to "Recent Members" section', see: 'A list of the most recently joined members with their name, membership type, and join date.' },
        ],
    },
    {
        id: 'members',
        icon: '👥',
        title: 'Members',
        url: '/admin/members',
        steps: [
            { action: 'In the sidebar, click "Members" section to expand it, then click "All Members"', see: 'The sidebar expands showing: All Members, Memberships, Instructors, Professor Access, Invite Members.' },
            { action: 'You\'re on the All Members page', see: 'A table/list of all registered members. Each row shows: Avatar, Name, Email, Role, Belt Rank, Membership Status. There\'s a search bar at the top to filter members.' },
            { action: 'Click on any member name (e.g. "Sarah Chen")', see: 'A detailed member profile card opens showing: full name, email, phone, role, belt rank, membership details, and a grading history timeline.', tip: '🎯 WOW MOMENT: "Every single member — searchable, filterable, with their full history. No more spreadsheets."' },
            { action: 'Go back, then click "Memberships" in the sidebar', see: 'A filtered view showing only active memberships with membership type, status (Active/Expired/Cancelled), and Stripe payment info.' },
        ],
    },
    {
        id: 'invite',
        icon: '✉️',
        title: 'Invite Members',
        url: '/admin/invite',
        steps: [
            { action: 'Click "Invite Members" in the Members sidebar section', see: 'The Invite page with a branded registration link and a "Copy Link" button.' },
            { action: 'Look at the registration link', see: 'A unique URL specific to this club (e.g. apex-mma.clubforgehq.com/register). This is the link you share with new members.', tip: '🎯 WOW MOMENT: "Share this one link. Members register, sign the waiver, pick a plan, and pay — all without you lifting a finger."' },
            { action: 'Click "Copy Link"', see: 'The link is copied to your clipboard. Confirmation feedback appears.' },
        ],
    },
    {
        id: 'classes',
        icon: '📅',
        title: 'Classes & Roster',
        url: '/admin/classes',
        steps: [
            { action: 'In the sidebar, click "Your Club" section, then "Classes"', see: 'The Your Club section expands showing: Locations, Membership Plans, Classes, Class Roster, Grading, Grading Settings.' },
            { action: 'You\'re on the Classes page', see: 'A list of all classes with: Class Name, Day, Time, Instructor, Type (BJJ, Striking, Kids, etc.), and an Active/Inactive toggle.' },
            { action: 'Click "Class Roster" in the sidebar', see: 'A detailed roster view. Select a class from a dropdown and see every enrolled member, their check-in status for each date, and attendance percentage.', tip: '🎯 WOW MOMENT: "Know exactly who shows up and who doesn\'t — before they cancel."' },
        ],
    },
    {
        id: 'attendance',
        icon: '✅',
        title: 'Attendance',
        url: '/admin/attendance',
        steps: [
            { action: 'Click "Money" section in the sidebar, then "Attendance"', see: 'The Money section expands showing: Finance, Attendance, Advanced Reports, Data Export.' },
            { action: 'You\'re on the Attendance page', see: 'A comprehensive attendance overview: date filter, class filter, and a table showing every check-in record with member name, class, date, and time.' },
            { action: 'Point out the attendance stats', see: 'Summary stats at the top: total check-ins, unique members, attendance rate %.', tip: '"This is how you spot members who are drifting away — before they cancel."' },
        ],
    },
    {
        id: 'finance',
        icon: '💷',
        title: 'Finance',
        url: '/admin/finance',
        steps: [
            { action: 'Click "Finance" in the Money sidebar section', see: 'The Finance dashboard. Revenue overview, active subscription count, and a list of all invoices/payments.' },
            { action: 'Look at the revenue summary', see: 'Monthly Recurring Revenue (MRR) displayed prominently. Active subscriptions count and total revenue figures.', tip: '🎯 WOW MOMENT: "Your revenue, live, from Stripe. No manual tracking. No guessing at month-end."' },
        ],
    },
    {
        id: 'membership-types',
        icon: '💳',
        title: 'Membership Plans',
        url: '/admin/membership-types',
        steps: [
            { action: 'Click "Your Club" → "Membership Plans" in the sidebar', see: 'A list of all membership tiers: Adults, Kids, All-Access, Trial, etc. Each shows: name, price, billing frequency, Stripe price ID, and active member count.' },
            { action: 'Note the "Add Membership Type" button', see: 'A form to create new membership tiers with name, description, price, and Stripe configuration.', tip: '"Set your prices once. Stripe handles recurring billing, invoicing, and failed payment recovery automatically."' },
        ],
    },
    {
        id: 'grading',
        icon: '🥋',
        title: 'Grading & Belt Settings',
        url: '/admin/grading-settings',
        steps: [
            { action: 'Click "Your Club" → "Grading Settings" in the sidebar', see: 'Two belt systems: Adult Belt Scheme and Kids Belt Scheme. Each shows the full belt progression with colours.' },
            { action: 'Look at the Adult Belt Scheme', see: 'White → Blue → Purple → Brown → Black, each with stripe progressions (0-4 stripes per belt). Customisable belt names and descriptions.' },
            { action: 'Look at the Kids Belt Scheme', see: 'A 13-belt progression system for younger students, with appropriate colours and naming.', tip: '🎯 WOW MOMENT: "Generic gym software doesn\'t know what a purple belt is. This was built for martial arts."' },
            { action: 'Click "Grading" in the sidebar (or navigate to /professor)', see: 'The Professor Grading interface where instructors can promote members, add stripes, and leave written feedback.' },
        ],
    },
    {
        id: 'announcements',
        icon: '📢',
        title: 'Announcements & Engagement',
        url: '/admin/announcements',
        steps: [
            { action: 'Click "Engagement" in the sidebar to expand it', see: 'Section shows: Announcements, Events, Videos, Weekly Wisdom, Email Templates, Promo Codes.' },
            { action: 'Click "Announcements"', see: 'A list of all club announcements. Each has a title, content, date, and visibility status. There\'s a "Create Announcement" button.' },
            { action: 'Show the "Events" page', see: 'Upcoming events with name, date, location, price, and registration status. Members can register and pay directly.' },
            { action: 'Show the "Promo Codes" page', see: 'Active promo codes with percentage discount, usage count, and expiry date. Connected directly to Stripe.' },
        ],
    },
    {
        id: 'settings',
        icon: '⚙️',
        title: 'Settings',
        url: '/admin/settings',
        steps: [
            { action: 'Click "Settings" at the bottom of the sidebar', see: 'Club settings page. Club name, tagline, logo upload, primary brand colour picker, and Stripe configuration.' },
            { action: 'Point out the branding section', see: 'Club name, tagline, and logo are all customisable. The primary colour picker lets them choose their brand colour — the entire dashboard theme updates to match.', tip: '🎯 WOW MOMENT: "Everything branded to YOU. Your members see your club, your colours, your logo. We just power it."' },
        ],
    },
];

/* ── DATA: Member Screens ────────────────────────────── */
const memberScreens: Screen[] = [
    {
        id: 'm-login',
        icon: '🔑',
        title: 'Log In as Member',
        url: '/login',
        steps: [
            { action: 'Open an incognito/private window', see: 'Fresh browser with no existing session.' },
            { action: 'Go to clubforgehq.com/login', see: 'Same login page, but this time you\'re logging in as a member.' },
            { action: 'Enter demo-member@clubforgehq.com and ClubForge2026!', see: 'Fill in the fields and click "Sign In".' },
            { action: 'Click "Sign In"', see: 'Redirected to /dashboard — the Member Dashboard. Welcome message: "Welcome back, Sarah!" with the club\'s branding.', tip: 'Keep this window side-by-side with the admin window to show both perspectives.' },
        ],
    },
    {
        id: 'm-dashboard',
        icon: '🏠',
        title: 'Member Dashboard',
        url: '/dashboard',
        steps: [
            { action: 'You\'re on the Member Dashboard', see: 'A clean, mobile-friendly dashboard showing: Welcome message, upcoming classes, recent announcements, membership status, and quick action buttons.' },
            { action: 'Look at the sidebar navigation', see: 'Clean flat menu: Dashboard, Classes, Attendance, Rank Progress, Video Library, Events, Announcements, Membership, Payment History, Add Child.' },
            { action: 'Point out the overall feel', see: 'The entire interface is branded with the club\'s colours. Clean, professional, mobile-responsive.', tip: '🎯 WOW MOMENT: "This is what YOUR members will see on their phone. This is what they\'ll show their friends."' },
        ],
    },
    {
        id: 'm-classes',
        icon: '📅',
        title: 'Classes',
        url: '/dashboard/classes',
        steps: [
            { action: 'Click "Classes" in the sidebar', see: 'The weekly class schedule. Shows all available classes with day, time, instructor, type, and capacity.' },
            { action: 'Look at the class cards', see: 'Each class shows: Class name, instructor name, day and time, class type tag (BJJ, Kids, No-Gi, etc.), and available spots.', tip: '"No more \'What time is class?\' messages. It\'s all right here."' },
        ],
    },
    {
        id: 'm-attendance',
        icon: '✅',
        title: 'Attendance',
        url: '/dashboard/attendance',
        steps: [
            { action: 'Click "Attendance" in the sidebar', see: 'Personal attendance history. A calendar or list view showing every class this member has checked into, with dates and class names.' },
            { action: 'Point out the attendance stats', see: 'Total classes attended, current streak, most-attended class.', tip: '"Members who track their attendance are 3x more likely to stay."' },
        ],
    },
    {
        id: 'm-progress',
        icon: '🥋',
        title: 'Rank Progress',
        url: '/dashboard/progress',
        steps: [
            { action: 'Click "Rank Progress" in the sidebar', see: 'The member\'s belt journey. Current belt displayed prominently with a visual belt indicator. Full grading history below showing each promotion with date and awarding professor.' },
            { action: 'Look at the grading history', see: 'A timeline of promotions: date, belt awarded, stripe count, and professor who awarded it. If feedback was given, it\'s displayed.', tip: '🎯 WOW MOMENT: "A member who can visualise their progress is a member who stays. No more \'When is my next grading?\' messages."' },
        ],
    },
    {
        id: 'm-announcements',
        icon: '📢',
        title: 'Announcements',
        url: '/dashboard/announcements',
        steps: [
            { action: 'Click "Announcements" in the sidebar', see: 'All club announcements in a clean feed. Each shows title, content, date posted. Most recent at the top.' },
            { action: 'Point out the communication channel', see: 'The admin posts once → every member sees it. No more WhatsApp group chaos.' },
        ],
    },
    {
        id: 'm-membership',
        icon: '💳',
        title: 'Membership',
        url: '/dashboard/membership',
        steps: [
            { action: 'Click "Membership" in the sidebar', see: 'Current membership details: plan name, status (Active), next billing date, price. Stripe-powered billing info.' },
            { action: 'Look at the membership card', see: 'Shows the membership tier, active status badge, and billing information.', tip: '"Members manage their own subscription. No admin work for you."' },
        ],
    },
    {
        id: 'm-payments',
        icon: '🧾',
        title: 'Payment History',
        url: '/dashboard/payments',
        steps: [
            { action: 'Click "Payment History" in the sidebar', see: 'A list of all past payments/invoices with date, amount, status (Paid/Pending/Failed), and invoice link.' },
            { action: 'Point out the transparency', see: 'Members can see exactly what they\'ve been charged and when. No disputes, no confusion.' },
        ],
    },
    {
        id: 'm-profile',
        icon: '👤',
        title: 'Profile',
        url: '/dashboard/profile',
        steps: [
            { action: 'Click "Profile" in the Account section at the bottom of sidebar', see: 'Personal profile page: name, email, phone, profile photo upload, and emergency contact information.' },
            { action: 'Note the edit capabilities', see: 'Members can update their own details without contacting the admin.' },
        ],
    },
    {
        id: 'm-children',
        icon: '👶',
        title: 'Add Child',
        url: '/dashboard/add-child',
        steps: [
            { action: 'Click "Add Child" in the sidebar', see: 'A form to register a child under this parent account. Enter child\'s name and details.' },
            { action: 'After adding', see: 'A child profile switcher appears at the top of the sidebar. The parent can switch between viewing their own data and their children\'s data.', tip: '🎯 WOW MOMENT: "Parents manage all their children from one login. Kids have their own belt progress, attendance, and membership — all under one family account."' },
        ],
    },
];

/* ── Step Component ──────────────────────────────────── */
function StepCard({ step, n }: { step: Step; n: number }) {
    return (
        <div className="sw-step">
            <div className="sw-step-num">{n}</div>
            <div className="sw-step-body">
                <div className="sw-do"><span className="sw-do-label">👆 DO:</span> {step.action}</div>
                <div className="sw-see"><span className="sw-see-label">👀 YOU\'LL SEE:</span> {step.see}</div>
                {step.tip && <div className="sw-tip">{step.tip}</div>}
            </div>
        </div>
    );
}

/* ── Screen Card Component ───────────────────────────── */
function ScreenCard({ screen, open, toggle }: { screen: Screen; open: boolean; toggle: () => void }) {
    return (
        <div className={`sw-card${open ? ' open' : ''}`}>
            <div className="sw-card-hdr" onClick={toggle}>
                <span className="sw-card-icon">{screen.icon}</span>
                <div style={{ flex: 1 }}>
                    <div className="sw-card-title">{screen.title}</div>
                    <div className="sw-card-url">{screen.url}</div>
                </div>
                <span className="sw-card-steps">{screen.steps.length} steps</span>
                <span className="sw-arrow">{open ? '▲' : '▼'}</span>
            </div>
            {open && (
                <div className="sw-card-body">
                    {screen.steps.map((step, i) => (
                        <StepCard key={i} step={step} n={i + 1} />
                    ))}
                </div>
            )}
        </div>
    );
}

/* ── Main Page ───────────────────────────────────────── */
export default function ScreenWalkPage() {
    const [openAdmin, setOpenAdmin] = useState<string | null>('login');
    const [openMember, setOpenMember] = useState<string | null>(null);

    return (
        <div className="sw-page">
            <style>{`
        .sw-page{background:#FAFBFC;color:#334155;line-height:1.7;min-height:100vh}
        .sw-hero{background:linear-gradient(135deg,#0F172A,#1E293B);color:#fff;padding:60px 24px 48px;text-align:center}
        .sw-hero h1{font-size:clamp(1.8rem,4vw,2.5rem);font-weight:800;margin-bottom:8px}
        .sw-hero h1 span{background:linear-gradient(135deg,#D4B86A,#C5A456);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
        .sw-hero p{color:#94A3B8;font-size:1rem;max-width:600px;margin:0 auto;line-height:1.7}
        .sw-wrap{max-width:850px;margin:0 auto;padding:40px 24px 80px}
        .sw-section-hdr{display:flex;align-items:center;gap:14px;margin:40px 0 20px;padding-bottom:12px;border-bottom:2px solid #E2E8F0}
        .sw-section-hdr:first-child{margin-top:0}
        .sw-section-icon{width:44px;height:44px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:800;flex-shrink:0}
        .sw-section-icon.admin{background:linear-gradient(135deg,#D4B86A,#A88B3D);color:#0F172A}
        .sw-section-icon.member{background:linear-gradient(135deg,#3B82F6,#1D4ED8);color:#fff}
        .sw-section-hdr h2{font-size:1.3rem;font-weight:800;color:#0F172A;margin:0}
        .sw-section-hdr .sw-count{font-size:12px;color:#94A3B8;font-weight:600;margin-left:auto;background:#F1F5F9;padding:4px 12px;border-radius:6px}
        .sw-card{background:#fff;border:1px solid #E2E8F0;border-radius:16px;margin-bottom:12px;overflow:hidden;transition:box-shadow .2s}
        .sw-card:hover{box-shadow:0 4px 24px rgba(0,0,0,0.06)}
        .sw-card.open{border-color:rgba(197,164,86,0.3)}
        .sw-card-hdr{padding:18px 24px;cursor:pointer;display:flex;align-items:center;gap:14px}
        .sw-card-icon{font-size:24px;flex-shrink:0}
        .sw-card-title{font-size:15px;font-weight:700;color:#0F172A}
        .sw-card-url{font-size:12px;color:#94A3B8;font-family:'Courier New',monospace;margin-top:1px}
        .sw-card-steps{font-size:11px;color:#64748B;background:#F1F5F9;padding:3px 10px;border-radius:6px;font-weight:600;white-space:nowrap}
        .sw-arrow{color:#94A3B8;font-size:13px;font-weight:700;flex-shrink:0}
        .sw-card-body{padding:0 24px 24px;border-top:1px solid #F1F5F9}
        .sw-step{display:flex;gap:14px;padding:16px 0;border-bottom:1px solid #F8FAFC}
        .sw-step:last-child{border-bottom:none}
        .sw-step-num{width:28px;height:28px;background:linear-gradient(135deg,#D4B86A,#A88B3D);color:#0F172A;border-radius:8px;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:12px;flex-shrink:0;margin-top:2px}
        .sw-step-body{flex:1;min-width:0}
        .sw-do{background:#EFF6FF;border-left:4px solid #3B82F6;padding:10px 14px;border-radius:0 8px 8px 0;font-size:14px;color:#1E40AF;margin-bottom:8px}
        .sw-do-label{font-weight:700;font-size:11px;letter-spacing:.5px;margin-right:6px}
        .sw-see{background:#F0FDF4;border-left:4px solid #22C55E;padding:10px 14px;border-radius:0 8px 8px 0;font-size:14px;color:#15803D;margin-bottom:8px}
        .sw-see-label{font-weight:700;font-size:11px;letter-spacing:.5px;margin-right:6px}
        .sw-tip{background:linear-gradient(135deg,rgba(197,164,86,0.08),rgba(197,164,86,0.04));border:1px solid rgba(197,164,86,0.2);border-radius:8px;padding:10px 14px;font-size:13px;color:#92400E;font-style:italic}
        .sw-prereq{background:linear-gradient(135deg,#0F172A,#1E293B);border-radius:16px;padding:24px;color:#fff;margin-bottom:24px}
        .sw-prereq h3{font-size:13px;font-weight:700;color:#C5A456;text-transform:uppercase;letter-spacing:1px;margin:0 0 14px}
        .sw-prereq li{padding:6px 0;font-size:14px;color:#E2E8F0;list-style:none;display:flex;align-items:center;gap:10px}
        .sw-prereq li::before{content:"☐";font-size:16px;color:#C5A456}
      `}</style>

            <nav className="sp-nav">
                <Link href="/docs/salespack" className="sp-nav-brand">Club<span>Forge</span> Sales Pack</Link>
                <Link href="/docs/salespack" className="sp-nav-back">← Back to Index</Link>
            </nav>

            <div className="sw-hero">
                <h1>🖥️ Screen <span>Walk</span></h1>
                <p>Click-by-click guide through every screen. Follow each step sequentially — you\'ll know exactly what to click and what you\'ll see.</p>
            </div>

            <div className="sw-wrap">
                {/* Pre-requisites */}
                <div className="sw-prereq">
                    <h3>📋 Before You Start</h3>
                    <ul>
                        <li>Open a browser window — you&apos;ll use this for the Admin walkthrough</li>
                        <li>Open an incognito/private window — you&apos;ll use this for the Member walkthrough</li>
                        <li>Admin login: demo-admin@clubforgehq.com / ClubForge2026!</li>
                        <li>Member login: demo-member@clubforgehq.com / ClubForge2026!</li>
                        <li>Work through Admin first, then switch to the Member window</li>
                    </ul>
                </div>

                {/* ═══ ADMIN SECTION ═══ */}
                <div className="sw-section-hdr">
                    <div className="sw-section-icon admin">👑</div>
                    <h2>Admin Dashboard Walk</h2>
                    <span className="sw-count">{adminScreens.length} screens</span>
                </div>

                {adminScreens.map((screen) => (
                    <ScreenCard
                        key={screen.id}
                        screen={screen}
                        open={openAdmin === screen.id}
                        toggle={() => setOpenAdmin(openAdmin === screen.id ? null : screen.id)}
                    />
                ))}

                {/* ═══ MEMBER SECTION ═══ */}
                <div className="sw-section-hdr">
                    <div className="sw-section-icon member">👤</div>
                    <h2>Member Dashboard Walk</h2>
                    <span className="sw-count">{memberScreens.length} screens</span>
                </div>

                {memberScreens.map((screen) => (
                    <ScreenCard
                        key={screen.id}
                        screen={screen}
                        open={openMember === screen.id}
                        toggle={() => setOpenMember(openMember === screen.id ? null : screen.id)}
                    />
                ))}
            </div>
        </div>
    );
}
