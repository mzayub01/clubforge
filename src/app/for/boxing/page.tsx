import Link from 'next/link';
import { Users, Calendar, CheckCircle2, CreditCard, ArrowRight, BarChart3, Zap, Trophy } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { createClient } from '@/lib/supabase/server';
import { BreadcrumbSchema, FAQPageSchema } from '@/components/structured-data';
import RelatedDisciplines from '@/components/RelatedDisciplines';
import RelatedFeatures from '@/components/RelatedFeatures';

export const metadata = {
    title: 'Boxing Club Management Software — Scheduling, Payments & Attendance | ClubForge',
    description: 'Management software built for boxing clubs and boxing gyms. Schedule pad work, sparring and conditioning classes, automate membership payments, track attendance, and manage fight teams — all from one dashboard. Free 14-day trial.',
    alternates: { canonical: 'https://clubforgehq.com/for/boxing' },
    openGraph: {
        title: 'Boxing Club Management Software — ClubForge',
        description: 'Schedule sessions, manage members, automate payments and track attendance for your boxing gym.',
        url: 'https://clubforgehq.com/for/boxing',
    },
    keywords: [
        'boxing club software', 'boxing gym management software', 'boxing club management system',
        'boxing gym software UK', 'boxing club membership software', 'boxing gym billing software',
        'boxing class scheduling software', 'amateur boxing club software', 'boxing gym attendance tracking',
        'boxing club management', 'boxing gym app',
    ],
};

const faqs = [
    { question: 'Is ClubForge suitable for amateur boxing clubs?', answer: 'Yes. ClubForge works for amateur boxing clubs of all sizes — from small community clubs with 30 members to large gyms with multiple coaches and locations. Start with the Starter plan at £39/month and scale as you grow.' },
    { question: 'Can I schedule different types of boxing sessions?', answer: 'Yes. Create separate class types for pad work, sparring, conditioning, beginners, kids boxing, and fight team sessions — each with their own capacity limits, coaches, and time slots. Members self-book through your branded portal.' },
    { question: 'How do members check in to boxing classes?', answer: 'Members check in with a simple one-tap system from their phone. Attendance is tracked automatically so you can see who is training consistently, which sessions are most popular, and identify members at risk of leaving.' },
    { question: 'Can I manage fight team members separately?', answer: 'Yes. Use membership tiers or tags to segment your fight team from general members. Run competition-team-only sessions, track fight team attendance independently, and manage their memberships distinctly.' },
    { question: 'Does ClubForge handle drop-in payments for boxing?', answer: 'Yes. Besides recurring memberships via Stripe, ClubForge supports one-off payments for drop-in sessions, white collar events, and charity bouts. Everything appears in your unified revenue dashboard.' },
    { question: 'What is the best software for boxing gyms in the UK?', answer: 'ClubForge is the most complete management platform for UK boxing clubs. It combines class scheduling, membership payments, attendance tracking, and event management in one system — with GBP pricing, Stripe UK integration, and full GDPR compliance. Starting from £39/month.' },
];

export default async function BoxingPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    return (
        <>
            <Navbar user={user ? { id: user.id, email: user.email! } : null} />
            <BreadcrumbSchema items={[
                { name: 'Home', url: 'https://clubforgehq.com' },
                { name: 'For Boxing Clubs', url: 'https://clubforgehq.com/for/boxing' },
            ]} />
            <FAQPageSchema faqs={faqs} />

            <main>
                <section style={{ background: 'linear-gradient(180deg, #0F172A 0%, #1E293B 100%)', padding: '140px 24px 80px', color: '#FFFFFF', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(239,68,68,0.06) 0%, transparent 70%)', top: '-200px', right: '-100px', pointerEvents: 'none' }} />
                    <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
                        <p style={{ fontSize: '14px', fontWeight: '600', color: '#C5A456', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '16px' }}>
                            🥊 Built For Boxing Clubs
                        </p>
                        <h1 style={{ fontSize: 'clamp(2rem, 4.5vw, 3.5rem)', fontWeight: '800', lineHeight: '1.1', marginBottom: '20px' }}>
                            Boxing Club Management{' '}
                            <span style={{ background: 'linear-gradient(135deg, #D4B86A, #A88B3D)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                                Software UK
                            </span>
                        </h1>
                        <p style={{ fontSize: '1.15rem', color: '#94A3B8', lineHeight: '1.7', marginBottom: '16px', maxWidth: '650px' }}>
                            Run your boxing gym with a platform that handles class scheduling, member management, automated Stripe payments, and attendance tracking — so you can focus on training fighters and building your community.
                        </p>
                        <p style={{ fontSize: '0.95rem', color: '#64748B', marginBottom: '32px' }}>
                            Amateur boxing clubs, professional gyms, and white collar boxing programmes.
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
                            Everything your boxing gym needs in one system
                        </h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                            {[
                                { icon: Calendar, title: 'Class Scheduling', desc: 'Pad work, sparring, conditioning, beginners, kids boxing, and fight team sessions — all on one timetable. Set capacity limits, assign coaches, and let members self-book through your branded portal.' },
                                { icon: Users, title: 'Member & Fight Team Management', desc: 'Complete member profiles with contact details, emergency contacts, and training history. Segment fight team members from general members with tiers and tags for targeted session management.' },
                                { icon: CreditCard, title: 'Automated Membership Payments', desc: 'Monthly memberships via Stripe UK. Drop-in payments, event fees, and fight camp costs all handled automatically. No more cash in envelopes or chasing bank transfers.' },
                                { icon: CheckCircle2, title: 'Attendance Tracking', desc: 'One-tap check-in for every session. See who is consistent, who is dropping off, and which classes have the best turnout. Track fight team attendance separately from general members.' },
                                { icon: Trophy, title: 'Events & Fight Nights', desc: 'Run white collar events, charity bouts, interclub competitions, and training camps with built-in registration and Stripe payments. Manage participants and track revenue from one dashboard.' },
                                { icon: BarChart3, title: 'Revenue & Retention Analytics', desc: 'Real-time dashboards showing MRR, member growth, retention rates, and class popularity. Make data-driven decisions about scheduling, pricing, and coaching allocation.' },
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

                <section style={{ background: '#FFFFFF', padding: '60px 24px' }}>
                    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                        <RelatedDisciplines currentHref="/for/boxing" />
                        <RelatedFeatures />
                    </div>
                </section>

                <section style={{ background: 'linear-gradient(135deg, #D4B86A 0%, #C5A456 40%, #A88B3D 100%)', padding: '80px 24px', textAlign: 'center' }}>
                    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                        <h2 style={{ color: '#0F172A', fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: '800', marginBottom: '16px' }}>Ready to run your boxing gym like a pro?</h2>
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
