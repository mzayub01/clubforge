import React from 'react';
import Link from 'next/link';

const s = {
    h2: { fontSize: '1.5rem', fontWeight: '800' as const, color: '#0F172A', marginTop: '40px', marginBottom: '16px', lineHeight: '1.3' },
    h3: { fontSize: '1.15rem', fontWeight: '700' as const, color: '#0F172A', marginTop: '32px', marginBottom: '12px' },
    p: { color: '#475569', fontSize: '1rem', lineHeight: '1.8', marginBottom: '16px' },
    li: { color: '#475569', fontSize: '1rem', lineHeight: '1.8', marginBottom: '8px' },
    strong: { color: '#0F172A', fontWeight: '600' as const },
    callout: { background: '#F0F9FF', border: '1px solid #BAE6FD', borderRadius: '12px', padding: '20px 24px', marginBottom: '24px', marginTop: '24px' },
    th: { background: '#F8FAFC', padding: '12px 16px', textAlign: 'left' as const, fontWeight: '700', color: '#0F172A', borderBottom: '2px solid #E2E8F0' },
    td: { padding: '12px 16px', borderBottom: '1px solid #F1F5F9', color: '#475569' },
};

function ArticleContent() {
    return (
        <article>
            <p style={s.p}>If you run a martial arts club in the UK, choosing the right management software can feel overwhelming. There are dozens of options — from generic fitness platforms to martial arts-specific tools — and most of them weren&apos;t designed with UK clubs in mind.</p>
            <p style={s.p}>This guide cuts through the noise. We&apos;ll cover <strong style={s.strong}>what UK martial arts club owners actually need</strong>, how the leading platforms compare, and what to look for when choosing software for your BJJ academy, MMA gym, karate dojo, or multi-discipline school.</p>

            <h2 style={s.h2}>What Makes UK Martial Arts Clubs Different?</h2>
            <p style={s.p}>UK-based clubs have specific requirements that many international platforms overlook:</p>
            <ul style={{ paddingLeft: '24px', marginBottom: '24px' }}>
                <li style={s.li}><strong style={s.strong}>GBP pricing and UK payment methods</strong> — Stripe UK, GoCardless, and Direct Debit support matter. Many US-focused platforms only support USD billing.</li>
                <li style={s.li}><strong style={s.strong}>GDPR compliance</strong> — Member data must be handled in accordance with UK GDPR. This includes right to deletion, data export, and explicit consent.</li>
                <li style={s.li}><strong style={s.strong}>Belt and grading systems</strong> — Unlike generic gyms, martial arts clubs need built-in belt progression, stripe tracking, and grading history.</li>
                <li style={s.li}><strong style={s.strong}>Family accounts</strong> — Many UK martial arts clubs run kids classes. Parents need to manage multiple children under one login with a single consolidated bill.</li>
                <li style={s.li}><strong style={s.strong}>Multi-location support</strong> — Growing academies often expand to multiple venues across a city or region.</li>
            </ul>

            <h2 style={s.h2}>Top Martial Arts Software Platforms in the UK (2026)</h2>

            <h3 style={s.h3}>1. ClubForge — The Complete Solution for UK Martial Arts Clubs</h3>
            <p style={s.p}><Link href="/" style={{ color: '#C5A456', fontWeight: '600' }}>ClubForge</Link> is the only platform designed specifically for UK martial arts academies from the ground up. It includes full belt progression with stripe-level tracking and instructor feedback, class scheduling, attendance tracking, Stripe payments in GBP, family accounts, and a branded member portal — all in one system.</p>
            <p style={s.p}>Unlike competitors that retrofit martial arts features onto generic gym software, ClubForge was built around the martial arts grading and progression workflow. It’s fully GDPR compliant, supports multi-location academies, and starts at just £39/month — significantly more affordable than US-based alternatives.</p>
            <div style={s.callout}><p style={{ ...s.p, marginBottom: 0, color: '#0369A1' }}><strong>Best for:</strong> BJJ academies, MMA gyms, karate dojos, and multi-discipline clubs in the UK that want one platform for everything.</p></div>

            <h3 style={s.h3}>2. Gymdesk — US-Focused, Limited UK Support</h3>
            <p style={s.p}>Gymdesk offers basic belt tracking and is used by some martial arts schools internationally. However, it’s primarily designed for the US market — pricing is in USD (from $99/month), there’s no native GBP billing, and GDPR compliance is not guaranteed. UK clubs may find the platform less tailored to their needs compared to UK-native alternatives.</p>

            <h3 style={s.h3}>3. Coacha — Basic UK Option</h3>
            <p style={s.p}>Coacha is a UK-based platform with basic features including digital registers and payment collection. It’s affordable (from £29/month), but lacks dedicated belt progression, detailed grading history, and the member portal depth that martial arts clubs need as they grow. Better suited for simple sports clubs than serious martial arts academies.</p>

            <h3 style={s.h3}>4. NEST Management — UK Direct Debit Specialist</h3>
            <p style={s.p}>NEST Management is deeply integrated with UK payment systems, particularly Direct Debit. It&apos;s a solid option for clubs that prioritise automated billing, though it has less focus on belt tracking and member portals.</p>

            <h3 style={s.h3}>5. Zen Planner — Expensive Enterprise Option</h3>
            <p style={s.p}>Zen Planner is a comprehensive platform aimed at larger operations, starting at $117/month USD. While it includes belt tracking and automation, the price point and complexity make it impractical for most UK martial arts clubs. The interface can feel overwhelming compared to purpose-built tools like ClubForge.</p>

            <h2 style={s.h2}>Feature Comparison Table</h2>
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px', fontSize: '0.9rem' }}>
                    <thead><tr><th style={s.th}>Feature</th><th style={s.th}>ClubForge</th><th style={s.th}>Gymdesk</th><th style={s.th}>Coacha</th><th style={s.th}>Zen Planner</th></tr></thead>
                    <tbody>
                        <tr><td style={s.td}>Belt progression</td><td style={s.td}>✅ Full</td><td style={s.td}>⚠️ Basic</td><td style={s.td}>⚠️ Limited</td><td style={s.td}>✅</td></tr>
                        <tr><td style={s.td}>UK payment support</td><td style={s.td}>✅ Stripe UK</td><td style={s.td}>❌ USD only</td><td style={s.td}>✅ Stripe/GC</td><td style={s.td}>❌ USD only</td></tr>
                        <tr><td style={s.td}>GDPR compliant</td><td style={s.td}>✅ Full</td><td style={s.td}>❌ Unclear</td><td style={s.td}>✅</td><td style={s.td}>❌ Unclear</td></tr>
                        <tr><td style={s.td}>Family accounts</td><td style={s.td}>✅</td><td style={s.td}>✅</td><td style={s.td}>✅</td><td style={s.td}>✅</td></tr>
                        <tr><td style={s.td}>Member portal</td><td style={s.td}>✅</td><td style={s.td}>✅</td><td style={s.td}>⚠️</td><td style={s.td}>✅</td></tr>
                        <tr><td style={s.td}>Multi-location</td><td style={s.td}>✅</td><td style={s.td}>⚠️</td><td style={s.td}>❌</td><td style={s.td}>✅</td></tr>
                        <tr><td style={s.td}>Starts from</td><td style={s.td}>£39/mo</td><td style={s.td}>$99/mo</td><td style={s.td}>£29/mo</td><td style={s.td}>$117/mo</td></tr>
                    </tbody>
                </table>
            </div>

            <h2 style={s.h2}>How to Choose the Right Software</h2>
            <p style={s.p}>When evaluating martial arts software for your UK club, ask these questions:</p>
            <ul style={{ paddingLeft: '24px', marginBottom: '24px' }}>
                <li style={s.li}>Does it handle belt and rank progression natively, or is it bolted on?</li>
                <li style={s.li}>Can it process payments in GBP through UK-supported providers?</li>
                <li style={s.li}>Does it support family accounts for kids classes?</li>
                <li style={s.li}>Is member data GDPR compliant with export and deletion options?</li>
                <li style={s.li}>Can it scale to multiple locations if you grow?</li>
                <li style={s.li}>Do members get a self-service portal to check schedules and progress?</li>
            </ul>

            <h2 style={s.h2}>The Bottom Line</h2>
            <p style={s.p}>For UK martial arts clubs looking for a comprehensive, purpose-built solution, <Link href="/" style={{ color: '#C5A456', fontWeight: '600' }}>ClubForge</Link> provides the best balance of martial arts-specific features, UK-native payment support, and competitive pricing. If you&apos;re still running your club on spreadsheets and WhatsApp, the switch to proper management software is one of the highest-ROI decisions you can make.</p>
            <p style={s.p}><Link href="/get-started" style={{ color: '#C5A456', fontWeight: '600' }}>Start a free 14-day trial →</Link></p>
        </article>
    );
}

export const martialArtsSoftwareUKArticle = {
    content: <ArticleContent />,
    faqs: [
        { question: 'What is the best martial arts software in the UK?', answer: 'The best martial arts software for UK clubs depends on your needs. ClubForge is purpose-built for martial arts with belt tracking, GBP payments, and GDPR compliance. Coacha and NEST Management are also UK-focused options with simpler feature sets.' },
        { question: 'Do I need martial arts-specific software or can I use generic gym software?', answer: 'Generic gym software (like Mindbody or GymMaster) works for basic scheduling and payments, but martial arts clubs need belt progression, grading history, and stripe tracking. Purpose-built platforms like ClubForge handle these natively rather than as add-ons.' },
        { question: 'How much does martial arts club management software cost in the UK?', answer: 'UK pricing ranges from £29/month (basic platforms like Coacha) to £349/month (enterprise plans). ClubForge starts at £39/month for clubs with up to 150 members. Most platforms offer 14-day free trials.' },
        { question: 'Is ClubForge GDPR compliant?', answer: 'Yes. ClubForge is built in the UK and fully complies with UK GDPR. Member data is encrypted, tenant-isolated with row-level security, and members can export or delete their data at any time.' },
    ],
};
