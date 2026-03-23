import Link from 'next/link';
import { Award, Users, Calendar, CheckCircle2, CreditCard, ArrowRight, BarChart3, Shield, Swords } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { createClient } from '@/lib/supabase/server';
import { BreadcrumbSchema, FAQPageSchema } from '@/components/structured-data';

export const metadata = {
    title: 'BJJ Gym Management Software — Belt Tracking & Academy Management | ClubForge',
    description: 'Purpose-built software for Brazilian Jiu-Jitsu academies. Track belt and stripe progression, manage class schedules, automate Stripe billing, and run your BJJ gym professionally. From white belt to black belt.',
    alternates: { canonical: 'https://clubforgehq.com/for/bjj' },
    openGraph: {
        title: 'BJJ Gym Management Software — ClubForge',
        description: 'Belt tracking, class scheduling, payments & member portals for BJJ academies.',
        url: 'https://clubforgehq.com/for/bjj',
    },
    keywords: [
        'BJJ gym management software', 'Brazilian jiu-jitsu academy software',
        'BJJ belt tracking software', 'BJJ class scheduling software',
        'jiu-jitsu school management', 'BJJ membership management',
        'BJJ stripe tracking', 'BJJ academy billing software',
        'grappling gym software', 'BJJ student management system',
    ],
};

const faqs = [
    { question: 'Does ClubForge support the full BJJ belt system?', answer: 'Yes. Define the complete BJJ ranking structure — white, blue, purple, brown, and black belts, with four stripe progressions at each level. Kids\' belts (grey, yellow, orange, green) are supported too. You customise the exact structure to match your academy.' },
    { question: 'Can I track stripes separately from belt promotions?', answer: 'Yes. Stripes are tracked as individual progression milestones within each belt level. Coaches can award stripes with notes, and the full stripe-by-stripe history is maintained for each student.' },
    { question: 'How do I manage open mat sessions vs structured classes?', answer: 'Both work seamlessly. Create recurring structured classes (fundamentals, advanced, competition prep) with capacity limits and instructor assignment, and open mat sessions that members simply check into. Different class types, same system.' },
    { question: 'Can I manage multiple programmes (gi, no-gi, kids)?', answer: 'Absolutely. Create different class types for gi, no-gi, kids, competition team, and specialty sessions. Members can be enrolled in specific programmes, and you see attendance per programme — helping you understand which sessions drive engagement.' },
];

