import React from 'react';
import Link from 'next/link';

const articleStyle = {
    h2: { fontSize: '1.5rem', fontWeight: '800' as const, color: '#0F172A', marginTop: '40px', marginBottom: '16px', lineHeight: '1.3' },
    h3: { fontSize: '1.15rem', fontWeight: '700' as const, color: '#0F172A', marginTop: '32px', marginBottom: '12px' },
    p: { color: '#475569', fontSize: '1rem', lineHeight: '1.8', marginBottom: '16px' },
    li: { color: '#475569', fontSize: '1rem', lineHeight: '1.8', marginBottom: '8px' },
    strong: { color: '#0F172A', fontWeight: '600' as const },
    callout: { background: '#F0F9FF', border: '1px solid #BAE6FD', borderRadius: '12px', padding: '20px 24px', marginBottom: '24px', marginTop: '24px' },
    table: { width: '100%' as const, borderCollapse: 'collapse' as const, marginBottom: '24px', marginTop: '16px', fontSize: '0.9rem' },
    th: { background: '#F8FAFC', padding: '12px 16px', textAlign: 'left' as const, fontWeight: '700', color: '#0F172A', borderBottom: '2px solid #E2E8F0' },
    td: { padding: '12px 16px', borderBottom: '1px solid #F1F5F9', color: '#475569' },
};

