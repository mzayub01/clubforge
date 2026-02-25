'use client';

import Link from 'next/link';

const members = [
    { name: 'James Rodriguez', role: 'Admin', belt: '—', plan: 'All-Access' },
    { name: 'Sarah Chen', role: 'Member', belt: 'White', plan: 'Adults' },
    { name: 'Tom Wilson', role: 'Member', belt: 'Blue', plan: 'Adults' },
    { name: 'Emma Taylor', role: 'Member', belt: 'White (2 stripes)', plan: 'Adults' },
    { name: 'Liam Patel', role: 'Member', belt: 'Purple', plan: 'All-Access' },
    { name: 'Olivia Jones', role: 'Member (kid)', belt: '—', plan: 'Kids' },
    { name: 'Noah Smith', role: 'Member (kid)', belt: '—', plan: 'Kids' },
];

const classes = [
    { name: 'Fundamentals BJJ', day: 'Monday', time: '18:00–19:30', type: 'BJJ' },
    { name: 'Advanced No-Gi', day: 'Wednesday', time: '19:00–20:30', type: 'No-Gi' },
    { name: 'Kids Jiu-Jitsu', day: 'Saturday', time: '10:00–11:00', type: 'Kids' },
    { name: 'Muay Thai', day: 'Tuesday', time: '18:00–19:30', type: 'Striking' },
    { name: 'Open Mat', day: 'Friday', time: '17:30–19:00', type: 'Open' },
];

const adminPages = [
    ['Dashboard', '/admin'], ['Members', '/admin/members'], ['Classes', '/admin/classes'],
    ['Attendance', '/admin/attendance'], ['Finance', '/admin/finance'], ['Membership Types', '/admin/membership-types'],
    ['Grading Settings', '/admin/grading-settings'], ['Promo Codes', '/admin/promo-codes'],
    ['Invite Members', '/admin/invite'], ['Settings', '/admin/settings'],
];

const memberPages = [
    ['Dashboard', '/dashboard'], ['Classes', '/dashboard/classes'], ['Belt Progress', '/dashboard/progress'],
    ['Profile', '/dashboard/profile'], ['Payments', '/dashboard/payments'],
];

