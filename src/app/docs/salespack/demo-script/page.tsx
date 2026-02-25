'use client';

import Link from 'next/link';

/* ── Shared inline styles ────────────────────────────── */
const pageStyles = `
  .ds-page { background: #FAFBFC; color: #334155; line-height: 1.7; }
  .ds-hero { background: linear-gradient(135deg,#0F172A,#1E293B); color:#fff; padding:60px 24px 48px; text-align:center }
  .ds-hero h1 { font-size:clamp(1.8rem,4vw,2.8rem); font-weight:800; margin-bottom:8px }
  .ds-hero h1 span { background:linear-gradient(135deg,#D4B86A,#C5A456); -webkit-background-clip:text; -webkit-text-fill-color:transparent }
  .ds-hero p { color:#94A3B8; font-size:1rem; max-width:550px; margin:0 auto }
  .ds-wrap { max-width:800px; margin:0 auto; padding:40px 24px 80px }
  .ds-check { background:#fff; border:1px solid #E2E8F0; border-radius:12px; padding:24px; margin-bottom:40px }
  .ds-check h3 { font-size:14px; font-weight:700; color:#0F172A; margin-bottom:12px; text-transform:uppercase; letter-spacing:.5px }
  .ds-ci { display:flex; align-items:center; gap:10px; padding:8px 0; border-bottom:1px solid #F1F5F9; font-size:14px }
  .ds-ci:last-child { border-bottom:none }
  .ds-ci::before { content:"☐"; font-size:16px; color:#C5A456 }
  .ds-act { margin-bottom:48px }
  .ds-ah { display:flex; align-items:center; gap:14px; margin-bottom:20px; padding-bottom:12px; border-bottom:2px solid #E2E8F0; flex-wrap:wrap }
  .ds-num { background:linear-gradient(135deg,#D4B86A,#A88B3D); color:#0F172A; width:36px; height:36px; border-radius:10px; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:14px; flex-shrink:0 }
  .ds-ah h2 { font-size:1.25rem; font-weight:800; color:#0F172A }
  .ds-time { font-size:12px; color:#94A3B8; font-weight:600; margin-left:auto; background:#F1F5F9; padding:4px 10px; border-radius:6px }
  .ds-talk { background:#F0FDF4; border-left:4px solid #22C55E; padding:16px 20px; border-radius:0 10px 10px 0; margin:16px 0; font-style:italic; color:#15803D; font-size:14px; line-height:1.8 }
  .ds-talk-label { font-style:normal; font-weight:700; font-size:11px; letter-spacing:.5px; margin-bottom:4px; display:block }
  .ds-wow { background:linear-gradient(135deg,rgba(197,164,86,0.08),rgba(197,164,86,0.04)); border:1px solid rgba(197,164,86,0.2); border-radius:12px; padding:20px; margin:20px 0 }
  .ds-wow-label { font-weight:800; font-size:11px; color:#A88B3D; letter-spacing:1px; margin-bottom:8px }
  .ds-wow p { font-style:italic; color:#92400E; font-size:14px; line-height:1.7 }
  .ds-do { background:#EFF6FF; border-left:4px solid #3B82F6; padding:14px 18px; border-radius:0 10px 10px 0; margin:12px 0; font-size:13px; color:#1E40AF }
  .ds-do-label { font-weight:700; font-size:11px; letter-spacing:.5px; margin-bottom:4px; display:block }
  .ds-tip { background:#FFFBEB; border:1px solid #FDE68A; border-radius:10px; padding:14px 18px; font-size:13px; color:#92400E; margin:16px 0 }
  table { width:100%; border-collapse:collapse; margin:16px 0; font-size:13px }
  th { background:#F8FAFC; text-align:left; padding:10px 14px; font-weight:700; color:#0F172A; border-bottom:2px solid #E2E8F0; font-size:12px }
  td { padding:10px 14px; border-bottom:1px solid #F1F5F9 }
  p { margin:10px 0; font-size:14px }
  .ds-fu { background:#fff; border:1px solid #E2E8F0; border-radius:12px; padding:24px; margin:24px 0 }
  .ds-fu h3 { font-size:15px; font-weight:800; color:#0F172A; margin-bottom:16px }
  .ds-fi { display:flex; gap:14px; padding:12px 0; border-bottom:1px solid #F1F5F9; font-size:13px }
  .ds-fi:last-child { border-bottom:none }
  .ds-day { background:#EFF6FF; color:#1D4ED8; font-weight:700; font-size:12px; padding:4px 10px; border-radius:6px; height:fit-content; white-space:nowrap }
  .ds-dnds { display:grid; grid-template-columns:1fr 1fr; gap:16px; margin:16px 0 }
  @media(max-width:600px) { .ds-dnds{grid-template-columns:1fr} }
  .ds-dbox { border-radius:12px; padding:18px; font-size:13px }
  .ds-dbox.green { background:#F0FDF4; border:1px solid #BBF7D0 }
  .ds-dbox.red { background:#FEF2F2; border:1px solid #FECACA }
  .ds-dbox h4 { font-size:12px; font-weight:700; margin-bottom:10px; text-transform:uppercase; letter-spacing:.5px }
  .ds-dbox.green h4 { color:#16A34A }
  .ds-dbox.red h4 { color:#DC2626 }
  .ds-dbox li { padding:4px 0; list-style:none }
`;

