import React from 'react';
import Link from 'next/link';

const s = {
    h2: { fontSize: '1.5rem', fontWeight: '800' as const, color: '#0F172A', marginTop: '48px', marginBottom: '16px', lineHeight: '1.3' },
    h3: { fontSize: '1.15rem', fontWeight: '700' as const, color: '#0F172A', marginTop: '32px', marginBottom: '12px' },
    p: { color: '#475569', fontSize: '1rem', lineHeight: '1.8', marginBottom: '16px' },
    li: { color: '#475569', fontSize: '1rem', lineHeight: '1.8', marginBottom: '8px' },
    strong: { color: '#0F172A', fontWeight: '600' as const },
    callout: { background: '#F0F9FF', border: '1px solid #BAE6FD', borderRadius: '12px', padding: '20px 24px', marginBottom: '24px', marginTop: '24px' },
    ctaBox: { background: 'linear-gradient(135deg, rgba(212,184,106,0.1) 0%, rgba(197,164,86,0.08) 100%)', border: '1px solid rgba(197,164,86,0.25)', borderRadius: '12px', padding: '24px', marginBottom: '32px', marginTop: '32px', textAlign: 'center' as const },
    th: { background: '#F8FAFC', padding: '12px 16px', textAlign: 'left' as const, fontWeight: '700', color: '#0F172A', borderBottom: '2px solid #E2E8F0', fontSize: '0.85rem' },
    td: { padding: '12px 16px', borderBottom: '1px solid #F1F5F9', color: '#475569', fontSize: '0.85rem' },
    tocLink: { color: '#475569', fontSize: '0.95rem', lineHeight: '2', textDecoration: 'none' as const, display: 'block' as const },
    tocContainer: { background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '24px 28px', marginBottom: '32px', marginTop: '24px' },
};

