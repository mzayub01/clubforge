import Link from 'next/link';
import { Users, Calendar, CheckCircle2, CreditCard, ArrowRight, BarChart3, Award } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { createClient } from '@/lib/supabase/server';
import { BreadcrumbSchema, FAQPageSchema } from '@/components/structured-data';

export const metadata = {
    title: 'Kickboxing Club Management Software — Scheduling, Payments & Belt Tracking | ClubForge',
    description: 'Management software for kickboxing clubs. Class scheduling, automated payments, belt progression, attendance tracking, and member portals. Free 14-day trial.',
    alternates: { canonical: 'https://clubforgehq.com/for/kickboxing' },
    openGraph: {
        title: 'Kickboxing Club Management Software — ClubForge',
        description: 'Schedule classes, manage members, automate payments, and track belt progression for kickboxing clubs.',
        url: 'https://clubforgehq.com/for/kickboxing',
    },
    keywords: ['kickboxing club software', 'kickboxing gym management software', 'kick boxing club management software', 'kickboxing gym software UK', 'kickboxing belt tracking software', 'kickboxing membership software'],
};

const faqs = [
    { question: 'Does ClubForge support kickboxing belt and grading systems?', answer: 'Yes. Define your kickboxing grading structure — coloured belts, sashes, or numbered levels. Each promotion is logged with instructor name, date, and feedback. Students see their full grading history in their portal.' },
    { question: 'Can I schedule different kickboxing class types?', answer: 'Yes. Create class types for beginners, intermediate, advanced, kids kickboxing, pad work, sparring, and fitness kickboxing — each with its own capacity, coach, and time slot.' },
    { question: 'Is ClubForge suitable for small kickboxing clubs?', answer: 'Absolutely. The Starter plan at £39/month supports up to 150 members. Scale to Pro or Elite as you grow.' },
    { question: 'Can parents manage their children\'s memberships?', answer: 'Yes. Family accounts let parents manage multiple children under one login, view schedules, track belt progression, and manage payments.' },
    { question: 'What is the best software for kickboxing clubs in the UK?', answer: 'ClubForge is the leading platform for UK kickboxing clubs — combining belt progression, scheduling, payments, and attendance in one system. From £39/month with GBP pricing and GDPR compliance.' },
];

export default async function KickboxingPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const features = [
        { icon: Award, title: 'Belt & Grading Progression', desc: 'Define your kickboxing belt system and track every student\'s progression. Log promotions with instructor feedback. Students view their full journey in their portal.' },
        { icon: Calendar, title: 'Class Scheduling', desc: 'Beginners, advanced, kids, pad work, sparring, and fitness kickboxing — all on one timetable. Set capacity, assign coaches, and enable self-booking.' },
        { icon: Users, title: 'Member Management', desc: 'Complete profiles with emergency contacts, medical notes, and attendance history. Family accounts for parents managing multiple children.' },
        { icon: CreditCard, title: 'Automated Payments', desc: 'Monthly memberships and grading fees via Stripe UK in GBP. Drop-ins, seminars, and events all handled automatically.' },
        { icon: CheckCircle2, title: 'Attendance Tracking', desc: 'One-tap check-in. Track consistency, identify drop-off risks, and use attendance data to inform grading decisions.' },
        { icon: BarChart3, title: 'Analytics', desc: 'Revenue, retention, class popularity, and grading stats in real-time dashboards.' },
    ];
    return (
        <>
            <Navbar user={user ? { id: user.id, email: user.email! } : null} />
            <BreadcrumbSchema items={[{ name: 'Home', url: 'https://clubforgehq.com' }, { name: 'For Kickboxing Clubs', url: 'https://clubforgehq.com/for/kickboxing' }]} />
            <FAQPageSchema faqs={faqs} />
            <main>
                <section style={{ background: 'linear-gradient(180deg, #0F172A 0%, #1E293B 100%)', padding: '140px 24px 80px', color: '#FFFFFF', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(251,146,60,0.06) 0%, transparent 70%)', top: '-200px', right: '-100px', pointerEvents: 'none' }} />
                    <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
                        <p style={{ fontSize: '14px', fontWeight: '600', color: '#C5A456', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '16px' }}>🦶 Built For Kickboxing Clubs</p>
                        <h1 style={{ fontSize: 'clamp(2rem, 4.5vw, 3.5rem)', fontWeight: '800', lineHeight: '1.1', marginBottom: '20px' }}>
                            Kickboxing Club Software{' '}
                            <span style={{ background: 'linear-gradient(135deg, #D4B86A, #A88B3D)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>With Real Impact</span>
                        </h1>
                        <p style={{ fontSize: '1.15rem', color: '#94A3B8', lineHeight: '1.7', marginBottom: '16px', maxWidth: '650px' }}>Manage your kickboxing club with a platform that handles grading progression, class scheduling, Stripe payments, and attendance — so you can focus on coaching.</p>
                        <p style={{ fontSize: '0.95rem', color: '#64748B', marginBottom: '32px' }}>Kickboxing, K1, Muay Thai, and cardio kickboxing clubs.</p>
                        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                            <Link href="/get-started" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(135deg, #D4B86A, #A88B3D)', color: '#0F172A', padding: '14px 32px', borderRadius: '12px', fontSize: '1rem', fontWeight: '700', textDecoration: 'none' }}>Start Free Trial <ArrowRight size={18} /></Link>
                            <Link href="/demo" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', border: '2px solid rgba(255,255,255,0.2)', color: '#FFFFFF', padding: '14px 32px', borderRadius: '12px', fontSize: '1rem', fontWeight: '600', textDecoration: 'none' }}>Book a Demo</Link>
                        </div>
                    </div>
                </section>
                <section style={{ background: '#FFFFFF', padding: '80px 24px' }}>
                    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                        <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: '800', color: '#0F172A', textAlign: 'center', marginBottom: '48px' }}>Everything your kickboxing club needs</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                            {features.map((item) => (
                                <div key={item.title} style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', padding: '28px', borderRadius: '16px', border: '1px solid #F1F5F9', background: '#FAFBFC' }}>
                                    <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'rgba(197,164,86,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><item.icon size={24} color="#C5A456" /></div>
                                    <div><h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0F172A', marginBottom: '8px' }}>{item.title}</h3><p style={{ color: '#64748B', margin: 0, lineHeight: '1.7', fontSize: '0.95rem' }}>{item.desc}</p></div>
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
                        <h2 style={{ color: '#0F172A', fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: '800', marginBottom: '16px' }}>Ready to level up your kickboxing club?</h2>
                        <p style={{ color: 'rgba(15,23,42,0.6)', fontSize: '1rem', marginBottom: '32px' }}>14-day free trial. Set up in under 10 minutes.</p>
                        <Link href="/get-started" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#0F172A', color: '#FFFFFF', padding: '14px 32px', borderRadius: '12px', fontSize: '1rem', fontWeight: '700', textDecoration: 'none' }}>Start Free Trial <ArrowRight size={18} /></Link>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}