function ArticleContent() {
    return (
        <article>
            <p style={articleStyle.p}>
                If you run a martial arts school, tracking belt promotions is one of your most important responsibilities. Every student&apos;s progression — from white belt to black belt — needs to be accurately recorded, easily accessible, and professionally managed.
            </p>
            <p style={articleStyle.p}>
                Yet most martial arts schools still track belts on paper, in spreadsheets, or not at all. The result? Lost grading records, forgotten stripe awards, and students who don&apos;t know where they stand.
            </p>
            <p style={articleStyle.p}>
                In this guide, we compare the <strong style={articleStyle.strong}>best apps to track belt promotions in 2026</strong>, covering features, pricing, and which disciplines each tool supports.
            </p>

            <h2 style={articleStyle.h2}>Why You Need a Belt Tracking App</h2>
            <p style={articleStyle.p}>
                Before we compare tools, here&apos;s why digital belt tracking matters for your academy:
            </p>
            <ul style={{ paddingLeft: '24px', marginBottom: '24px' }}>
                <li style={articleStyle.li}><strong style={articleStyle.strong}>Accuracy</strong> — No more lost paper records or forgotten stripes. Every promotion is logged with date, instructor, and notes.</li>
                <li style={articleStyle.li}><strong style={articleStyle.strong}>Transparency</strong> — Students and parents can see their progression, creating engagement and motivation.</li>
                <li style={articleStyle.li}><strong style={articleStyle.strong}>Grading decisions</strong> — When it&apos;s time for assessments, you have attendance data and promotion history to make informed decisions.</li>
                <li style={articleStyle.li}><strong style={articleStyle.strong}>Professionalism</strong> — A proper belt tracking system shows students you take their journey seriously.</li>
                <li style={articleStyle.li}><strong style={articleStyle.strong}>Scalability</strong> — What works for 30 students breaks at 150. Digital tracking scales with your academy.</li>
            </ul>

            <h2 style={articleStyle.h2}>The Best Belt Tracking Apps Compared</h2>
            <p style={articleStyle.p}>
                Here&apos;s how the leading martial arts management platforms handle belt and rank tracking:
            </p>

            <div style={{ overflowX: 'auto' }}>
                <table style={articleStyle.table}>
                    <thead>
                        <tr>
                            <th style={articleStyle.th}>Feature</th>
                            <th style={articleStyle.th}>ClubForge</th>
                            <th style={articleStyle.th}>Gymdesk</th>
                            <th style={articleStyle.th}>Zen Planner</th>
                            <th style={articleStyle.th}>Kicksite</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr><td style={articleStyle.td}>Belt progression</td><td style={articleStyle.td}>✅ Full</td><td style={articleStyle.td}>✅ Full</td><td style={articleStyle.td}>✅ Full</td><td style={articleStyle.td}>✅ Full</td></tr>
                        <tr><td style={articleStyle.td}>Stripe tracking</td><td style={articleStyle.td}>✅ Individual</td><td style={articleStyle.td}>✅</td><td style={articleStyle.td}>⚠️ Limited</td><td style={articleStyle.td}>✅</td></tr>
                        <tr><td style={articleStyle.td}>Custom belt systems</td><td style={articleStyle.td}>✅</td><td style={articleStyle.td}>✅</td><td style={articleStyle.td}>✅</td><td style={articleStyle.td}>⚠️</td></tr>
                        <tr><td style={articleStyle.td}>Instructor feedback</td><td style={articleStyle.td}>✅</td><td style={articleStyle.td}>⚠️</td><td style={articleStyle.td}>✅</td><td style={articleStyle.td}>❌</td></tr>
                        <tr><td style={articleStyle.td}>Student portal view</td><td style={articleStyle.td}>✅</td><td style={articleStyle.td}>✅</td><td style={articleStyle.td}>✅</td><td style={articleStyle.td}>✅</td></tr>
                        <tr><td style={articleStyle.td}>Attendance integration</td><td style={articleStyle.td}>✅</td><td style={articleStyle.td}>✅</td><td style={articleStyle.td}>✅</td><td style={articleStyle.td}>⚠️</td></tr>
                        <tr><td style={articleStyle.td}>Kids belt systems</td><td style={articleStyle.td}>✅</td><td style={articleStyle.td}>✅</td><td style={articleStyle.td}>⚠️</td><td style={articleStyle.td}>⚠️</td></tr>
                        <tr><td style={articleStyle.td}>UK pricing (from)</td><td style={articleStyle.td}>£39/mo</td><td style={articleStyle.td}>$99/mo</td><td style={articleStyle.td}>$117/mo</td><td style={articleStyle.td}>$59/mo</td></tr>
                    </tbody>
                </table>
            </div>

            <h3 style={articleStyle.h3}>1. ClubForge — Best for UK Martial Arts Clubs</h3>
            <p style={articleStyle.p}>
                <Link href="/" style={{ color: '#C5A456', fontWeight: '600' }}>ClubForge</Link> is purpose-built for martial arts academies, with belt progression as a core feature rather than an afterthought. You can define custom belt systems for any discipline — BJJ (white through black with four stripes per belt), Karate (kyu/dan), Taekwondo (gup/dan), Judo, or any custom structure.
            </p>
            <p style={articleStyle.p}>
                Every stripe award and belt promotion is logged with instructor name, date, and written feedback. Students see their full progression history in their member portal. When it&apos;s grading time, you can see exactly how many sessions each student has attended since their last promotion.
            </p>
            <div style={articleStyle.callout}>
                <p style={{ ...articleStyle.p, marginBottom: 0, color: '#0369A1' }}>
                    <strong>Best for:</strong> BJJ academies, martial arts clubs, and multi-discipline schools in the UK. Includes integrated payments, scheduling, and attendance alongside belt tracking.
                </p>
            </div>

            <h3 style={articleStyle.h3}>2. Gymdesk — Best for BJJ-Specific Academies</h3>
            <p style={articleStyle.p}>
                Gymdesk was built by martial arts practitioners and has strong native belt tracking. It handles BJJ belt and stripe progressions well and integrates attendance data with promotion eligibility. The interface is clean and functional.
            </p>
            <p style={articleStyle.p}>
                The main drawback for UK clubs is that pricing is in USD, and there&apos;s less focus on the UK market (payment methods, compliance, etc.).
            </p>

            <h3 style={articleStyle.h3}>3. Zen Planner — Best for Larger Academies</h3>
            <p style={articleStyle.p}>
                Zen Planner is a feature-rich platform used by larger martial arts schools. It includes belt tracking with automation capabilities and comprehensive reporting. However, it&apos;s more expensive and can be overwhelming for smaller clubs.
            </p>

            <h3 style={articleStyle.h3}>4. Kicksite — Best for Simplicity</h3>
            <p style={articleStyle.p}>
                Kicksite is a simpler option that covers the basics of belt tracking. It&apos;s affordable and easy to set up, making it suitable for smaller schools that don&apos;t need advanced features like custom belt systems or detailed instructor feedback.
            </p>

            <h2 style={articleStyle.h2}>What to Look For in a Belt Tracking App</h2>
            <p style={articleStyle.p}>When evaluating belt tracking software, prioritise these features:</p>
            <ul style={{ paddingLeft: '24px', marginBottom: '24px' }}>
                <li style={articleStyle.li}><strong style={articleStyle.strong}>Custom belt structures</strong> — Can you define your own belt system? BJJ, Karate, and Taekwondo all have different structures.</li>
                <li style={articleStyle.li}><strong style={articleStyle.strong}>Stripe-level tracking</strong> — Does it track individual stripes, not just belt levels?</li>
                <li style={articleStyle.li}><strong style={articleStyle.strong}>Instructor feedback</strong> — Can coaches add notes and feedback to each promotion?</li>
                <li style={articleStyle.li}><strong style={articleStyle.strong}>Attendance integration</strong> — Can you see how many sessions a student attended since their last promotion?</li>
                <li style={articleStyle.li}><strong style={articleStyle.strong}>Student visibility</strong> — Can students see their own progression in a portal or app?</li>
                <li style={articleStyle.li}><strong style={articleStyle.strong}>Audit trail</strong> — Is there a history log of who awarded each promotion and when?</li>
            </ul>

            <h2 style={articleStyle.h2}>Spreadsheets vs. Dedicated Belt Tracking Software</h2>
            <p style={articleStyle.p}>
                Many club owners start with Google Sheets or Excel. While this works for small clubs, it breaks down quickly:
            </p>
            <div style={{ overflowX: 'auto' }}>
                <table style={articleStyle.table}>
                    <thead>
                        <tr>
                            <th style={articleStyle.th}>Factor</th>
                            <th style={articleStyle.th}>Spreadsheets</th>
                            <th style={articleStyle.th}>Belt Tracking App</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr><td style={articleStyle.td}>Setup time</td><td style={articleStyle.td}>Minutes</td><td style={articleStyle.td}>Minutes</td></tr>
                        <tr><td style={articleStyle.td}>Student visibility</td><td style={articleStyle.td}>❌ None</td><td style={articleStyle.td}>✅ Portal access</td></tr>
                        <tr><td style={articleStyle.td}>Scales past 50 students</td><td style={articleStyle.td}>❌ Breaks down</td><td style={articleStyle.td}>✅ Unlimited</td></tr>
                        <tr><td style={articleStyle.td}>Attendance link</td><td style={articleStyle.td}>❌ Manual</td><td style={articleStyle.td}>✅ Automatic</td></tr>
                        <tr><td style={articleStyle.td}>Backup/security</td><td style={articleStyle.td}>⚠️ Manual</td><td style={articleStyle.td}>✅ Automatic</td></tr>
                        <tr><td style={articleStyle.td}>Grading history</td><td style={articleStyle.td}>⚠️ Basic</td><td style={articleStyle.td}>✅ Full audit trail</td></tr>
                    </tbody>
                </table>
            </div>

            <h2 style={articleStyle.h2}>The Bottom Line</h2>
            <p style={articleStyle.p}>
                For UK-based martial arts clubs, <Link href="/" style={{ color: '#C5A456', fontWeight: '600' }}>ClubForge</Link> offers the best combination of belt tracking, payments, scheduling, and member management at a competitive price point. If you&apos;re running a BJJ academy, MMA gym, or multi-discipline martial arts school, having belt progression built into your management system (rather than tracked separately) saves time and eliminates errors.
            </p>
            <p style={articleStyle.p}>
                <Link href="/get-started" style={{ color: '#C5A456', fontWeight: '600' }}>Start a free 14-day trial →</Link>
            </p>
        </article>
    );
}