function Talk({ children }: { children: React.ReactNode }) {
    return <div className="ds-talk"><span className="ds-talk-label">💬 SAY:</span>{children}</div>;
}
function Wow({ children }: { children: React.ReactNode }) {
    return <div className="ds-wow"><div className="ds-wow-label">💥 WOW MOMENT</div><p>{children}</p></div>;
}
function Action({ children }: { children: React.ReactNode }) {
    return <div className="ds-do"><span className="ds-do-label">👆 DO:</span>{children}</div>;
}
function Act({ n, title, time, children }: { n: number; title: string; time: string; children: React.ReactNode }) {
    return (
        <div className="ds-act">
            <div className="ds-ah"><div className="ds-num">{n}</div><h2>{title}</h2><span className="ds-time">{time}</span></div>
            {children}
        </div>
    );
}

export default function DemoScriptPage() {
    return (
        <div className="ds-page">
            <style>{pageStyles}</style>
            <nav className="sp-nav">
                <Link href="/docs/salespack" className="sp-nav-brand">Club<span>Forge</span> Sales Pack</Link>
                <Link href="/docs/salespack" className="sp-nav-back">← Back to Index</Link>
            </nav>

            <div className="ds-hero">
                <h1>🎬 Demo <span>Script</span></h1>
                <p>Your 30-minute step-by-step playbook for turning prospects into customers.</p>
            </div>

            <div className="ds-wrap">
                {/* Checklist */}
                <div className="ds-check">
                    <h3>⏱️ Pre-Demo Checklist (5 min before)</h3>
                    <div className="ds-ci">Log in as Admin → demo-admin@clubforgehq.com / ClubForge2026!</div>
                    <div className="ds-ci">Open incognito tab as Member → demo-member@clubforgehq.com / ClubForge2026!</div>
                    <div className="ds-ci">Confirm demo data looks fresh (7 members, 5 classes, belt progressions)</div>
                    <div className="ds-ci">Close all unrelated browser tabs</div>
                    <div className="ds-ci">Have the prospect&apos;s club name, size, and discipline written down</div>
                </div>

                <Act n={1} title="The Hook" time="2 min">
                    <Talk>Thanks for making time, [Name]. Before I show you anything — quick question: how many hours a week would you say you spend on admin? Chasing payments, updating spreadsheets, answering WhatsApp messages about class times?</Talk>
                    <p><strong>Wait for their answer.</strong> Most say 8–15 hours. Use their number.</p>
                    <Talk>That&apos;s about [X] hours you&apos;re not coaching, not growing your club, and not getting paid for. ClubForge was built to give you those hours back. Let me show you exactly how.</Talk>
                    <div className="ds-tip">💡 Goal: Make them feel understood. They should be nodding before you show a single screen.</div>
                </Act>

                <Act n={2} title="The Command Centre" time="5 min">
                    <Action>Navigate to /admin — the Admin Dashboard</Action>
                    <Talk>This is your command centre. Everything that matters about your club — in one glance.</Talk>
                    <table><thead><tr><th>Point At</th><th>What to Say</th></tr></thead><tbody>
                        <tr><td>Total Members</td><td>&quot;247 members across all your programmes — segmented and searchable.&quot;</td></tr>
                        <tr><td>Monthly Revenue</td><td>&quot;£8,420 this month. Pulls directly from your live Stripe data.&quot;</td></tr>
                        <tr><td>Attendance Rate</td><td>&quot;87% attendance. Know instantly if a class is dying.&quot;</td></tr>
                        <tr><td>Classes This Week</td><td>&quot;18 classes running this week. Your schedule, live.&quot;</td></tr>
                    </tbody></table>
                    <Wow>Tell me — right now, do you know exactly how much revenue your club made last month? Or which members haven&apos;t shown up in 3 weeks? This is what ClubForge gives you from day one.</Wow>
                </Act>

                <Act n={3} title="Member Management" time="5 min">
                    <Action>Navigate to /admin/members — scroll the list, click a profile, highlight family accounts</Action>
                    <Talk>Every profile, every membership, every grading — all in one place.</Talk>
                    <Action>Navigate to /admin/invite — show the branded registration link</Action>
                    <Talk>You share this link. They register, accept the waiver, pick a membership, and pay — without you touching a thing.</Talk>
                    <Wow>Think about the last time you onboarded a new member. How many texts did it take? With ClubForge, it&apos;s one link, five minutes, done.</Wow>
                </Act>

                <Act n={4} title="Classes & Attendance" time="4 min">
                    <Action>Navigate to /admin/classes → /admin/class-roster → /admin/attendance</Action>
                    <Talk>Your class timetable, class rosters with check-in status, and attendance analytics — all connected.</Talk>
                    <Wow>Imagine knowing, before the month ends, that 12 members haven&apos;t trained in 3 weeks. That&apos;s 12 cancellations you can prevent with one message.</Wow>
                </Act>

                <Act n={5} title="Billing & Finance" time="5 min">
                    <Action>Navigate to /admin/finance → /admin/membership-types → /admin/promo-codes</Action>
                    <Talk>Set up your tiers — Adults, Kids, All-Access — Stripe handles recurring billing, invoicing, and failed payment recovery automatically.</Talk>
                    <Wow>How much revenue are you losing to failed payments, expired cards, and members who &quot;forget&quot; to pay? Stripe handles all of that. You just see the money arrive.</Wow>
                </Act>

                <Act n={6} title="Belt Progression" time="4 min">
                    <Action>Navigate to /admin/grading-settings — show adult and kids belt schemes</Action>
                    <Talk>Adult belts, kids belts with 13-rank progression, professor access controls, grading feedback — all built in. This is where ClubForge separates from generic gym software.</Talk>
                    <Wow>Your members see their belt history and grading feedback from their phone. No more &quot;Sensei, when&apos;s my next grading?&quot; messages. A member who visualizes progress is a member who stays.</Wow>
                </Act>

                <Act n={7} title="The Member Experience" time="3 min">
                    <Action>Switch to the Member incognito tab — navigate to /dashboard</Action>
                    <Talk>This is what YOUR members see. Dashboard, classes, belt progress, announcements — clean, branded, mobile-friendly.</Talk>
                    <Wow>This is what your members will show their friends. &quot;Look at my club&apos;s app.&quot; That&apos;s organic marketing that costs you nothing.</Wow>
                </Act>

                <Act n={8} title="White-Label Branding" time="2 min">
                    <Action>Navigate to /admin/settings — show colours, logo, branding</Action>
                    <Talk>Everything branded to you. Your club name, your colours, your logo. When members log in, they see YOUR club — not ClubForge. We just power it.</Talk>
                </Act>

                <Act n={9} title="The Close" time="4 min">
                    <Talk>Everything you just saw starts at £39 a month for Starter. Most clubs go with Pro at £129.</Talk>
                    <table><thead><tr><th></th><th>Starter</th><th>Pro ⭐</th><th>Elite</th></tr></thead><tbody>
                        <tr><td><strong>Price</strong></td><td>£39/mo</td><td>£129/mo</td><td>£349/mo</td></tr>
                        <tr><td><strong>Annual</strong></td><td>£31/mo</td><td>£103/mo</td><td>£279/mo</td></tr>
                        <tr><td><strong>Members</strong></td><td>Up to 150</td><td>Up to 750</td><td>Unlimited</td></tr>
                    </tbody></table>
                    <Talk>Start a 14-day free trial — full Pro features, no card required. If it&apos;s not saving you hours by day 3, I&apos;ll buy you a coffee.</Talk>
                    <p style={{ textAlign: 'center', marginTop: 20 }}><strong style={{ fontSize: 16, color: '#0F172A' }}>👉 clubforgehq.com/get-started</strong></p>
                </Act>

                {/* Follow-up */}
                <div className="ds-fu">
                    <h3>📧 Post-Demo Follow-Up</h3>
                    <div className="ds-fi"><span className="ds-day">Same Day</span><div>Thank-you email with trial link, pricing link, and your contact info.</div></div>
                    <div className="ds-fi"><span className="ds-day">Day 3</span><div>&quot;Did you get a chance to set up your club? Happy to jump on a quick call.&quot;</div></div>
                    <div className="ds-fi"><span className="ds-day">Day 7</span><div>&quot;Trial is halfway through. How&apos;s it going?&quot;</div></div>
                    <div className="ds-fi"><span className="ds-day">Day 12</span><div>&quot;Trial wraps up in 2 days. Ready to lock in? 20% annual discount available.&quot;</div></div>
                </div>

                {/* Do's / Don'ts */}
                <div className="ds-dnds">
                    <div className="ds-dbox green"><h4>✅ Do</h4><ul>
                        <li>✅ Ask about their setup first</li>
                        <li>✅ Use their club name in examples</li>
                        <li>✅ Pause after wow moments</li>
                        <li>✅ Show admin AND member views</li>
                        <li>✅ Relate features to their pain</li>
                        <li>✅ Follow up within 2 hours</li>
                    </ul></div>
                    <div className="ds-dbox red"><h4>❌ Don&apos;t</h4><ul>
                        <li>❌ Jump straight into features</li>
                        <li>❌ Call it &quot;the demo tenant&quot;</li>
                        <li>❌ Rush through every screen</li>
                        <li>❌ Only show the admin side</li>
                        <li>❌ List features like a brochure</li>
                        <li>❌ End with &quot;any questions?&quot; only</li>
                    </ul></div>
                </div>
            </div>
        </div>
    );
}
