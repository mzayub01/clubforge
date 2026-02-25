'use client';

import Link from 'next/link';

export default function PricingPage() {
    return (
        <div style={{ background: '#FAFBFC', color: '#334155', lineHeight: 1.7, minHeight: '100vh' }}>
            <style>{`
        .pr-hero{background:linear-gradient(135deg,#0F172A,#1E293B);color:#fff;padding:60px 24px 48px;text-align:center}
        .pr-hero h1{font-size:clamp(1.8rem,4vw,2.5rem);font-weight:800;margin-bottom:8px}
        .pr-hero h1 span{background:linear-gradient(135deg,#D4B86A,#C5A456);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
        .pr-hero p{color:#94A3B8;font-size:1rem;max-width:550px;margin:0 auto}
        .pr-wrap{max-width:900px;margin:0 auto;padding:40px 24px 80px}
        .pr-plans{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:40px}
        @media(max-width:700px){.pr-plans{grid-template-columns:1fr}}
        .pr-plan{background:#fff;border:1px solid #E2E8F0;border-radius:16px;padding:28px;text-align:center;position:relative;transition:box-shadow .2s}
        .pr-plan:hover{box-shadow:0 4px 24px rgba(0,0,0,0.08)}
        .pr-plan.feat{border:2px solid #C5A456;box-shadow:0 4px 24px rgba(197,164,86,0.15)}
        .pr-pop{position:absolute;top:-12px;left:50%;transform:translateX(-50%);background:linear-gradient(135deg,#D4B86A,#A88B3D);color:#0F172A;font-size:10px;font-weight:800;padding:4px 14px;border-radius:100px;letter-spacing:1px;white-space:nowrap}
        .pr-name{font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#94A3B8;margin-bottom:4px}
        .pr-price{font-size:2.2rem;font-weight:800;color:#0F172A}
        .pr-price span{font-size:14px;color:#94A3B8;font-weight:500}
        .pr-ann{font-size:12px;color:#22C55E;font-weight:600;margin:4px 0 16px}
        .pr-det{font-size:13px;color:#64748B;padding:6px 0;border-top:1px solid #F1F5F9}
        .pr-det strong{color:#0F172A}
        .pr-big{background:linear-gradient(135deg,rgba(197,164,86,0.08),rgba(197,164,86,0.04));border:1px solid rgba(197,164,86,0.2);border-radius:16px;padding:28px;text-align:center;margin-bottom:24px}
        .pr-big .num{font-size:3rem;font-weight:800;background:linear-gradient(135deg,#D4B86A,#A88B3D);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin:8px 0}
        .pr-big .lbl{font-size:14px;color:#64748B}
        .pr-sec{background:#fff;border:1px solid #E2E8F0;border-radius:16px;padding:24px;margin-bottom:20px}
        .pr-sec h3{font-size:16px;font-weight:800;color:#0F172A;margin:0 0 16px}
        table{width:100%;border-collapse:collapse;font-size:13px}
        th{text-align:left;padding:10px 12px;background:#F8FAFC;font-weight:700;color:#0F172A;border-bottom:2px solid #E2E8F0;font-size:12px}
        td{padding:10px 12px;border-bottom:1px solid #F1F5F9}
        .saved{color:#22C55E;font-weight:700}
        .pr-roi{background:#F0FDF4;border:1px solid #BBF7D0;border-radius:16px;padding:24px;margin-bottom:20px}
        .pr-roi h3{color:#15803D;margin:0 0 12px;font-size:15px;font-weight:700}
        .pr-roi .stat{font-size:1.5rem;font-weight:800;color:#0F172A;margin:8px 0}
        .pr-roi p{font-size:14px;color:#334155;margin:0}
        .pr-vs{display:grid;grid-template-columns:1fr 1fr;gap:2px;border-radius:16px;overflow:hidden;margin-bottom:20px}
        @media(max-width:600px){.pr-vs{grid-template-columns:1fr}}
        .pr-vc{padding:24px;font-size:13px}
        .pr-vc.bad{background:#FEF2F2}
        .pr-vc.good{background:#F0FDF4}
        .pr-vc h4{font-size:14px;font-weight:800;margin:0 0 14px;padding-bottom:10px;border-bottom:2px solid rgba(0,0,0,0.05)}
        .pr-vc.bad h4{color:#991B1B}
        .pr-vc.good h4{color:#166534}
        .pr-vc ul{list-style:none;padding:0;margin:0}
        .pr-vc li{padding:5px 0;color:#334155}
        .pr-vc.bad li::before{content:"✗ ";color:#DC2626;font-weight:700}
        .pr-vc.good li::before{content:"✓ ";color:#22C55E;font-weight:700}
        .pr-faq{border-top:1px solid #E2E8F0;padding:14px 0}
        .pr-faq strong{color:#0F172A;display:block;margin-bottom:2px;font-size:14px}
        .pr-faq span{color:#64748B;font-size:13px}
        .pr-script{background:linear-gradient(135deg,#0F172A,#1E293B);border-radius:16px;padding:28px;color:#fff;margin-top:32px}
        .pr-script h3{font-size:14px;font-weight:700;color:#C5A456;text-transform:uppercase;letter-spacing:1px;margin:0 0 12px}
        .pr-script p{font-size:14px;color:#E2E8F0;font-style:italic;line-height:1.8;margin:0 0 12px}
        .pr-script .link{font-size:16px;font-weight:700;color:#C5A456;font-style:normal;text-align:center;display:block;margin-top:16px}
      `}</style>

            <nav className="sp-nav">
                <Link href="/docs/salespack" className="sp-nav-brand">Club<span>Forge</span> Sales Pack</Link>
                <Link href="/docs/salespack" className="sp-nav-back">← Back to Index</Link>
            </nav>

            <div className="pr-hero"><h1>💰 Pricing & <span>ROI</span></h1><p>Quick-reference for pricing conversations, ROI talking points, and competitive positioning.</p></div>

            <div className="pr-wrap">
                <div className="pr-plans">
                    <div className="pr-plan">
                        <div className="pr-name">🟢 Starter</div>
                        <div className="pr-price">£39<span>/mo</span></div>
                        <div className="pr-ann">Annual: £31/mo (save 20%)</div>
                        <div className="pr-det"><strong>Up to 150</strong> members</div>
                        <div className="pr-det"><strong>1</strong> location</div>
                        <div className="pr-det"><strong>5</strong> events</div>
                        <div className="pr-det">Email support (48h)</div>
                    </div>
                    <div className="pr-plan feat">
                        <div className="pr-pop">MOST POPULAR</div>
                        <div className="pr-name">⭐ Pro</div>
                        <div className="pr-price">£129<span>/mo</span></div>
                        <div className="pr-ann">Annual: £103/mo (save 20%)</div>
                        <div className="pr-det"><strong>Up to 750</strong> members</div>
                        <div className="pr-det"><strong>Up to 3</strong> locations</div>
                        <div className="pr-det"><strong>50</strong> events + <strong>30</strong> videos</div>
                        <div className="pr-det">Priority support (24h)</div>
                    </div>
                    <div className="pr-plan">
                        <div className="pr-name">🔵 Elite</div>
                        <div className="pr-price">£349<span>/mo</span></div>
                        <div className="pr-ann">Annual: £279/mo (save 20%)</div>
                        <div className="pr-det"><strong>Unlimited</strong> members</div>
                        <div className="pr-det"><strong>Unlimited</strong> locations</div>
                        <div className="pr-det"><strong>Unlimited</strong> everything</div>
                        <div className="pr-det">Dedicated account manager</div>
                    </div>
                </div>

                <div className="pr-big">
                    <div className="lbl">Per-member cost (Starter at capacity)</div>
                    <div className="num">26p</div>
                    <div className="lbl">per member, per month — less than a water bottle</div>
                </div>

                <div className="pr-sec"><h3>📊 Per-Member Cost Breakdown</h3>
                    <table><thead><tr><th>Plan</th><th>Monthly</th><th>Per Member (half cap)</th><th>Per Member (at cap)</th><th>Daily</th></tr></thead>
                        <tbody>
                            <tr><td><strong>Starter</strong></td><td>£39</td><td>52p</td><td className="saved">26p</td><td>£1.30</td></tr>
                            <tr><td><strong>Pro</strong></td><td>£129</td><td>34p</td><td className="saved">17p</td><td>£4.30</td></tr>
                            <tr><td><strong>Elite</strong></td><td>£349</td><td>—</td><td>—</td><td>£11.63</td></tr>
                        </tbody></table>
                </div>

                <div className="pr-roi"><h3>⏱️ Time Saved</h3><div className="stat">8–13 hours saved per week</div><p>400–650 hours per year — 50–80 full working days back. Admin tasks that vanish: chasing payments, spreadsheets, schedule questions, onboarding, attendance, belt admin.</p></div>
                <div className="pr-roi"><h3>💷 Revenue Recovery</h3><div className="stat">£600–1,800 recovered per month</div><p>Failed payments auto-retried. Fading members caught early. Trial members converted. Even 2–3 recovered payments covers Starter.</p></div>
                <div className="pr-roi"><h3>🎯 The One-Cancellation Test</h3><div className="stat">1 retained member = ClubForge paid for itself</div><p>One save (~£40/mo) = £480/year vs Starter's £468 annual cost. Net positive from a single retention. At 3 saves/month = +£972/year net gain.</p></div>

                <div className="pr-vs">
                    <div className="pr-vc bad"><h4>❌ Spreadsheets</h4><ul><li>Manual payment chasing</li><li>Unstructured member data</li><li>Paper attendance or nothing</li><li>Belt tracking by memory</li><li>No revenue visibility</li><li>WhatsApp = chaos</li><li>8-14 hours/week admin</li></ul></div>
                    <div className="pr-vc good"><h4>✅ ClubForge</h4><ul><li>Automatic Stripe billing</li><li>Searchable, role-based profiles</li><li>One-tap digital check-in</li><li>Structured belt progression</li><li>Real-time revenue dashboard</li><li>Branded member portal</li><li>~30 minutes/week admin</li></ul></div>
                </div>
                <div className="pr-vs">
                    <div className="pr-vc bad"><h4>❌ Generic Gym Software</h4><ul><li>No belt progression</li><li>No kids belt schemes</li><li>No grading feedback</li><li>Built for treadmill bookings</li><li>£100–300+/mo</li><li>Per-member fees</li><li>12–24 month contracts</li></ul></div>
                    <div className="pr-vc good"><h4>✅ ClubForge</h4><ul><li>Full adult belt scheme</li><li>13-belt kids progression</li><li>Written coach feedback</li><li>Built for martial arts</li><li>From £39/mo flat</li><li>No per-member charges</li><li>Month-to-month</li></ul></div>
                </div>

                <div className="pr-sec"><h3>❓ Pricing FAQs</h3>
                    <div className="pr-faq"><strong>&quot;Per-member charges?&quot;</strong><span>No. Flat monthly fee with member limits by tier.</span></div>
                    <div className="pr-faq"><strong>&quot;Platform fee?&quot;</strong><span>2.5% on member payments via Stripe, on top of Stripe&#39;s own fees.</span></div>
                    <div className="pr-faq"><strong>&quot;Card for the trial?&quot;</strong><span>No. 14 days free, no card required.</span></div>
                    <div className="pr-faq"><strong>&quot;Change plans?&quot;</strong><span>Yes — upgrade or downgrade anytime, prorated automatically.</span></div>
                    <div className="pr-faq"><strong>&quot;Annual discount?&quot;</strong><span>Yes — save 20% by paying annually.</span></div>
                    <div className="pr-faq"><strong>&quot;After the trial?&quot;</strong><span>Choose a plan or your account pauses. No surprise charges.</span></div>
                    <div className="pr-faq"><strong>&quot;Setup fee?&quot;</strong><span>No.</span></div>
                    <div className="pr-faq"><strong>&quot;Contract?&quot;</strong><span>No. Month-to-month. Cancel anytime.</span></div>
                </div>

                <div className="pr-script">
                    <h3>💬 Quick Pricing Script</h3>
                    <p>&quot;Everything you&apos;ve seen — dashboard, billing, belt tracking, member portal — starts at £39. Less than one membership at most clubs.</p>
                    <p>Most clubs go with Pro at £129 for multi-location, events, and the video library. But Starter has everything you need to launch.</p>
                    <p>Start a 14-day free trial — full Pro features, no card, no commitment.&quot;</p>
                    <span className="link">👉 clubforgehq.com/get-started</span>
                </div>
            </div>
        </div>
    );
}