export const beltTrackingArticle = {
    content: <ArticleContent />,
    faqs: [
        { question: 'What is the best app to track belt promotions?', answer: 'The best apps for tracking belt promotions in martial arts are ClubForge, Gymdesk, Zen Planner, and Kicksite. ClubForge is particularly strong for UK-based clubs, offering custom belt systems, stripe-level tracking, and instructor feedback alongside integrated payments and scheduling.' },
        { question: 'Can I track BJJ stripes separately from belt promotions?', answer: 'Yes. Apps like ClubForge and Gymdesk track individual stripes as separate progression milestones within each belt level. Each stripe award is logged with date, instructor, and optional notes.' },
        { question: 'Do belt tracking apps support Karate and Taekwondo grading?', answer: 'Yes. Most modern martial arts management platforms, including ClubForge, allow you to define custom belt/rank structures. This means you can set up Karate kyu/dan systems, Taekwondo gup/dan systems, or any other discipline-specific ranking structure.' },
        { question: 'How much does belt tracking software cost?', answer: 'Belt tracking is typically included as part of a broader martial arts management platform. Pricing ranges from £39/month (ClubForge Starter) to $117+/month (Zen Planner). Most platforms offer free trials so you can test before committing.' },
        { question: 'Can students see their own belt progression?', answer: 'Yes. Platforms like ClubForge provide a branded member portal where students can view their current belt rank, full promotion history, instructor feedback from each grading, and attendance records — all from their phone.' },
    ],
};
