import Link from 'next/link';
import { Award, Users, Calendar, CheckCircle2, CreditCard, ArrowRight, BarChart3, Shield, Swords, MapPin, Zap, Ticket, Video, TrendingUp, Globe, Building2, Heart, Clock, Star } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { createClient } from '@/lib/supabase/server';
import { BreadcrumbSchema, FAQPageSchema } from '@/components/structured-data';

export const metadata = {
    title: 'Gym Management Software Edinburgh | Martial Arts & BJJ Clubs | ClubForge',
    description: 'ClubForge is the leading gym management software for martial arts clubs in Edinburgh. Purpose-built for BJJ, MMA, Karate & Judo academies across Scotland\'s capital. Manage memberships, Stripe payments, attendance & belt progression. Free 14-day trial.',
    alternates: { canonical: 'https://clubforgehq.com/gym-management-edinburgh' },
    openGraph: { title: 'Gym Management Software Edinburgh | ClubForge', description: 'The all-in-one management platform for martial arts clubs across Edinburgh. Memberships, payments, attendance, belt progression — one system.', url: 'https://clubforgehq.com/gym-management-edinburgh', type: 'website' },
    keywords: ['gym management software Edinburgh', 'martial arts club software Edinburgh', 'BJJ gym software Edinburgh', 'MMA gym management Edinburgh', 'karate dojo software Edinburgh', 'martial arts membership software Edinburgh', 'belt progression tracking Edinburgh', 'Scotland gym management software', 'club management system Edinburgh', 'judo club software Edinburgh'],
};

const faqs = [
    { question: 'What is the best gym management software for martial arts in Edinburgh?', answer: 'ClubForge is purpose-built for martial arts clubs in Edinburgh, offering belt progression tracking, automated Stripe payments, attendance monitoring, class scheduling, and family accounts — all in one platform. Unlike generic gym software like Mindbody or Glofox, ClubForge includes martial arts–specific features out of the box.' },
    { question: 'Can I use ClubForge for a BJJ academy in Edinburgh?', answer: 'Absolutely. ClubForge is designed specifically for BJJ academies, with built-in belt and stripe tracking across all IBJJF ranks, attendance monitoring per class type, and automated Stripe billing. BJJ clubs across Edinburgh use ClubForge.' },
    { question: 'How much does gym management software cost in Edinburgh?', answer: 'ClubForge offers a free tier for new clubs, with paid plans from £39/month for up to 150 members. The Pro plan at £129/month supports up to 750 members and 3 locations. No setup fees, no contracts, and a 14-day free trial.' },
    { question: 'Does ClubForge support multi-location clubs across Edinburgh and Scotland?', answer: 'Yes. ClubForge\'s multi-location support lets you manage members, classes, and payments across Edinburgh, Glasgow, and other Scottish venues from one dashboard.' },
    { question: 'How does ClubForge compare to Zen Planner or Wodify?', answer: 'Zen Planner is designed for US fitness businesses and Wodify for CrossFit boxes. ClubForge is purpose-built for UK martial arts clubs, with native GBP pricing, Stripe integration, and belt progression systems.' },
    { question: 'Can ClubForge handle kids martial arts classes in Edinburgh?', answer: 'Yes. Family accounts let parents manage multiple children from one login. Each child has their own attendance record, belt progression, and class enrolments.' },
    { question: 'Does ClubForge offer attendance tracking?', answer: 'ClubForge provides one-click mobile check-ins with real-time attendance dashboards, retention trend reports, and member engagement metrics.' },
    { question: 'Is ClubForge suitable for small clubs in Edinburgh?', answer: 'ClubForge scales with your club — free tier for new clubs, Starter at £39/month for up to 150 members. No long-term contracts.' },
];