export default async function BJJPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    return (
        <>
            <Navbar user={user ? { id: user.id, email: user.email! } : null} />
            <BreadcrumbSchema items={[
                { name: 'Home', url: 'https://clubforgehq.com' },
                { name: 'For BJJ', url: 'https://clubforgehq.com/for/bjj' },
            ]} />
            <FAQPageSchema faqs={faqs} />

            <main>
                <section style={{ background: 'linear-gradient(180deg, #0F172A 0%, #1E293B 100%)', padding: '140px 24px 80px', color: '#FFFFFF', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(197,164,86,0.08) 0%, transparent 70%)', top: '-200px', right: '-100px', pointerEvents: 'none' }} />
                    <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
                        <p style={{ fontSize: '14px', fontWeight: '600', color: '#C5A456', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '16px' }}>
                            🥋 Built For BJJ Academies
                        </p>
                        <h1 style={{ fontSize: 'clamp(2rem, 4.5vw, 3.5rem)', fontWeight: '800', lineHeight: '1.1', marginBottom: '20px' }}>
                            BJJ Academy Software With{' '}
                            <span style={{ background: 'linear-gradient(135deg, #D4B86A, #A88B3D)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                                Real Belt Tracking
                            </span>
                        </h1>
                        <p style={{ fontSize: '1.15rem', color: '#94A3B8', lineHeight: '1.7', marginBottom: '16px', maxWidth: '650px' }}>
                            Stop tracking belts and stripes on paper. ClubForge gives your BJJ academy a professional management system with proper progression tracking — from white belt to black belt, with every stripe recorded, every grading documented, and every promotion audited.
                        </p>
                        <p style={{ fontSize: '0.95rem', color: '#64748B', marginBottom: '32px' }}>
                            Gi, no-gi, kids programmes, competition teams, and open mats — all managed from one dashboard.
                        </p>
                        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                            <Link href="/get-started" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(135deg, #D4B86A, #A88B3D)', color: '#0F172A', padding: '14px 32px', borderRadius: '12px', fontSize: '1rem', fontWeight: '700', textDecoration: 'none' }}>
                                Start Free Trial <ArrowRight size={18} />
                            </Link>
                            <Link href="/demo" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', border: '2px solid rgba(255,255,255,0.2)', color: '#FFFFFF', padding: '14px 32px', borderRadius: '12px', fontSize: '1rem', fontWeight: '600', textDecoration: 'none' }}>Book a Demo</Link>
                        </div>
                    </div>
                </section>

                {/* BJJ-specific features */}
                <section style={{ background: '#FFFFFF', padding: '80px 24px' }}>
                    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                        <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: '800', color: '#0F172A', textAlign: 'center', marginBottom: '48px' }}>
                            Everything your BJJ academy needs
                        </h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                            {[
                                { icon: Award, title: 'Belt & Stripe Progression', desc: 'Full BJJ belt system — white through black, with four stripes per belt. Kids\' belts supported too. Every stripe award and belt promotion is logged with coach name, date, and feedback.' },
                                { icon: Calendar, title: 'Class Types & Scheduling', desc: 'Fundamentals, advanced, no-gi, competition prep, kids classes, and open mats — all on one timetable. Set capacity limits, assign instructors, and let students self-book.' },
                                { icon: Users, title: 'Student & Family Accounts', desc: 'Adults manage their own profiles. Parents manage their kids. Families get one bill. Each person has individual belt tracking, attendance records, and grading history.' },
                                { icon: CheckCircle2, title: 'Mat Time Tracking', desc: 'Know exactly how many sessions each student has attended since their last promotion. When it\'s time for stripe or belt assessments, you have the data to make informed decisions.' },
                                { icon: CreditCard, title: 'Stripe-Powered Billing', desc: 'Monthly memberships via Stripe. Event payments for seminars and competitions. Drop-in rates and promo codes. Revenue dashboards that show you the financial health of your academy.' },
                                { icon: Shield, title: 'Member Portal', desc: 'Students see their belt rank, grading history, coach feedback, class schedule, and attendance streaks — all from their phone. Less WhatsApp messages for you, more engagement for them.' },
                            ].map((item) => (
                                <div key={item.title} style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', padding: '28px', borderRadius: '16px', border: '1px solid #F1F5F9', background: '#FAFBFC' }}>
                                    <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'rgba(197,164,86,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <item.icon size={24} color="#C5A456" />
                                    </div>
                                    <div>
                                        <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0F172A', marginBottom: '8px' }}>{item.title}</h3>
                                        <p style={{ color: '#64748B', margin: 0, lineHeight: '1.7', fontSize: '0.95rem' }}>{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section style={{ background: '#FAFBFC', padding: '80px 24px' }}>
                    <div style={{ maxWidth: '700px', margin: '0 auto' }}>
                        <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: '800', color: '#0F172A', textAlign: 'center', marginBottom: '40px' }}>Frequently Asked Questions</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {faqs.map((faq) => (
                                <div key={faq.question} style={{ padding: '24px', borderRadius: '14px', background: '#FFFFFF', border: '1px solid #F1F5F9' }}>
                                    <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#0F172A', marginBottom: '10px' }}>{faq.question}</h3>
                                    <p style={{ color: '#64748B', margin: 0, fontSize: '0.9rem', lineHeight: '1.7' }}>{faq.answer}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section style={{ background: 'linear-gradient(135deg, #D4B86A 0%, #C5A456 40%, #A88B3D 100%)', padding: '80px 24px', textAlign: 'center' }}>
                    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                        <h2 style={{ color: '#0F172A', fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: '800', marginBottom: '16px' }}>Ready to professionalise your BJJ academy?</h2>
                        <p style={{ color: 'rgba(15,23,42,0.6)', fontSize: '1rem', marginBottom: '32px' }}>14-day free trial. Full belt tracking from day one.</p>
                        <Link href="/get-started" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#0F172A', color: '#FFFFFF', padding: '14px 32px', borderRadius: '12px', fontSize: '1rem', fontWeight: '700', textDecoration: 'none' }}>
                            Start Free Trial <ArrowRight size={18} />
                        </Link>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}