function ArticleContent() {
    return (
        <article>
            {/* Introduction */}
            <p style={s.p}>Running a martial arts club in the UK is rewarding — but the admin side can be a nightmare. Between chasing late payments, tracking belt promotions on scrappy spreadsheets, managing class schedules across multiple venues, and staying on top of GDPR requirements, it&apos;s easy to spend more time on paperwork than on the mat.</p>
            <p style={s.p}>That&apos;s where <strong style={s.strong}>martial arts software</strong> comes in. The right platform handles your membership management, billing, attendance, belt progression, and communications — all in one place. But here&apos;s the problem: most martial arts management software is built for the US market. That means USD-only pricing, no GDPR compliance, no UK payment support, and customer service that&apos;s asleep when you need it.</p>
            <p style={s.p}>This guide is the most comprehensive comparison of <strong style={s.strong}>martial arts software in the UK</strong> for 2026. Whether you run a BJJ academy, MMA gym, karate dojo, taekwondo school, judo club, or boxing gym — we&apos;ll cover exactly what you need, how the leading platforms compare, and which one is the best fit for your club.</p>

            {/* Table of Contents */}
            <div style={s.tocContainer}>
                <p style={{ fontSize: '1rem', fontWeight: '700', color: '#0F172A', marginBottom: '12px', marginTop: 0 }}>📋 In This Guide</p>
                <nav>
                    <a href="#what-is-martial-arts-software" style={s.tocLink}>1. What Is Martial Arts Club Management Software?</a>
                    <a href="#what-to-look-for" style={s.tocLink}>2. What to Look For in Martial Arts Software (12 Key Criteria)</a>
                    <a href="#feature-comparison" style={s.tocLink}>3. Feature Comparison: ClubForge vs GymDesk vs Zen Planner vs Glofox vs Mindbody vs Kicksite</a>
                    <a href="#why-uk-clubs-need-uk-software" style={s.tocLink}>4. Why UK Clubs Need UK-Based Software</a>
                    <a href="#belt-rank-tracking" style={s.tocLink}>5. Belt &amp; Rank Progression Tracking — The Feature Most Platforms Get Wrong</a>
                    <a href="#pricing-comparison" style={s.tocLink}>6. Pricing Comparison (2026)</a>
                    <a href="#best-for-your-discipline" style={s.tocLink}>7. Best Software for Your Discipline</a>
                    <a href="#switching-software" style={s.tocLink}>8. How to Switch Software Without Losing Members</a>
                    <a href="#the-verdict" style={s.tocLink}>9. The Verdict: Which Martial Arts Software Should UK Clubs Choose?</a>
                    <a href="#faqs" style={s.tocLink}>10. Frequently Asked Questions</a>
                </nav>
            </div>

            {/* Section 1: What Is Martial Arts Software */}
            <h2 style={s.h2} id="what-is-martial-arts-software">What Is Martial Arts Club Management Software?</h2>
            <p style={s.p}><strong style={s.strong}>Martial arts club management software</strong> is a platform that helps club owners and instructors run their academy digitally. Instead of juggling spreadsheets, WhatsApp groups, paper registers, and bank transfer chasers, everything lives in one system.</p>
            <p style={s.p}>A good martial arts management system typically handles:</p>
            <ul style={{ paddingLeft: '24px', marginBottom: '24px' }}>
                <li style={s.li}><strong style={s.strong}>Membership management</strong> — adding, editing, and organising members with profiles, contact details, emergency contacts, and medical notes</li>
                <li style={s.li}><strong style={s.strong}>Billing and payments</strong> — recurring subscriptions, one-off payments, failed payment recovery, and financial reporting</li>
                <li style={s.li}><strong style={s.strong}>Class scheduling</strong> — creating timetables, managing recurring sessions, and handling capacity limits</li>
                <li style={s.li}><strong style={s.strong}>Attendance tracking</strong> — digital check-ins (QR code, PIN, or manual) with historical reporting</li>
                <li style={s.li}><strong style={s.strong}>Belt and rank progression</strong> — tracking promotions, stripes, grading history, and instructor feedback</li>
                <li style={s.li}><strong style={s.strong}>Communications</strong> — email announcements, SMS notifications, and automated reminders</li>
                <li style={s.li}><strong style={s.strong}>Member self-service portal</strong> — a branded area where members can view schedules, track progress, and manage their account</li>
            </ul>
            <p style={s.p}>The key distinction is between <strong style={s.strong}>generic gym software</strong> and <strong style={s.strong}>martial arts-specific software</strong>. Generic platforms like Mindbody or Glofox are designed for yoga studios, CrossFit boxes, and general fitness gyms. They handle scheduling and payments well, but they don&apos;t understand belt systems, grading workflows, or the way martial arts clubs actually operate.</p>
            <p style={s.p}><strong style={s.strong}>Martial arts gym software</strong> is built around the unique needs of combat sports academies — belt progression is a core feature, not a bolted-on afterthought.</p>

            {/* Section 2: What to Look For */}
            <h2 style={s.h2} id="what-to-look-for">What to Look For in Martial Arts Software (12 Key Criteria)</h2>
            <p style={s.p}>Not all martial arts club software is created equal. Before you commit to a platform, evaluate it against these twelve criteria:</p>

            <h3 style={s.h3}>1. Belt &amp; Rank Progression (Non-Negotiable)</h3>
            <p style={s.p}>This is the single biggest differentiator between generic gym software and proper martial arts software. Can the platform track individual belt levels, stripe awards, dan grades, and kyu ranks? Can instructors add feedback notes to each promotion? Can students view their full grading history in a portal? If the answer to any of these is &quot;no&quot;, it&apos;s not martial arts software — it&apos;s gym software with a martial arts label.</p>

            <h3 style={s.h3}>2. UK Payment Support (GBP, Stripe, Direct Debit)</h3>
            <p style={s.p}>Your members pay in pounds. Your software should bill in pounds. Look for native Stripe UK integration, GBP pricing, and ideally Direct Debit support via GoCardless. US-based platforms often charge in USD, which means your members see fluctuating foreign exchange charges — not a great look for a professional academy.</p>

            <h3 style={s.h3}>3. GDPR Compliance</h3>
            <p style={s.p}>UK clubs must comply with UK GDPR. Your software needs to support right-to-deletion requests, data export (SAR compliance), explicit consent logging, and encrypted data storage. If your provider stores data on US servers without adequate safeguards, you&apos;re potentially in breach.</p>

            <h3 style={s.h3}>4. Class Scheduling &amp; Timetables</h3>
            <p style={s.p}>Can you set up recurring classes across the week? Does it handle one-off events like seminars and gradings? Can you set capacity limits and waiting lists? A good martial arts management system makes scheduling effortless — not another chore.</p>

            <h3 style={s.h3}>5. Attendance Tracking</h3>
            <p style={s.p}>Digital check-ins (via QR code, PIN, or instructor marking) with full historical data. This is especially important for martial arts because attendance directly informs grading decisions. You should be able to see at a glance how many sessions a student has attended since their last belt promotion.</p>

            <h3 style={s.h3}>6. Family &amp; Kids Accounts</h3>
            <p style={s.p}>If you run kids&apos; classes — and most UK martial arts clubs do — parents need to manage multiple children under one login. One consolidated bill, one set of login credentials, full visibility of each child&apos;s attendance and belt progress. Any martial arts membership software worth considering must handle this natively.</p>

            <h3 style={s.h3}>7. Multi-Location Support</h3>
            <p style={s.p}>Growing academies often expand to multiple venues. Can your software handle multiple locations under one account? Can members train across sites? Can you run separate timetables and reporting per location while maintaining one central dashboard?</p>

            <h3 style={s.h3}>8. Member Self-Service Portal</h3>
            <p style={s.p}>Members expect to check schedules, view their belt progression, and manage their payment details from their phone. A branded member portal reduces admin questions (&quot;What belt is my son on?&quot;, &quot;What time is Saturday sparring?&quot;) and makes your club feel professional.</p>

            <h3 style={s.h3}>9. Automated Communications</h3>
            <p style={s.p}>Email announcements, payment reminders, grading invitations, and welcome sequences. The best martial arts club software lets you communicate with members without opening a separate email tool. Bonus points for WhatsApp or SMS integration.</p>

            <h3 style={s.h3}>10. Financial Reporting &amp; Analytics</h3>
            <p style={s.p}>Monthly revenue, failed payment rates, member churn, attendance trends — you should be able to see how your club is performing at a glance. If you&apos;re planning to grow your academy, data-driven decisions beat gut feelings.</p>

            <h3 style={s.h3}>11. Ease of Use &amp; Modern Interface</h3>
            <p style={s.p}>You&apos;re a martial arts instructor, not a software engineer. The platform should be intuitive enough to learn in an afternoon. If the interface looks like it was built in 2008, it probably was — and the user experience will reflect that.</p>

            <h3 style={s.h3}>12. Pricing Transparency</h3>
            <p style={s.p}>No per-member charges, no hidden fees, no forced annual contracts. Look for flat-rate pricing that scales with your club tier, not your headcount. Per-member pricing means your costs increase as you grow — the exact opposite of what you want.</p>

            <div style={s.ctaBox}>
                <p style={{ fontSize: '1rem', fontWeight: '700', color: '#0F172A', marginBottom: '8px', marginTop: 0 }}>Want to see how ClubForge handles all 12 criteria?</p>
                <Link href="/get-started" style={{ color: '#C5A456', fontWeight: '600', fontSize: '1rem' }}>Start a free 14-day trial — no credit card required →</Link>
            </div>

            {/* Section 3: Feature Comparison Table */}
            <h2 style={s.h2} id="feature-comparison">Feature Comparison: UK Martial Arts Software Platforms (2026)</h2>
            <p style={s.p}>We&apos;ve compared the six most popular martial arts and gym management platforms used by UK clubs. This table covers the features that matter most to martial arts club owners.</p>

            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px', fontSize: '0.85rem' }}>
                    <thead>
                        <tr>
                            <th style={s.th}>Feature</th>
                            <th style={{ ...s.th, background: '#FFFBEB' }}>ClubForge</th>
                            <th style={s.th}>GymDesk</th>
                            <th style={s.th}>Zen Planner</th>
                            <th style={s.th}>Glofox</th>
                            <th style={s.th}>Mindbody</th>
                            <th style={s.th}>Kicksite</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr><td style={s.td}><strong style={s.strong}>Built for martial arts</strong></td><td style={{ ...s.td, background: '#FFFEF5' }}>✅ Core focus</td><td style={s.td}>✅ Supported</td><td style={s.td}>✅ Supported</td><td style={s.td}>❌ Generic gym</td><td style={s.td}>❌ Generic gym</td><td style={s.td}>✅ Core focus</td></tr>
                        <tr><td style={s.td}><strong style={s.strong}>Belt/rank progression</strong></td><td style={{ ...s.td, background: '#FFFEF5' }}>✅ Full (stripes, feedback)</td><td style={s.td}>⚠️ Basic</td><td style={s.td}>✅ Good</td><td style={s.td}>❌ None</td><td style={s.td}>❌ None</td><td style={s.td}>✅ Good</td></tr>
                        <tr><td style={s.td}><strong style={s.strong}>Custom belt systems</strong></td><td style={{ ...s.td, background: '#FFFEF5' }}>✅ Any discipline</td><td style={s.td}>✅</td><td style={s.td}>✅</td><td style={s.td}>❌</td><td style={s.td}>❌</td><td style={s.td}>⚠️ Limited</td></tr>
                        <tr><td style={s.td}><strong style={s.strong}>Instructor grading feedback</strong></td><td style={{ ...s.td, background: '#FFFEF5' }}>✅ Detailed notes</td><td style={s.td}>⚠️ Basic</td><td style={s.td}>⚠️ Limited</td><td style={s.td}>❌</td><td style={s.td}>❌</td><td style={s.td}>❌</td></tr>
                        <tr><td style={s.td}><strong style={s.strong}>UK payment support (GBP)</strong></td><td style={{ ...s.td, background: '#FFFEF5' }}>✅ Stripe UK</td><td style={s.td}>❌ USD only</td><td style={s.td}>❌ USD only</td><td style={s.td}>✅ Multi-currency</td><td style={s.td}>✅ Multi-currency</td><td style={s.td}>❌ USD only</td></tr>
                        <tr><td style={s.td}><strong style={s.strong}>GDPR compliant</strong></td><td style={{ ...s.td, background: '#FFFEF5' }}>✅ Full UK GDPR</td><td style={s.td}>⚠️ Unclear</td><td style={s.td}>⚠️ Unclear</td><td style={s.td}>✅</td><td style={s.td}>✅</td><td style={s.td}>⚠️ Unclear</td></tr>
                        <tr><td style={s.td}><strong style={s.strong}>Family/kids accounts</strong></td><td style={{ ...s.td, background: '#FFFEF5' }}>✅</td><td style={s.td}>✅</td><td style={s.td}>✅</td><td style={s.td}>⚠️ Limited</td><td style={s.td}>✅</td><td style={s.td}>✅</td></tr>
                        <tr><td style={s.td}><strong style={s.strong}>Multi-location</strong></td><td style={{ ...s.td, background: '#FFFEF5' }}>✅ Up to unlimited</td><td style={s.td}>⚠️ Limited</td><td style={s.td}>✅</td><td style={s.td}>✅</td><td style={s.td}>✅</td><td style={s.td}>❌</td></tr>
                        <tr><td style={s.td}><strong style={s.strong}>Member portal</strong></td><td style={{ ...s.td, background: '#FFFEF5' }}>✅ Branded</td><td style={s.td}>✅</td><td style={s.td}>✅</td><td style={s.td}>✅ App</td><td style={s.td}>✅ App</td><td style={s.td}>✅</td></tr>
                        <tr><td style={s.td}><strong style={s.strong}>Attendance tracking</strong></td><td style={{ ...s.td, background: '#FFFEF5' }}>✅</td><td style={s.td}>✅</td><td style={s.td}>✅</td><td style={s.td}>✅</td><td style={s.td}>✅</td><td style={s.td}>✅</td></tr>
                        <tr><td style={s.td}><strong style={s.strong}>Class scheduling</strong></td><td style={{ ...s.td, background: '#FFFEF5' }}>✅</td><td style={s.td}>✅</td><td style={s.td}>✅</td><td style={s.td}>✅</td><td style={s.td}>✅</td><td style={s.td}>✅</td></tr>
                        <tr><td style={s.td}><strong style={s.strong}>Automated communications</strong></td><td style={{ ...s.td, background: '#FFFEF5' }}>✅ Email + in-app</td><td style={s.td}>✅</td><td style={s.td}>✅</td><td style={s.td}>✅</td><td style={s.td}>✅</td><td style={s.td}>⚠️ Basic</td></tr>
                        <tr><td style={s.td}><strong style={s.strong}>Per-member pricing</strong></td><td style={{ ...s.td, background: '#FFFEF5' }}>❌ Flat rate</td><td style={s.td}>❌ Flat rate</td><td style={s.td}>❌ Flat rate</td><td style={s.td}>✅ Extra cost</td><td style={s.td}>✅ Extra cost</td><td style={s.td}>❌ Flat rate</td></tr>
                        <tr><td style={s.td}><strong style={s.strong}>UK support hours</strong></td><td style={{ ...s.td, background: '#FFFEF5' }}>✅ UK timezone</td><td style={s.td}>❌ US timezone</td><td style={s.td}>❌ US timezone</td><td style={s.td}>✅ EU hours</td><td style={s.td}>⚠️ Limited</td><td style={s.td}>❌ US timezone</td></tr>
                        <tr style={{ fontWeight: 600 }}><td style={s.td}><strong style={s.strong}>Starting price</strong></td><td style={{ ...s.td, background: '#FFFEF5' }}><strong>£39/mo</strong></td><td style={s.td}>$99/mo</td><td style={s.td}>$117/mo</td><td style={s.td}>Quote-based</td><td style={s.td}>$139/mo</td><td style={s.td}>$59/mo</td></tr>
                    </tbody>
                </table>
            </div>

            <div style={s.callout}>
                <p style={{ ...s.p, marginBottom: 0, color: '#0369A1' }}><strong>Key takeaway:</strong> ClubForge is the only platform that combines martial arts-specific features (belt progression, instructor feedback, custom grading systems) with native UK support (GBP pricing, Stripe UK, full GDPR compliance, UK timezone customer service).</p>
            </div>

            {/* Section 4: Why UK Clubs Need UK Software */}
            <h2 style={s.h2} id="why-uk-clubs-need-uk-software">Why UK Clubs Need UK-Based Software</h2>
            <p style={s.p}>This might seem like a minor point until you actually experience the pain of using US-focused software as a UK martial arts club. Here&apos;s why it matters more than you think:</p>

            <h3 style={s.h3}>GDPR Compliance Is Non-Negotiable</h3>
            <p style={s.p}>Since the UK left the EU, UK GDPR (the Data Protection Act 2018 alongside the retained EU GDPR) applies to every martial arts club in the country. If you&apos;re storing member data — names, email addresses, phone numbers, medical conditions, children&apos;s information — you <em>must</em> be compliant.</p>
            <p style={s.p}>This means your martial arts club software needs to support:</p>
            <ul style={{ paddingLeft: '24px', marginBottom: '24px' }}>
                <li style={s.li}><strong style={s.strong}>Right to erasure</strong> — members must be able to request full deletion of their data</li>
                <li style={s.li}><strong style={s.strong}>Data export (Subject Access Requests)</strong> — you must be able to export all data held about a member</li>
                <li style={s.li}><strong style={s.strong}>Explicit consent</strong> — proper consent logging for marketing communications and data processing</li>
                <li style={s.li}><strong style={s.strong}>Data encryption</strong> — member data should be encrypted at rest and in transit</li>
                <li style={s.li}><strong style={s.strong}>Data residency awareness</strong> — understand where your data is stored and whether it crosses jurisdictions</li>
            </ul>
            <p style={s.p}>Many US-based martial arts management platforms — including GymDesk, Kicksite, and Zen Planner — don&apos;t explicitly guarantee GDPR compliance. If the ICO comes knocking, &quot;our software is American&quot; is not a valid defence.</p>

            <h3 style={s.h3}>£ Pricing and UK Payment Methods</h3>
            <p style={s.p}>Your members expect to see prices in pounds sterling. When a US platform charges you $99/month, the actual cost fluctuates with exchange rates — one month it&apos;s £78, the next it&apos;s £82. And if the platform only supports USD billing for your members, they&apos;ll see foreign transaction charges on their bank statements. Not exactly the professional experience you want to create.</p>
            <p style={s.p}><strong style={s.strong}>Stripe UK</strong> is the gold standard for UK martial arts club payments. It supports GBP natively, handles recurring subscriptions, and provides instant payouts to UK bank accounts. <Link href="/" style={{ color: '#C5A456', fontWeight: '600' }}>ClubForge</Link> is built on Stripe UK from the ground up — your members pay in pounds, you receive pounds, and there are zero foreign exchange complications.</p>

            <h3 style={s.h3}>UK Support Hours</h3>
            <p style={s.p}>When your payment system goes down at 6pm on a Tuesday evening and you have 40 members arriving for the 7pm class, you need support <em>now</em> — not at 2am when the US support team wakes up. UK-based software means support in your timezone, from people who understand how UK martial arts clubs operate.</p>

            <h3 style={s.h3}>Understanding the UK Martial Arts Landscape</h3>
            <p style={s.p}>UK clubs operate differently from US gyms. Many UK clubs use leisure centre venues rather than owning dedicated spaces. Kids&apos; classes are a massive revenue driver. The grading system traditions (especially in karate and judo) have strong roots in the UK martial arts community. A UK-based platform understands these nuances because it&apos;s built by people who live them.</p>

            <div style={s.ctaBox}>
                <p style={{ fontSize: '1rem', fontWeight: '700', color: '#0F172A', marginBottom: '8px', marginTop: 0 }}>Built in the UK, for UK martial arts clubs</p>
                <p style={{ ...s.p, marginBottom: '12px', fontSize: '0.9rem' }}>ClubForge is the only martial arts management platform built specifically for the UK market — GBP pricing, GDPR compliant, Stripe UK powered.</p>
                <Link href="/get-started" style={{ color: '#C5A456', fontWeight: '600', fontSize: '1rem' }}>Try ClubForge free for 14 days →</Link>
            </div>

            {/* Section 5: Belt & Rank Tracking */}
            <h2 style={s.h2} id="belt-rank-tracking">Belt &amp; Rank Progression Tracking — The Feature Most Platforms Get Wrong</h2>
            <p style={s.p}>Belt progression is the heartbeat of every martial arts club. It&apos;s what keeps students motivated, what parents care most about for their children, and what defines the structure of your academy. Yet most <strong style={s.strong}>martial arts club management software</strong> treats it as an afterthought.</p>
            <p style={s.p}>Here&apos;s what proper belt tracking should include:</p>

            <h3 style={s.h3}>Custom Belt Systems for Every Discipline</h3>
            <p style={s.p}>BJJ uses white → blue → purple → brown → black with four stripes per belt. Karate uses a kyu/dan system (often white → yellow → orange → green → blue → brown → black, then dan grades). Taekwondo, judo, kickboxing, and kung fu all have their own structures. Kids&apos; belt systems often differ from adults (grey, yellow, orange belts in kids&apos; BJJ, for example).</p>
            <p style={s.p}>Your software must let you define <strong style={s.strong}>any custom belt structure</strong> — not force you into a one-size-fits-all template.</p>

            <h3 style={s.h3}>Stripe-Level Tracking</h3>
            <p style={s.p}>In BJJ and many other disciplines, stripes are awarded between belt promotions as progress milestones. Each stripe should be a trackable event with its own date, instructor, and optional notes — not just a number in a dropdown menu.</p>

            <h3 style={s.h3}>Instructor Feedback on Promotions</h3>
            <p style={s.p}>When you promote a student, you should be able to record <em>why</em>. What areas are they excelling in? What do they need to work on next? This feedback is visible to students in their portal, creating transparency and motivation. It also creates a professional record that protects you if promotion decisions are ever questioned.</p>

            <h3 style={s.h3}>Attendance-Linked Grading Decisions</h3>
            <p style={s.p}>How many sessions has this student attended since their last promotion? The answer should be one click away, not a manual spreadsheet count. The best martial arts software links attendance data directly to belt progression, so when grading time comes, you have objective data to support every decision.</p>

            <h3 style={s.h3}>Student-Facing Progression Portal</h3>
            <p style={s.p}>Students and parents should be able to log in and see their complete belt journey — every promotion, every stripe, every piece of instructor feedback, from day one. This isn&apos;t just a nice-to-have; it&apos;s a retention tool. When students can <em>see</em> their progress, they stay engaged longer.</p>

            <div style={s.callout}>
                <p style={{ ...s.p, marginBottom: 0, color: '#0369A1' }}><strong>ClubForge&apos;s belt tracking</strong> includes all of the above: custom belt systems for any discipline, individual stripe tracking, detailed instructor feedback, attendance-linked grading data, and a student-facing progression portal. It was designed from day one around the martial arts grading workflow — not bolted on to a generic gym platform. <Link href="/features" style={{ color: '#0369A1', fontWeight: '600' }}>See how it works →</Link></p>
            </div>

            {/* Section 6: Pricing Comparison */}
            <h2 style={s.h2} id="pricing-comparison">Pricing Comparison: Martial Arts Software in the UK (2026)</h2>
            <p style={s.p}>Pricing is one of the biggest factors when choosing <strong style={s.strong}>martial arts club software</strong>. Here&apos;s how the major platforms compare — with UK pricing where available.</p>

            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px', fontSize: '0.85rem' }}>
                    <thead>
                        <tr>
                            <th style={s.th}>Platform</th>
                            <th style={s.th}>Starting Price</th>
                            <th style={s.th}>Currency</th>
                            <th style={s.th}>Member Limit</th>
                            <th style={s.th}>Per-Member Fees?</th>
                            <th style={s.th}>Free Trial</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr style={{ background: '#FFFEF5' }}><td style={s.td}><strong style={s.strong}>ClubForge Starter</strong></td><td style={s.td}><strong>£39/mo</strong></td><td style={s.td}>GBP</td><td style={s.td}>150 members</td><td style={s.td}>❌ No</td><td style={s.td}>✅ 14 days</td></tr>
                        <tr style={{ background: '#FFFEF5' }}><td style={s.td}><strong style={s.strong}>ClubForge Pro</strong></td><td style={s.td}><strong>£129/mo</strong></td><td style={s.td}>GBP</td><td style={s.td}>750 members</td><td style={s.td}>❌ No</td><td style={s.td}>✅ 14 days</td></tr>
                        <tr style={{ background: '#FFFEF5' }}><td style={s.td}><strong style={s.strong}>ClubForge Elite</strong></td><td style={s.td}><strong>£349/mo</strong></td><td style={s.td}>GBP</td><td style={s.td}>Unlimited</td><td style={s.td}>❌ No</td><td style={s.td}>✅ 14 days</td></tr>
                        <tr><td style={s.td}>GymDesk</td><td style={s.td}>$99/mo (≈£78)</td><td style={s.td}>USD</td><td style={s.td}>Varies</td><td style={s.td}>❌ No</td><td style={s.td}>✅ 30 days</td></tr>
                        <tr><td style={s.td}>Zen Planner</td><td style={s.td}>$117/mo (≈£92)</td><td style={s.td}>USD</td><td style={s.td}>Varies</td><td style={s.td}>❌ No</td><td style={s.td}>✅</td></tr>
                        <tr><td style={s.td}>Glofox</td><td style={s.td}>Quote-based</td><td style={s.td}>Multi</td><td style={s.td}>Varies</td><td style={s.td}>⚠️ Depends on plan</td><td style={s.td}>✅ Demo</td></tr>
                        <tr><td style={s.td}>Mindbody</td><td style={s.td}>$139/mo (≈£110)</td><td style={s.td}>USD</td><td style={s.td}>Varies</td><td style={s.td}>✅ Yes</td><td style={s.td}>✅</td></tr>
                        <tr><td style={s.td}>Kicksite</td><td style={s.td}>$59/mo (≈£47)</td><td style={s.td}>USD</td><td style={s.td}>Varies</td><td style={s.td}>❌ No</td><td style={s.td}>✅ 14 days</td></tr>
                    </tbody>
                </table>
            </div>

            <p style={s.p}><strong style={s.strong}>Important note on pricing:</strong> USD prices are approximate GBP conversions and will fluctuate with exchange rates. With US-based platforms, your actual monthly cost in pounds is unpredictable. ClubForge&apos;s pricing is fixed in GBP — £39, £129, or £349 per month, every month.</p>
            <p style={s.p}>Also watch out for hidden costs. Some platforms charge extra for features like automated emails, custom branding, API access, or additional staff logins. With ClubForge, all features are included at every tier — the only difference is usage limits (members, locations, events).</p>

            {/* Section 7: Best for Your Discipline */}
            <h2 style={s.h2} id="best-for-your-discipline">Best Martial Arts Software for Your Discipline</h2>
            <p style={s.p}>Different martial arts have different management needs. Here&apos;s our recommendation by discipline:</p>

            <h3 style={s.h3}>BJJ Academies</h3>
            <p style={s.p}><strong style={s.strong}>Best choice: ClubForge.</strong> BJJ has the most complex belt system (belts + stripes + kids&apos; belts), relies heavily on attendance data for grading decisions, and often operates multi-location academies. ClubForge handles all of this natively. GymDesk is a reasonable US-based alternative if you don&apos;t need UK payment support.</p>

            <h3 style={s.h3}>Karate Clubs &amp; Dojos</h3>
            <p style={s.p}><strong style={s.strong}>Best choice: ClubForge.</strong> Karate club software needs to handle kyu/dan grading systems, kids&apos; classes (often the majority of members), and family billing. Many UK karate clubs also run multiple sessions across different community venues — multi-location support is essential.</p>

            <h3 style={s.h3}>MMA &amp; Kickboxing Gyms</h3>
            <p style={s.p}><strong style={s.strong}>Best choice: ClubForge.</strong> MMA gyms often run multiple disciplines under one roof — striking, grappling, wrestling, MMA. You need software that supports multiple belt/rank systems simultaneously and lets members attend classes across disciplines. If you don&apos;t need belt tracking at all and are purely a striking gym, Glofox is an alternative (but significantly more expensive).</p>

            <h3 style={s.h3}>Boxing Gyms</h3>
            <p style={s.p}><strong style={s.strong}>Best choice: ClubForge or Glofox.</strong> Boxing gym software needs strong scheduling, attendance tracking, and membership management — but typically doesn&apos;t require belt progression. ClubForge still works well for boxing gyms (the belt feature is optional), and its UK pricing and GDPR compliance make it the better value choice over US-based alternatives.</p>

            <h3 style={s.h3}>Judo &amp; Taekwondo Clubs</h3>
            <p style={s.p}><strong style={s.strong}>Best choice: ClubForge.</strong> Both disciplines have structured grading systems that benefit from proper belt tracking software. Judo&apos;s mon/kyu/dan system and Taekwondo&apos;s gup/dan system are fully supported with custom belt definitions.</p>

            {/* Section 8: Switching Software */}
            <h2 style={s.h2} id="switching-software">How to Switch Martial Arts Software Without Losing Members</h2>
            <p style={s.p}>If you&apos;re already using a platform (or cobbling things together with spreadsheets and WhatsApp), switching to new <strong style={s.strong}>martial arts club management software</strong> can feel daunting. Here&apos;s a practical migration plan:</p>
            <ul style={{ paddingLeft: '24px', marginBottom: '24px' }}>
                <li style={s.li}><strong style={s.strong}>Export your current data</strong> — Download your member list, payment records, and any belt/rank data from your existing system. Most platforms allow CSV export.</li>
                <li style={s.li}><strong style={s.strong}>Set up your new platform in parallel</strong> — Don&apos;t cancel your old system immediately. Run both systems side-by-side for 2–4 weeks.</li>
                <li style={s.li}><strong style={s.strong}>Import members</strong> — Upload your member data to the new platform. ClubForge supports bulk CSV import for members, belt ranks, and payment plans.</li>
                <li style={s.li}><strong style={s.strong}>Migrate payments gradually</strong> — Set up new recurring payments on the new platform for new members first. Then migrate existing members in batches.</li>
                <li style={s.li}><strong style={s.strong}>Communicate clearly</strong> — Send a clear email to all members explaining the switch, what changes for them (login details, payment method), and why it&apos;s happening.</li>
                <li style={s.li}><strong style={s.strong}>Go live and cut over</strong> — Once all members are migrated, cancel your old platform.</li>
            </ul>

            <div style={s.callout}>
                <p style={{ ...s.p, marginBottom: 0, color: '#0369A1' }}><strong>Need help switching?</strong> ClubForge offers free migration support for clubs switching from other platforms. We&apos;ll help you import your member data, set up your belt systems, and get payments running — at no extra cost. <Link href="/get-started" style={{ color: '#0369A1', fontWeight: '600' }}>Start your free trial →</Link></p>
            </div>

            {/* Section 9: The Verdict */}
            <h2 style={s.h2} id="the-verdict">The Verdict: Which Martial Arts Software Should UK Clubs Choose?</h2>
            <p style={s.p}>After comparing features, pricing, UK-specific requirements, and belt tracking capabilities, here&apos;s our honest assessment:</p>

            <p style={s.p}><strong style={s.strong}>For UK martial arts clubs that want a purpose-built solution:</strong> <Link href="/" style={{ color: '#C5A456', fontWeight: '600' }}>ClubForge</Link> is the clear winner. It&apos;s the only platform that combines martial arts-specific features (belt progression with stripe tracking and instructor feedback), native UK support (GBP pricing, Stripe UK, full GDPR compliance), and competitive flat-rate pricing (from £39/month). It was built specifically for martial arts — not retrofitted from a generic gym platform.</p>

            <p style={s.p}><strong style={s.strong}>For clubs that don&apos;t need belt tracking:</strong> If you run a pure boxing or general fitness operation, Glofox is a solid (if expensive) alternative with good UK payment support. However, you&apos;ll be paying significantly more for fewer martial arts-specific features.</p>

            <p style={s.p}><strong style={s.strong}>For budget-conscious clubs just starting out:</strong> ClubForge&apos;s Starter plan at £39/month covers up to 150 members with full features — that&apos;s less than a single extra student&apos;s monthly fee. If you&apos;re still running your club on spreadsheets and WhatsApp, the switch to proper <strong style={s.strong}>martial arts management software</strong> is one of the highest-ROI decisions you can make.</p>

            <p style={s.p}><strong style={s.strong}>For large, multi-location academies:</strong> ClubForge&apos;s Pro (£129/month, up to 3 locations) and Elite (£349/month, unlimited locations) plans scale with you. Zen Planner is a functional alternative but costs significantly more in practice once you factor in USD billing and missing UK-specific features.</p>

            <div style={s.ctaBox}>
                <p style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0F172A', marginBottom: '8px', marginTop: 0 }}>Ready to run your club properly?</p>
                <p style={{ ...s.p, marginBottom: '16px', fontSize: '0.95rem' }}>Join hundreds of UK martial arts clubs using ClubForge to manage members, track belts, and automate payments.</p>
                <Link href="/get-started" style={{ display: 'inline-block', background: '#0F172A', color: '#FFFFFF', padding: '14px 32px', borderRadius: '12px', fontSize: '1rem', fontWeight: '700', textDecoration: 'none' }}>Start Your Free 14-Day Trial →</Link>
                <p style={{ ...s.p, marginTop: '12px', marginBottom: 0, fontSize: '0.85rem', color: '#64748B' }}>No credit card required. Set up in under 10 minutes.</p>
            </div>

        </article>
    );
}