export default function QuickstartPage() {
    return (
        <div style={{ background: '#FAFBFC', color: '#334155', lineHeight: 1.7, minHeight: '100vh' }}>
            <style>{`
        .qs-hero{background:linear-gradient(135deg,#0F172A,#1E293B);color:#fff;padding:60px 24px 48px;text-align:center}
        .qs-hero h1{font-size:clamp(1.8rem,4vw,2.5rem);font-weight:800;margin-bottom:8px}
        .qs-hero h1 span{background:linear-gradient(135deg,#D4B86A,#C5A456);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
        .qs-hero p{color:#94A3B8;font-size:1rem;max-width:550px;margin:0 auto}
        .qs-wrap{max-width:800px;margin:0 auto;padding:40px 24px 80px}
        .qs-cred{background:linear-gradient(135deg,#0F172A,#1E293B);border-radius:16px;padding:28px;margin-bottom:20px;color:#fff}
        .qs-cred h3{font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin:0 0 16px}
        .qs-cred .admin{color:#C5A456}
        .qs-cred .member{color:#3B82F6}
        .qs-cr{display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.08);flex-wrap:wrap;gap:8px}
        .qs-cr:last-child{border-bottom:none}
        .qs-cl{font-size:13px;color:#94A3B8}
        .qs-cv{font-family:'Courier New',monospace;font-size:13px;color:#fff;font-weight:600;background:rgba(255,255,255,0.08);padding:4px 12px;border-radius:6px}
        .qs-tip{background:#FFFBEB;border:1px solid #FDE68A;border-radius:12px;padding:16px 20px;font-size:13px;color:#92400E;margin:20px 0}
        .qs-sec{background:#fff;border:1px solid #E2E8F0;border-radius:16px;padding:24px;margin-bottom:20px}
        .qs-sec h3{font-size:15px;font-weight:800;color:#0F172A;margin:0 0 16px}
        table{width:100%;border-collapse:collapse;font-size:13px}
        th{text-align:left;padding:10px 12px;background:#F8FAFC;font-weight:700;color:#0F172A;border-bottom:2px solid #E2E8F0;font-size:12px}
        td{padding:10px 12px;border-bottom:1px solid #F1F5F9}
        td:first-child{font-weight:600;color:#0F172A}
        .qs-url{font-family:'Courier New',monospace;font-size:12px;color:#3B82F6}
        .qs-warn{background:#FEF2F2;border:1px solid #FECACA;border-radius:12px;padding:16px 20px;font-size:13px;color:#991B1B;margin:20px 0}
        .qs-trouble{background:#F8FAFC;border:1px solid #E2E8F0;border-radius:12px;overflow:hidden}
        .qs-tr{padding:14px 20px;border-bottom:1px solid #E2E8F0;font-size:13px}
        .qs-tr:last-child{border-bottom:none}
        .qs-tr strong{color:#0F172A;display:block;margin-bottom:2px}
        .qs-tr span{color:#64748B}
      `}</style>

            <nav className="sp-nav">
                <Link href="/docs/salespack" className="sp-nav-brand">Club<span>Forge</span> Sales Pack</Link>
                <Link href="/docs/salespack" className="sp-nav-back">← Back to Index</Link>
            </nav>

            <div className="qs-hero"><h1>🚀 Demo <span>Quickstart</span></h1><p>Get the demo environment running in under 2 minutes.</p></div>

            <div className="qs-wrap">
                <div className="qs-cred"><h3 className="admin">👤 Admin Login</h3>
                    <div className="qs-cr"><span className="qs-cl">Email</span><span className="qs-cv">demo-admin@clubforgehq.com</span></div>
                    <div className="qs-cr"><span className="qs-cl">Password</span><span className="qs-cv">ClubForge2026!</span></div>
                    <div className="qs-cr"><span className="qs-cl">Name</span><span className="qs-cv">James Rodriguez</span></div>
                    <div className="qs-cr"><span className="qs-cl">After login</span><span className="qs-cv">Go to /admin</span></div>
                </div>
                <div className="qs-cred"><h3 className="member">👥 Member Login</h3>
                    <div className="qs-cr"><span className="qs-cl">Email</span><span className="qs-cv">demo-member@clubforgehq.com</span></div>
                    <div className="qs-cr"><span className="qs-cl">Password</span><span className="qs-cv">ClubForge2026!</span></div>
                    <div className="qs-cr"><span className="qs-cl">Name</span><span className="qs-cv">Sarah Chen</span></div>
                    <div className="qs-cr"><span className="qs-cl">After login</span><span className="qs-cv">Go to /dashboard</span></div>
                </div>
                <div className="qs-tip">💡 <strong>Pro Tip:</strong> Open Admin in a normal browser and Member in incognito — flip between both during the demo.</div>

                <div className="qs-sec"><h3>🏢 Demo Tenant</h3>
                    <table><tbody>
                        <tr><td>Club Name</td><td>Apex MMA Academy</td></tr>
                        <tr><td>Slug</td><td>apex-mma</td></tr>
                        <tr><td>Tagline</td><td>Train Hard. Fight Smart.</td></tr>
                        <tr><td>Colour</td><td style={{ color: '#e63946', fontWeight: 700 }}>#e63946 (Red)</td></tr>
                        <tr><td>Tier</td><td>Pro (active)</td></tr>
                        <tr><td>Location</td><td>42 Warrior Lane, Manchester M1 4BT</td></tr>
                    </tbody></table>
                </div>

                <div className="qs-sec"><h3>👥 Pre-Seeded Members (7)</h3>
                    <table><thead><tr><th>Name</th><th>Role</th><th>Belt</th><th>Plan</th></tr></thead>
                        <tbody>{members.map(m => <tr key={m.name}><td>{m.name}</td><td>{m.role}</td><td>{m.belt}</td><td>{m.plan}</td></tr>)}</tbody></table>
                </div>

                <div className="qs-sec"><h3>📅 Pre-Seeded Classes (5)</h3>
                    <table><thead><tr><th>Class</th><th>Day</th><th>Time</th><th>Type</th></tr></thead>
                        <tbody>{classes.map(c => <tr key={c.name}><td>{c.name}</td><td>{c.day}</td><td>{c.time}</td><td>{c.type}</td></tr>)}</tbody></table>
                </div>

                <div className="qs-sec"><h3>🔗 Admin Pages</h3>
                    <table><thead><tr><th>Page</th><th>URL</th></tr></thead>
                        <tbody>{adminPages.map(([n, u]) => <tr key={u}><td>{n}</td><td className="qs-url">{u}</td></tr>)}</tbody></table>
                </div>

                <div className="qs-sec"><h3>🔗 Member Pages</h3>
                    <table><thead><tr><th>Page</th><th>URL</th></tr></thead>
                        <tbody>{memberPages.map(([n, u]) => <tr key={u}><td>{n}</td><td className="qs-url">{u}</td></tr>)}</tbody></table>
                </div>

                <div className="qs-warn">⚠️ <strong>Resetting Demo Data:</strong> Run <code>supabase/seed_demo_tenant.sql</code> in the Supabase SQL Editor. Safe to re-run — uses ON CONFLICT DO NOTHING.</div>

                <div className="qs-sec"><h3>🔧 Troubleshooting</h3>
                    <div className="qs-trouble">
                        <div className="qs-tr"><strong>Can&apos;t log in?</strong><span>Check credentials above. Password is case-sensitive.</span></div>
                        <div className="qs-tr"><strong>Data looks empty?</strong><span>Re-run seed_demo_tenant.sql in Supabase SQL Editor.</span></div>
                        <div className="qs-tr"><strong>&quot;Tenant not found&quot; error?</strong><span>Ensure the tenant record exists in public.tenants table.</span></div>
                        <div className="qs-tr"><strong>Stripe features show errors?</strong><span>Expected — Stripe price IDs are fake in demo. Finance dashboard still works.</span></div>
                    </div>
                </div>
            </div>
        </div>
    );
}
