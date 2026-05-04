import React from 'react';
import Link from 'next/link';

const s = {
    h2: { fontSize: '1.5rem', fontWeight: '800' as const, color: '#0F172A', marginTop: '40px', marginBottom: '16px', lineHeight: '1.3' },
    h3: { fontSize: '1.15rem', fontWeight: '700' as const, color: '#0F172A', marginTop: '32px', marginBottom: '12px' },
    p: { color: '#475569', fontSize: '1rem', lineHeight: '1.8', marginBottom: '16px' },
    li: { color: '#475569', fontSize: '1rem', lineHeight: '1.8', marginBottom: '8px' },
    strong: { color: '#0F172A', fontWeight: '600' as const },
    th: { background: '#F8FAFC', padding: '12px 16px', textAlign: 'left' as const, fontWeight: '700', color: '#0F172A', borderBottom: '2px solid #E2E8F0' },
    td: { padding: '12px 16px', borderBottom: '1px solid #F1F5F9', color: '#475569' },
};

function ArticleContent() {
    return (
        <article>
            <p style={s.p}>One of the first questions martial arts club owners ask when evaluating management software is: <strong style={s.strong}>&quot;How much does it actually cost?&quot;</strong></p>
            <p style={s.p}>The answer isn&apos;t always straightforward. Pricing varies widely depending on the platform, your club size, and which features you need. In this guide, we provide a transparent breakdown of gym management software pricing in the UK for 2026.</p>

            <h2 style={s.h2}>Pricing Overview: What to Expect</h2>
            <p style={s.p}>Most gym management platforms charge a monthly subscription based on features or member count. Here&apos;s a quick overview of what UK clubs typically pay:</p>

            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px', fontSize: '0.9rem' }}>
                    <thead><tr><th style={s.th}>Platform</th><th style={s.th}>Starting Price</th><th style={s.th}>Mid-Tier</th><th style={s.th}>Enterprise</th><th style={s.th}>Free Trial?</th></tr></thead>
                    <tbody>
                        <tr><td style={s.td}>ClubForge</td><td style={s.td}>£39/mo</td><td style={s.td}>£129/mo</td><td style={s.td}>£349/mo</td><td style={s.td}>✅ 14 days</td></tr>
                        <tr><td style={s.td}>Coacha</td><td style={s.td}>£29/mo</td><td style={s.td}>£49/mo</td><td style={s.td}>Custom</td><td style={s.td}>✅ Free plan</td></tr>
                        <tr><td style={s.td}>Gymdesk</td><td style={s.td}>$99/mo (~£79)</td><td style={s.td}>$149/mo</td><td style={s.td}>$199/mo</td><td style={s.td}>✅ 30 days</td></tr>
                        <tr><td style={s.td}>Zen Planner</td><td style={s.td}>$117/mo (~£93)</td><td style={s.td}>$217/mo</td><td style={s.td}>$317/mo</td><td style={s.td}>✅</td></tr>
                        <tr><td style={s.td}>Kicksite</td><td style={s.td}>$59/mo (~£47)</td><td style={s.td}>$99/mo</td><td style={s.td}>$149/mo</td><td style={s.td}>✅ 14 days</td></tr>
                        <tr><td style={s.td}>Mindbody</td><td style={s.td}>$139/mo (~£110)</td><td style={s.td}>$279/mo</td><td style={s.td}>$499/mo</td><td style={s.td}>❌</td></tr>
                    </tbody>
                </table>
            </div>

            <h2 style={s.h2}>What&apos;s Included at Each Price Point?</h2>

            <h3 style={s.h3}>Budget Tier (£29–£50/month)</h3>
            <p style={s.p}>At this level, expect basic features: member database, simple scheduling, and payment collection. Belt tracking and advanced features are usually limited or unavailable. Coacha and Kicksite fall into this range.</p>

            <h3 style={s.h3}>Mid-Range (£50–£130/month)</h3>
            <p style={s.p}>This is where most martial arts clubs find the best value. Platforms like <Link href="/" style={{ color: '#C5A456', fontWeight: '600' }}>ClubForge</Link> (from £39/mo) and Gymdesk offer comprehensive features including belt progression, attendance tracking, member portals, and integrated payments.</p>

            <h3 style={s.h3}>Enterprise (£150+/month)</h3>
            <p style={s.p}>Enterprise-tier pricing is typically for multi-location chains, franchise operations, or clubs needing advanced automation, API access, and custom integrations. Zen Planner and Mindbody operate primarily at this level.</p>

            <h2 style={s.h2}>Hidden Costs to Watch For</h2>
            <ul style={{ paddingLeft: '24px', marginBottom: '24px' }}>
                <li style={s.li}><strong style={s.strong}>Transaction fees</strong> — Some platforms charge a percentage on top of Stripe/payment processor fees. Check whether your platform adds a surcharge to each transaction.</li>
                <li style={s.li}><strong style={s.strong}>Setup fees</strong> — A few platforms charge one-time setup or onboarding fees. ClubForge has zero setup fees.</li>
                <li style={s.li}><strong style={s.strong}>Contract lock-in</strong> — Some platforms require annual contracts. Look for month-to-month options with the ability to cancel anytime.</li>
                <li style={s.li}><strong style={s.strong}>Currency conversion</strong> — US-priced platforms will cost you more due to exchange rates and potential bank conversion fees.</li>
                <li style={s.li}><strong style={s.strong}>Add-on features</strong> — Features like SMS marketing, advanced reporting, or custom branding are sometimes charged separately.</li>
            </ul>

            <h2 style={s.h2}>Is Free Gym Software Worth It?</h2>
            <p style={s.p}>Some platforms offer free plans, but they come with severe limitations: restricted member counts, no belt tracking, limited scheduling, and often display the platform&apos;s branding on your member-facing pages. For a professional martial arts academy, the £39–£129/month investment in proper software pays for itself through saved admin time, reduced payment chasing, and better member retention.</p>

            <h2 style={s.h2}>The Bottom Line</h2>
            <p style={s.p}>For UK martial arts clubs, <Link href="/pricing" style={{ color: '#C5A456', fontWeight: '600' }}>ClubForge&apos;s pricing</Link> offers the best value: martial arts-specific features (belt tracking, grading, attendance) at a price point designed for real club operators, not enterprise chains. Start with the Starter plan at £39/month and scale as you grow.</p>
            <p style={s.p}><Link href="/get-started" style={{ color: '#C5A456', fontWeight: '600' }}>Start a free 14-day trial →</Link></p>
        </article>
    );
}

export const gymSoftwareCostArticle = {
    content: <ArticleContent />,
    faqs: [
        { question: 'How much does gym management software cost in the UK?', answer: 'UK gym management software ranges from £29/month (basic platforms) to £349+/month (enterprise). ClubForge starts at £39/month for clubs with up to 150 members, including belt tracking, payments, and scheduling.' },
        { question: 'Is there free martial arts management software?', answer: 'Some platforms offer free plans with limited features. However, free plans typically lack belt tracking, advanced scheduling, and branded member portals. For a professional martial arts academy, paid software (starting from £39/month) is recommended.' },
        { question: 'Do gym software platforms charge transaction fees?', answer: 'Payment processors like Stripe charge their standard fees (typically 1.4% + 20p per transaction in the UK). Some management platforms add an additional surcharge on top. ClubForge does not charge additional transaction fees beyond Stripe\'s standard rates.' },
        { question: 'Can I cancel gym management software anytime?', answer: 'Most modern platforms, including ClubForge, offer month-to-month pricing with no long-term contracts. You can cancel anytime from your admin settings.' },
    ],
};