export default async function EdinburghPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const localBusinessSchema = { '@context': 'https://schema.org', '@type': 'SoftwareApplication', name: 'ClubForge — Gym Management Software Edinburgh', description: 'Gym management software for martial arts clubs in Edinburgh, Scotland.', url: 'https://clubforgehq.com/gym-management-edinburgh', applicationCategory: 'BusinessApplication', applicationSubCategory: 'Gym Management Software', operatingSystem: 'Web', areaServed: { '@type': 'City', name: 'Edinburgh', containedInPlace: { '@type': 'Country', name: 'United Kingdom' } }, offers: { '@type': 'AggregateOffer', lowPrice: '0', highPrice: '349', priceCurrency: 'GBP', offerCount: '4', url: 'https://clubforgehq.com/pricing' }, provider: { '@type': 'Organization', name: 'ClubForge', url: 'https://clubforgehq.com' } };

    return (
        <>
            <Navbar user={user ? { id: user.id, email: user.email! } : null} />
            <BreadcrumbSchema items={[{ name: 'Home', url: 'https://clubforgehq.com' }, { name: 'Gym Management Edinburgh', url: 'https://clubforgehq.com/gym-management-edinburgh' }]} />
            <FAQPageSchema faqs={faqs} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }} />

            <main>
                <style>{`@media (max-width: 768px) { .cf-city-features-grid, .cf-city-pain-grid, .cf-city-why-grid, .cf-city-local-grid { grid-template-columns: 1fr !important; } .cf-city-stats-grid { grid-template-columns: 1fr 1fr !important; } }`}</style>

                {/* HERO */}
                <section style={{ background: 'linear-gradient(180deg, #0F172A 0%, #1E293B 100%)', padding: '140px 24px 80px', color: '#FFFFFF', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(197,164,86,0.08) 0%, transparent 70%)', top: '-200px', left: '-100px', pointerEvents: 'none' }} />
                    <div style={{ position: 'absolute', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.05) 0%, transparent 70%)', bottom: '-150px', right: '-80px', pointerEvents: 'none' }} />
                    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.03, backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
                    <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '24px', background: 'rgba(197,164,86,0.12)', padding: '8px 16px', borderRadius: '100px', border: '1px solid rgba(197,164,86,0.2)' }}><MapPin size={14} color="#C5A456" /><span style={{ fontSize: '13px', fontWeight: '600', color: '#C5A456', letterSpacing: '0.03em' }}>Serving martial arts clubs across Edinburgh</span></div>
                        <h1 style={{ fontSize: 'clamp(2rem, 4.5vw, 3.5rem)', fontWeight: '800', lineHeight: '1.1', marginBottom: '20px', color: '#FFFFFF' }}>Gym Management Software for Martial Arts Clubs in{' '}<span style={{ background: 'linear-gradient(135deg, #D4B86A, #A88B3D)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Edinburgh</span></h1>
                        <p style={{ fontSize: '1.15rem', color: '#94A3B8', lineHeight: '1.7', marginBottom: '16px', maxWidth: '650px' }}>Edinburgh is Scotland&apos;s capital and home to a diverse martial arts community with over 70 clubs. ClubForge is the management platform built specifically for them.</p>
                        <p style={{ fontSize: '1rem', color: '#64748B', marginBottom: '16px', maxWidth: '650px', lineHeight: '1.7' }}>Manage memberships, automate Stripe payments, track attendance, and handle belt progression — all from one system designed for BJJ, MMA, Karate, and martial arts academies.</p>
                        <p style={{ fontSize: '0.95rem', color: '#64748B', marginBottom: '32px', maxWidth: '600px', lineHeight: '1.7' }}>No more spreadsheets. Start your free 14-day trial today.</p>
                        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                            <Link href="/demo" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(135deg, #D4B86A, #A88B3D)', color: '#0F172A', padding: '14px 32px', borderRadius: '12px', fontSize: '1rem', fontWeight: '700', textDecoration: 'none', boxShadow: '0 4px 24px rgba(197, 164, 86, 0.35)' }}>Book a Demo <ArrowRight size={18} /></Link>
                            <Link href="/get-started" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', border: '2px solid rgba(255,255,255,0.2)', color: '#FFFFFF', padding: '14px 32px', borderRadius: '12px', fontSize: '1rem', fontWeight: '600', textDecoration: 'none' }}>Start Free Trial</Link>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap', marginTop: '40px', color: '#64748B', fontSize: '13px', fontWeight: '500' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Shield size={15} color="#C5A456" /> Stripe-secured payments</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Swords size={15} color="#C5A456" /> Built for martial arts</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Zap size={15} color="#C5A456" /> Set up in minutes</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Globe size={15} color="#C5A456" /> UK-based, UK pricing</span>
                        </div>
                    </div>
                </section>

                {/* STATS */}
                <section style={{ background: '#FFFFFF', padding: '60px 24px', borderTop: '1px solid #F1F5F9' }}>
                    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                        <div className="cf-city-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
                            {[{ value: '527K+', label: 'Edinburgh population', icon: Users }, { value: '70+', label: 'Martial arts clubs', icon: Swords }, { value: '5.4M', label: 'Scotland population', icon: Building2 }, { value: '£0', label: 'Free tier available', icon: Heart }].map((stat) => (
                                <div key={stat.label} style={{ textAlign: 'center', padding: '24px 16px', borderRadius: '16px', background: '#FAFBFC', border: '1px solid #F1F5F9' }}>
                                    <stat.icon size={24} color="#C5A456" style={{ marginBottom: '12px' }} />
                                    <p style={{ fontSize: '1.8rem', fontWeight: '800', color: '#0F172A', margin: '0 0 4px' }}>{stat.value}</p>
                                    <p style={{ fontSize: '0.85rem', color: '#64748B', margin: 0 }}>{stat.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* EDINBURGH SCENE */}
                <section style={{ background: '#FAFBFC', padding: '80px 24px', borderTop: '1px solid #F1F5F9' }}>
                    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                        <p style={{ fontSize: '14px', fontWeight: '600', color: '#C5A456', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '16px', textAlign: 'center' }}>The Edinburgh Martial Arts Scene</p>
                        <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: '800', color: '#0F172A', textAlign: 'center', marginBottom: '24px', lineHeight: '1.2' }}>Why Edinburgh clubs need specialist management software</h2>
                        <div style={{ color: '#475569', lineHeight: '1.8', fontSize: '1rem' }}>
                            <p style={{ marginBottom: '16px' }}>Edinburgh, Scotland&apos;s historic capital, has a population of over 527,000 and is home to one of the country&apos;s most vibrant martial arts communities. With over 70 clubs teaching BJJ, MMA, Karate, Judo, Taekwondo, Muay Thai, and Krav Maga, the city offers martial arts enthusiasts an impressive range of disciplines and training options.</p>
                            <p style={{ marginBottom: '16px' }}>The city&apos;s large student population — Edinburgh has four major universities — creates a dynamic training environment where clubs serve both long-term community members and rotating student intakes each academic year. This requires flexible membership management, easy onboarding processes, and the ability to handle varied billing cycles.</p>
                            <p style={{ marginBottom: '16px' }}>Edinburgh&apos;s martial arts clubs also benefit from the city&apos;s position as a cultural and tourism hub. Many clubs attract international visitors who want to drop in for training, making online booking and class management essential. At the same time, the Scottish capital&apos;s martial arts scene is increasingly competitive, with new academies opening regularly.</p>
                            <p style={{ marginBottom: '0' }}>ClubForge gives Edinburgh&apos;s martial arts clubs the tools to manage this complexity. From <Link href="/features/payments-billing" style={{ color: '#C5A456', textDecoration: 'none', fontWeight: '600' }}>automated payments</Link> and <Link href="/features/attendance-tracking" style={{ color: '#C5A456', textDecoration: 'none', fontWeight: '600' }}>attendance tracking</Link> to <Link href="/features/belt-progression" style={{ color: '#C5A456', textDecoration: 'none', fontWeight: '600' }}>belt progression</Link> and <Link href="/features/class-scheduling" style={{ color: '#C5A456', textDecoration: 'none', fontWeight: '600' }}>class scheduling</Link> — one platform, purpose-built for martial arts.</p>
                        </div>
                    </div>
                </section>

                {/* FEATURES */}
                <section style={{ background: '#FFFFFF', padding: '80px 24px', borderTop: '1px solid #F1F5F9' }}>
                    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                        <p style={{ fontSize: '14px', fontWeight: '600', color: '#C5A456', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '16px', textAlign: 'center' }}>Features</p>
                        <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: '800', color: '#0F172A', textAlign: 'center', marginBottom: '48px', lineHeight: '1.2' }}>Everything Edinburgh martial arts clubs need</h2>
                        <div className="cf-city-features-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                            {[
                                { icon: CreditCard, title: 'Automated Billing', desc: 'Stripe-powered membership billing with automatic retries and receipts.', link: '/features/payments-billing' },
                                { icon: CheckCircle2, title: 'Mobile Check-ins', desc: 'One-click mobile check-ins from any device with automatic attendance records.', link: '/features/attendance-tracking' },
                                { icon: Award, title: 'Belt Progression', desc: 'Purpose-built belt and rank tracking with full grading history and custom systems.', link: '/features/belt-progression' },
                                { icon: Users, title: 'Member Management', desc: 'Complete member profiles, family accounts, and membership status tracking.', link: '/features/member-management' },
                                { icon: Calendar, title: 'Class Scheduling', desc: 'Live class scheduling with capacity management and recurring timetables.', link: '/features/class-scheduling' },
                                { icon: Ticket, title: 'Events & Gradings', desc: 'Organise gradings, seminars, and competitions with attendance tracking.' },
                                { icon: Video, title: 'Training Content', desc: 'Member portal with training videos and technique libraries.' },
                                { icon: BarChart3, title: 'Analytics & Reports', desc: 'Attendance analytics, retention reports, and revenue dashboards.' },
                            ].map((item) => (
                                <div key={item.title} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', padding: '24px', borderRadius: '16px', border: '1px solid #F1F5F9', background: '#FAFBFC' }}>
                                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(197,164,86,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><item.icon size={22} color="#C5A456" /></div>
                                    <div>
                                        <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#0F172A', marginBottom: '6px' }}>{item.title}</h3>
                                        <p style={{ color: '#64748B', margin: 0, lineHeight: '1.6', fontSize: '0.9rem' }}>{item.desc}</p>
                                        {'link' in item && item.link && <Link href={item.link} style={{ fontSize: '0.85rem', color: '#C5A456', fontWeight: '600', textDecoration: 'none', marginTop: '8px', display: 'inline-block' }}>Learn more →</Link>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* WHY EDINBURGH */}
                <section style={{ background: '#FAFBFC', padding: '80px 24px', borderTop: '1px solid #F1F5F9' }}>
                    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                        <p style={{ fontSize: '14px', fontWeight: '600', color: '#C5A456', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '16px', textAlign: 'center' }}>Why Edinburgh Clubs Choose ClubForge</p>
                        <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: '800', color: '#0F172A', textAlign: 'center', marginBottom: '24px', lineHeight: '1.2' }}>Built for Edinburgh&apos;s unique challenges</h2>
                        <div className="cf-city-local-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginTop: '32px' }}>
                            {[
                                { icon: Users, title: 'Student Population', desc: 'Edinburgh\'s university population means flexible membership types are essential. Handle monthly, termly, and drop-in billing with ease.' },
                                { icon: Building2, title: 'Scotland-Wide Support', desc: 'Manage clubs across Edinburgh, Glasgow, and wider Scotland from one dashboard with multi-location support.' },
                                { icon: Clock, title: 'Save Hours Every Week', desc: 'Automate payments, attendance, and communications. Focus on coaching rather than admin.' },
                                { icon: Star, title: 'Affordable & Scalable', desc: 'Start free, grow at your pace. From £0/month for new clubs to £349/month for large academies. No contracts.' },
                            ].map((item) => (
                                <div key={item.title} style={{ padding: '28px 24px', borderRadius: '16px', background: '#FFFFFF', border: '1px solid #F1F5F9' }}>
                                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(197,164,86,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}><item.icon size={22} color="#C5A456" /></div>
                                    <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#0F172A', marginBottom: '8px' }}>{item.title}</h3>
                                    <p style={{ color: '#64748B', margin: 0, fontSize: '0.9rem', lineHeight: '1.6' }}>{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* VS GENERIC */}
                <section style={{ background: 'linear-gradient(180deg, #0F172A 0%, #1A2332 100%)', padding: '80px 24px', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(197,164,86,0.04) 0%, transparent 50%)', pointerEvents: 'none' }} />
                    <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
                        <p style={{ fontSize: '14px', fontWeight: '600', color: '#C5A456', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '16px', textAlign: 'center' }}>ClubForge vs Generic Software</p>
                        <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: '800', color: '#FFFFFF', textAlign: 'center', marginBottom: '16px', lineHeight: '1.2' }}>Why not Mindbody, Glofox, or Zen Planner?</h2>
                        <p style={{ fontSize: '1rem', color: '#94A3B8', textAlign: 'center', marginBottom: '48px', maxWidth: '650px', margin: '0 auto 48px', lineHeight: '1.7' }}>Generic gym platforms lack belt tracking, grading management, and martial arts–specific workflows.</p>
                        <div className="cf-city-why-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                            {[{ icon: Award, title: 'Belt progression built in', desc: 'Purpose-built rank tracking with grading history.' }, { icon: Zap, title: 'One integrated platform', desc: 'Payments, scheduling, attendance, progression — all connected.' }, { icon: Shield, title: 'UK pricing in GBP', desc: 'No USD conversion. UK-based support for UK clubs.' }].map((item) => (
                                <div key={item.title} style={{ padding: '28px 24px', borderRadius: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' }}>
                                    <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'rgba(197,164,86,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}><item.icon size={24} color="#C5A456" /></div>
                                    <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#FFFFFF', marginBottom: '8px' }}>{item.title}</h3>
                                    <p style={{ color: '#94A3B8', margin: 0, fontSize: '0.9rem', lineHeight: '1.6' }}>{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* DISCIPLINES */}
                <section style={{ background: '#FFFFFF', padding: '80px 24px', borderTop: '1px solid #F1F5F9' }}>
                    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                        <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: '800', color: '#0F172A', textAlign: 'center', marginBottom: '24px', lineHeight: '1.2' }}>Software for every martial art in Edinburgh</h2>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center', marginTop: '24px' }}>
                            {['Brazilian Jiu-Jitsu (BJJ)', 'Mixed Martial Arts (MMA)', 'Karate', 'Judo', 'Taekwondo', 'Muay Thai', 'Kickboxing', 'Boxing', 'Krav Maga', 'Aikido', 'Kung Fu'].map((art) => (<span key={art} style={{ padding: '10px 20px', borderRadius: '100px', background: '#FAFBFC', border: '1px solid #E2E8F0', fontSize: '0.9rem', color: '#334155', fontWeight: '500' }}>{art}</span>))}
                        </div>
                    </div>
                </section>

                {/* FAQ */}
                <section style={{ background: '#FAFBFC', padding: '80px 24px', borderTop: '1px solid #F1F5F9' }}>
                    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                        <p style={{ fontSize: '14px', fontWeight: '600', color: '#C5A456', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '16px', textAlign: 'center' }}>FAQ</p>
                        <h2 style={{ fontSize: 'clamp(1.3rem, 3vw, 1.8rem)', fontWeight: '800', color: '#0F172A', textAlign: 'center', marginBottom: '36px', lineHeight: '1.2' }}>Common questions from Edinburgh martial arts clubs</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {faqs.map((faq, i) => (<details key={i} style={{ border: '1px solid #F1F5F9', borderRadius: '12px', overflow: 'hidden', background: '#FFFFFF' }}><summary style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', cursor: 'pointer', fontSize: '0.95rem', fontWeight: '600', color: '#0F172A', listStyle: 'none' }}>{faq.question}</summary><div style={{ padding: '0 20px 18px', borderTop: '1px solid #F1F5F9', paddingTop: '14px' }}><p style={{ color: '#64748B', margin: 0, lineHeight: '1.7', fontSize: '0.9rem' }}>{faq.answer}</p></div></details>))}
                        </div>
                        <div style={{ textAlign: 'center', marginTop: '24px' }}><Link href="/faq" style={{ color: '#C5A456', fontWeight: '600', fontSize: '0.875rem', textDecoration: 'none' }}>View all FAQs →</Link></div>
                    </div>
                </section>

                {/* CTA */}
                <section style={{ background: 'linear-gradient(135deg, #D4B86A 0%, #C5A456 40%, #A88B3D 100%)', padding: '80px 24px', textAlign: 'center' }}>
                    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '20px', background: 'rgba(15,23,42,0.1)', padding: '8px 16px', borderRadius: '100px' }}><MapPin size={14} color="#0F172A" /><span style={{ fontSize: '13px', fontWeight: '600', color: '#0F172A' }}>Edinburgh</span></div>
                        <h2 style={{ color: '#0F172A', fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: '800', marginBottom: '16px', lineHeight: '1.2' }}>Ready to professionalise your Edinburgh martial arts club?</h2>
                        <p style={{ color: 'rgba(15,23,42,0.6)', fontSize: '1rem', marginBottom: '32px', lineHeight: '1.7' }}>Join clubs across Scotland using ClubForge. 14-day free trial — no card required.</p>
                        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <Link href="/demo" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#0F172A', color: '#FFFFFF', padding: '14px 32px', borderRadius: '12px', fontSize: '1rem', fontWeight: '700', textDecoration: 'none' }}>Book a Demo <ArrowRight size={18} /></Link>
                            <Link href="/get-started" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'transparent', color: '#0F172A', border: '2px solid rgba(15,23,42,0.3)', padding: '14px 32px', borderRadius: '12px', fontSize: '1rem', fontWeight: '600', textDecoration: 'none' }}>Start Free Trial</Link>
                        </div>
                    </div>
                </section>

                {/* INTERNAL LINKS */}
                <section style={{ background: '#FAFBFC', padding: '48px 24px', borderTop: '1px solid #F1F5F9' }}>
                    <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
                        <p style={{ fontSize: '13px', color: '#94A3B8', fontWeight: '500', margin: 0 }}>Also available in other cities</p>
                        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
                            {[{ href: '/martial-arts-software-london', label: 'London' }, { href: '/bjj-gym-software-manchester', label: 'Manchester' }, { href: '/gym-management-birmingham', label: 'Birmingham' }, { href: '/martial-arts-software-leeds', label: 'Leeds' }, { href: '/bjj-gym-software-liverpool', label: 'Liverpool' }, { href: '/martial-arts-software-glasgow', label: 'Glasgow' }, { href: '/martial-arts-software-bristol', label: 'Bristol' }, { href: '/bjj-gym-software-sheffield', label: 'Sheffield' }, { href: '/martial-arts-software-nottingham', label: 'Nottingham' }, { href: '/gym-management-leicester', label: 'Leicester' }, { href: '/martial-arts-software-newcastle', label: 'Newcastle' }].map((city, i) => (<span key={city.href}>{i > 0 && <span style={{ color: '#E2E8F0', marginRight: '16px' }}>·</span>}<Link href={city.href} style={{ fontSize: '14px', color: '#C5A456', fontWeight: '600', textDecoration: 'none' }}>{city.label}</Link></span>))}
                        </div>
                        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '4px' }}>
                            <Link href="/" style={{ fontSize: '13px', color: '#64748B', textDecoration: 'none' }}>Home</Link><span style={{ color: '#E2E8F0' }}>·</span><Link href="/features" style={{ fontSize: '13px', color: '#64748B', textDecoration: 'none' }}>Features</Link><span style={{ color: '#E2E8F0' }}>·</span><Link href="/features/member-management" style={{ fontSize: '13px', color: '#64748B', textDecoration: 'none' }}>Member Management</Link><span style={{ color: '#E2E8F0' }}>·</span><Link href="/features/belt-progression" style={{ fontSize: '13px', color: '#64748B', textDecoration: 'none' }}>Belt Progression</Link><span style={{ color: '#E2E8F0' }}>·</span><Link href="/features/payments-billing" style={{ fontSize: '13px', color: '#64748B', textDecoration: 'none' }}>Payments</Link><span style={{ color: '#E2E8F0' }}>·</span><Link href="/pricing" style={{ fontSize: '13px', color: '#64748B', textDecoration: 'none' }}>Pricing</Link><span style={{ color: '#E2E8F0' }}>·</span><Link href="/blog" style={{ fontSize: '13px', color: '#64748B', textDecoration: 'none' }}>Blog</Link><span style={{ color: '#E2E8F0' }}>·</span><Link href="/demo" style={{ fontSize: '13px', color: '#64748B', textDecoration: 'none' }}>Book a Demo</Link>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}