export const martialArtsSoftwareUKArticle = {
    content: <ArticleContent />,
    faqs: [
        {
            question: 'What is the best martial arts software in the UK?',
            answer: 'ClubForge is the best martial arts software for UK clubs. It\'s the only platform built specifically for UK martial arts academies, with native GBP pricing (from £39/month), full GDPR compliance, Stripe UK payments, built-in belt progression tracking with instructor feedback, multi-location support, and UK timezone customer service. Other options include GymDesk and Kicksite (both US-based, USD pricing) and Glofox (generic gym software without belt tracking).',
        },
        {
            question: 'Do I need martial arts-specific software or can I use generic gym software?',
            answer: 'Generic gym software like Mindbody or Glofox handles basic scheduling and payments, but lacks the martial arts-specific features that define your club — belt progression, stripe tracking, grading history, instructor feedback, and custom rank systems. If you run a martial arts club, you\'ll get far more value from purpose-built software like ClubForge that understands the martial arts grading workflow natively.',
        },
        {
            question: 'How much does martial arts club management software cost in the UK?',
            answer: 'UK pricing ranges from £39/month (ClubForge Starter, up to 150 members) to £349/month (ClubForge Elite, unlimited members and locations). US-based platforms like GymDesk ($99/mo), Zen Planner ($117/mo), and Mindbody ($139/mo) charge in USD, so your actual GBP cost fluctuates with exchange rates. Glofox is quote-based. Most platforms offer 14-day free trials.',
        },
        {
            question: 'Is ClubForge GDPR compliant?',
            answer: 'Yes. ClubForge is built in the UK and fully complies with UK GDPR (Data Protection Act 2018). Member data is encrypted at rest and in transit, tenant-isolated with row-level security, and members can export or delete their data at any time. ClubForge supports right-to-erasure requests, Subject Access Requests (SARs), and explicit consent logging.',
        },
        {
            question: 'Can I track belt promotions and stripes with martial arts software?',
            answer: 'Yes — but the depth varies significantly between platforms. ClubForge offers the most comprehensive belt tracking: custom belt systems for any discipline (BJJ, Karate, Taekwondo, Judo, etc.), individual stripe tracking, detailed instructor feedback on each promotion, attendance-linked grading data, and a student-facing portal showing full progression history. Platforms like GymDesk and Kicksite offer basic belt tracking, while generic platforms like Mindbody and Glofox don\'t support it at all.',
        },
        {
            question: 'What is the best karate club software in the UK?',
            answer: 'ClubForge is the best software for UK karate clubs. It supports the full kyu/dan grading system with custom belt definitions, handles kids\' classes with family accounts and consolidated billing, supports multi-venue operations (common for UK karate clubs that use community halls), and bills in GBP with full GDPR compliance.',
        },
        {
            question: 'Can martial arts software handle multiple locations?',
            answer: 'Some platforms do, but not all. ClubForge supports multiple locations on its Pro plan (up to 3 locations) and Elite plan (unlimited locations). Members can train across sites, and you get separate timetables and reporting per location with one central dashboard. GymDesk offers limited multi-location support, while Kicksite doesn\'t support it at all.',
        },
        {
            question: 'How do I switch from spreadsheets to martial arts club software?',
            answer: 'Start by exporting your current member data to a CSV file. Sign up for a free trial of ClubForge, import your members using the bulk CSV import tool, set up your class timetable and belt systems, then migrate payments gradually. Run both systems in parallel for 2-4 weeks before fully cutting over. ClubForge offers free migration support to help you switch smoothly.',
        },
        {
            question: 'Does martial arts software work for boxing gyms?',
            answer: 'Yes. While boxing gyms don\'t typically need belt progression tracking, they benefit from all the other features of martial arts club management software — membership management, class scheduling, attendance tracking, automated billing, and member portals. ClubForge works well for boxing gyms (the belt feature is simply optional), and its UK pricing and GDPR compliance make it the best value choice over US-based alternatives.',
        },
        {
            question: 'What payment methods does ClubForge support?',
            answer: 'ClubForge is powered by Stripe UK, supporting all major credit and debit cards in GBP. It handles recurring subscriptions, one-off payments, and automated failed payment recovery. Members pay in pounds sterling with no foreign exchange fees — unlike US-based platforms that bill in USD.',
        },
    ],
};
