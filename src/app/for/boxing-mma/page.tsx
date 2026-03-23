import Link from 'next/link';
import { Award, Users, Calendar, CheckCircle2, CreditCard, ArrowRight, BarChart3, Zap, Dumbbell } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { createClient } from '@/lib/supabase/server';
import { BreadcrumbSchema, FAQPageSchema } from '@/components/structured-data';

export const metadata = {
    title: 'Boxing & MMA Gym Management Software | ClubForge',
    description: 'Gym management software for boxing clubs, MMA gyms, kickboxing, and Muay Thai. Class scheduling, member management, Stripe payments, attendance tracking, and multi-location support. Start your 14-day free trial.',
    alternates: { canonical: 'https://clubforgehq.com/for/boxing-mma' },
    openGraph: {
        title: 'Boxing & MMA Gym Management Software — ClubForge',
        description: 'Class scheduling, member management, payments & attendance for combat sports gyms.',
        url: 'https://clubforgehq.com/for/boxing-mma',
    },
    keywords: [
        'boxing gym software', 'MMA gym management software', 'boxing gym management system',
        'kickboxing gym software', 'Muay Thai gym management', 'combat sports gym software',
        'boxing club management', 'MMA academy software', 'boxing gym billing software',
        'fight gym management system',
    ],
};

const faqs = [
    { question: 'Is ClubForge suitable for boxing-only gyms?', answer: 'Absolutely. While ClubForge has deep martial arts features like belt tracking, boxing gyms benefit equally from member management, class scheduling, automated Stripe billing, attendance tracking, and the self-service member portal. Use only the features you need.' },
    { question: 'Can I manage different class types (pad work, sparring, conditioning)?', answer: 'Yes. Create distinct class types with their own capacity limits, instructors, and schedules. Run pad work sessions, sparring classes, conditioning, and beginner sessions all within the same timetable.' },
    { question: 'Does it handle drop-in payments?', answer: 'Yes. Besides recurring memberships, ClubForge supports one-off payments for drop-in sessions, seminars, and events via Stripe. Everything appears in your unified revenue dashboard.' },
    { question: 'Can I manage fight team members separately?', answer: 'Yes. Use membership tiers or tags to segment your fight team from general members. This lets you run competition-team-only sessions, track fight team attendance, and manage their memberships distinctly.' },
];

export default async function BoxingMMAPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    return (
        <>
            <Navbar user={user ? { id: user.id, email: user.email! } : null} />
            <BreadcrumbSchema items={[
                { name: 'Home', url: 'https://clubforgehq.com' },
                { name: 'For Boxing & MMA', url: 'https://clubforgehq.com/for/boxing-mma' },
            ]} />
            <FAQPageSchema faqs={faqs} />

            <main>
                <section style={{ background: 'linear-gradient(180deg, #0F172A 0%, #1E293B 100%)', padding: '140px 24px 80px', color: '#FFFFFF', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(239,68,68,0.06) 0%, transparent 70%)', top: '-200px', right: '-100px', pointerEvents: 'none' }} />
                    <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
                        <p style={{ fontSize: '14px', fontWeight: '600', color: '#C5A456', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '16px' }}>
                            🥊 Built For Combat Sports
                        </p>
                        <h1 style={{ fontSize: 'clamp(2rem, 4.5vw, 3.5rem)', fontWeight: '800', lineHeight: '1.1', marginBottom: '20px' }}>
                            Boxing & MMA Gym Software{' '}
                            <span style={{ background: 'linear-gradient(135deg, #D4B86A, #A88B3D)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                                That Hits Different
                            </span>
                        </h1>
                        <p style={{ fontSize: '1.15rem', color: '#94A3B8', lineHeight: '1.7', marginBottom: '16px', maxWidth: '650px' }}>
                            Run your boxing gym, MMA academy, or kickboxing club with a system that handles scheduling, member management, Stripe payments, and attendance — so you can focus on training fighters and building your community.
                        </p>
                        <p style={{ fontSize: '0.95rem', color: '#64748B', marginBottom: '32px' }}>
                            Boxing, MMA, kickboxing, Muay Thai, and all combat sports.
                        </p>
                        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                            <Link href="/get-started" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(135deg, #D4B86A, #A88B3D)', color: '#0F172A', padding: '14px 32px', borderRadius: '12px', fontSize: '1rem', fontWeight: '700', textDecoration: 'none' }}>
                                Start Free Trial <ArrowRight size={18} />
                            </Link>
                            <Link href="/demo" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', border: '2px solid rgba(255,255,255,0.2)', color: '#FFFFFF', padding: '14px 32px', borderRadius: '12px', fontSize: '1rem', fontWeight: '600', textDecoration: 'none' }}>Book a Demo</Link>
                        </div>
                    </div>
                </section>

                <section style={{ background: '#FFFFFF', padding: '80px 24px' }}>
                    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                        <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: '800', color: '#0F172A', textAlign: 'center', marginBottom: '48px' }}>
                            Built for the intensity of a fight gym
                        </h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                            {[
                                { icon: Calendar, title: 'Class Schedule Management', desc: 'Pad work sessions, sparring rounds, conditioning classes, beginner fundamentals, and fight team training — all on one timetable. Set capacity, assign coaches, and let members self-book.' },
                                { icon: Users, title: 'Member & Fight Team Management', desc: 'Complete member profiles with contact details, emergency contacts, and attendance history. Segment fight team members from general members with membership tiers and tags.' },
                                { icon: CreditCard, title: 'Automated Payments', desc: 'Monthly memberships via Stripe. Drop-in payments, event fees, and fight camp costs all handled automatically. No more cash in envelopes or manual bank transfers.' },
                                { icon: CheckCircle2, title: 'Attendance Tracking', desc: 'One-tap check-in for every session. See who is consistent, who is dropping off, and which classes have the best turnout. Track fight team attendance separately.' },
                                { icon: BarChart3, title: 'Revenue & Retention Insights', desc: 'Real-time dashboards showing MRR, member growth, retention rates, and class popularity. Data-driven decisions instead of gut feelings.' },
                                { icon: Zap, title: 'Events & Competitions', desc: 'Run fight nights, charity bouts, and training camps with built-in registration and Stripe payments. Manage participants and track revenue from the same dashboard.' },
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
                        <h2 style={{ color: '#0F172A', fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: '800', marginBottom: '16px' }}>Ready to run your fight gym professionally?</h2>
                        <p style={{ color: 'rgba(15,23,42,0.6)', fontSize: '1rem', marginBottom: '32px' }}>14-day free trial. Set up in under 10 minutes.</p>
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
