'use client';

import Link from 'next/link';

const sections = [
    { icon: '🏋️', title: 'Member Management', items: ['Searchable member directory with role, belt rank, and membership status', 'Family accounts — parents manage all children from one login', 'Self-registration with branded sign-up link, waiver, and payment', 'One-click email invitations with branded onboarding', 'CSV/JSON data export for offline analysis or migration'] },
    { icon: '📅', title: 'Class Scheduling & Attendance', items: ['Recurring and one-off classes with day, time, instructor, and capacity', 'Class roster — see who\'s enrolled, checked in, or absent', 'One-tap member check-in from any phone', 'Attendance analytics — spot trends, fading members, packed classes', 'Instructor assignment to specific classes and time slots'] },
    { icon: '💳', title: 'Billing & Payments (Stripe)', items: ['Recurring subscriptions — set tiers, Stripe handles the rest', 'Automatic invoicing with real-time webhook status updates', 'Promo codes created in seconds, tied directly to Stripe', 'Finance dashboard — revenue overview, pending invoices, statuses', 'Failed payment recovery — Stripe auto-retry and dunning emails'] },
    { icon: '🥋', title: 'Belt Progression & Grading', items: ['Adult belt scheme — White → Blue → Purple → Brown → Black (with stripes)', 'Kids belt scheme — 13-belt progression for younger students', 'Full grading history with date, stripe count, and who awarded it', 'Professor feedback — written grading notes visible to the member', 'Professor access controls — class-specific promotion authority'] },
    { icon: '📊', title: 'Dashboard & Reports', items: ['KPI cards — total members, monthly revenue, attendance rate, classes', 'Basic reports — counts, attendance summaries, revenue (all tiers)', 'Advanced analytics — retention, forecasting, deep breakdowns (Pro+)', 'Data export — CSV, JSON, and API access (by tier)'] },
    { icon: '📢', title: 'Communication & Engagement', items: ['Announcements visible on every member\'s dashboard', 'Branded email templates (Pro+)', 'Event management with payments (Pro+)', 'Video library for technique drills (Pro+)', 'Waitlist management for oversubscribed classes (Pro+)'] },
    { icon: '🎨', title: 'White-Label Branding', items: ['Custom colours, logo, and brand identity', 'Branded member portal — members see YOUR club, not ClubForge', 'Custom subdomain — yourclub.clubforgehq.com (Elite)', 'Custom waiver, etiquette, and registration messages'] },
    { icon: '🏢', title: 'Multi-Location Support', items: ['Multiple venues from one dashboard (up to 3 Pro, unlimited Elite)', 'Location-specific classes, memberships, and announcements', 'Members can hold memberships at multiple sites'] },
    { icon: '🔒', title: 'Security & Compliance', items: ['Enterprise PostgreSQL with row-level security', 'Stripe PCI-DSS Level 1 compliant payment processing', 'GDPR compliant — data export, deletion, consent management', 'Role-based access — admin, instructor, professor, member'] },
];

export default function FeaturesPage() {
    return (
        <div style={{ background: '#FAFBFC', color: '#334155', lineHeight: 1.7, minHeight: '100vh' }}>
            <style>{`
        .fo-hero{background:linear-gradient(135deg,#0F172A,#1E293B);color:#fff;padding:60px 24px 48px;text-align:center}
        .fo-hero h1{font-size:clamp(1.8rem,4vw,2.5rem);font-weight:800;margin-bottom:8px}
        .fo-hero h1 span{background:linear-gradient(135deg,#D4B86A,#C5A456);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
        .fo-hero p{color:#94A3B8;font-size:1rem;max-width:550px;margin:0 auto}
        .fo-wrap{max-width:850px;margin:0 auto;padding:40px 24px 80px}
        .fo-sec{background:#fff;border:1px solid #E2E8F0;border-radius:16px;padding:28px;margin-bottom:20px;transition:box-shadow .2s}
        .fo-sec:hover{box-shadow:0 4px 24px rgba(0,0,0,0.06)}
        .fo-hdr{display:flex;align-items:center;gap:14px;margin-bottom:16px}
        .fo-icon{width:44px;height:44px;border-radius:12px;background:rgba(197,164,86,0.1);display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0}
        .fo-hdr h2{font-size:17px;font-weight:800;color:#0F172A;margin:0}
        .fo-list{list-style:none;padding:0;margin:0}
        .fo-list li{padding:8px 0;border-bottom:1px solid #F8FAFC;font-size:14px;display:flex;align-items:flex-start;gap:10px}
        .fo-list li:last-child{border-bottom:none}
        .fo-list li::before{content:"✓";color:#C5A456;font-weight:800;flex-shrink:0}
        .fo-snap{background:linear-gradient(135deg,#0F172A,#1E293B);border-radius:16px;padding:28px;margin-top:32px;color:#fff}
        .fo-snap h3{font-size:14px;font-weight:700;color:#C5A456;text-transform:uppercase;letter-spacing:1px;margin:0 0 16px}
        .fo-sg{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:16px}
        .fo-si{text-align:center;padding:16px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px}
        .fo-si .v{font-size:1.3rem;font-weight:800;color:#fff;margin-bottom:2px}
        .fo-si .l{font-size:11px;color:#94A3B8}
        .fo-cta{text-align:center;margin-top:40px;padding:32px;background:#fff;border:2px solid #E2E8F0;border-radius:16px}
        .fo-cta h3{font-size:18px;font-weight:800;color:#0F172A;margin:0 0 8px}
        .fo-cta p{font-size:14px;color:#64748B;margin:0 0 16px}
        .fo-cta a{display:inline-block;background:linear-gradient(135deg,#D4B86A,#A88B3D);color:#0F172A;padding:14px 32px;border-radius:10px;font-weight:700;text-decoration:none;font-size:15px}
      `}</style>

            <nav className="sp-nav">
                <Link href="/docs/salespack" className="sp-nav-brand">Club<span>Forge</span> Sales Pack</Link>
                <Link href="/docs/salespack" className="sp-nav-back">← Back to Index</Link>
            </nav>

            <div className="fo-hero">
                <h1>⚡ Feature <span>Overview</span></h1>
                <p>Everything ClubForge does — at a glance. Share this with prospects as a leave-behind.</p>
            </div>

            <div className="fo-wrap">
                {sections.map((s) => (
                    <div key={s.title} className="fo-sec">
                        <div className="fo-hdr"><div className="fo-icon">{s.icon}</div><h2>{s.title}</h2></div>
                        <ul className="fo-list">{s.items.map((it, i) => <li key={i}>{it}</li>)}</ul>
                    </div>
                ))}

                <div className="fo-snap"><h3>📈 Platform Snapshot</h3>
                    <div className="fo-sg">
                        <div className="fo-si"><div className="v">99.9%</div><div className="l">SLA Uptime (Elite)</div></div>
                        <div className="fo-si"><div className="v">15 min</div><div className="l">Setup Time</div></div>
                        <div className="fo-si"><div className="v">14 days</div><div className="l">Free Trial (No Card)</div></div>
                        <div className="fo-si"><div className="v">Any Device</div><div className="l">Fully Responsive</div></div>
                    </div>
                </div>

                <div className="fo-cta">
                    <h3>Stop running your club with spreadsheets.</h3>
                    <p>Start your 14-day free trial — full Pro features, no card required.</p>
                    <a href="https://clubforgehq.com/get-started">Start Free Trial →</a>
                </div>
            </div>
        </div>
    );
}
