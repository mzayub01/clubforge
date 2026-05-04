import Link from 'next/link';
import { Users, Calendar, CheckCircle2, CreditCard, ArrowRight, BarChart3, Award } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { createClient } from '@/lib/supabase/server';
import { BreadcrumbSchema, FAQPageSchema } from '@/components/structured-data';

export const metadata = {
    title: 'Taekwondo Club Management Software — Gup/Dan Grading, Scheduling & Payments | ClubForge',
    description: 'Management software for taekwondo clubs and TKD academies. Track gup and dan gradings, schedule poomsae and sparring classes, automate payments, and manage attendance. Free 14-day trial.',
    alternates: { canonical: 'https://clubforgehq.com/for/taekwondo' },
    openGraph: {
        title: 'Taekwondo Club Management Software — ClubForge',
        description: 'Track gup/dan gradings, schedule classes, automate payments, and manage your taekwondo club.',
        url: 'https://clubforgehq.com/for/taekwondo',
    },
    keywords: ['taekwondo club software', 'TKD club management software', 'taekwondo grading software', 'tkd belt tracking software', 'taekwondo class scheduling', 'taekwondo software UK', 'taekwondo membership software', 'TKD academy management'],
};

const faqs = [
    { question: 'Does ClubForge support the taekwondo gup/dan grading system?', answer: 'Yes. Define your full gup-to-dan structure — from 10th gup (white belt) through to 1st dan and beyond. Each grading is logged with examiner name, date, and feedback. Students see their full history in their portal.' },
    { question: 'Can I track both WTF and ITF taekwondo gradings?', answer: 'Yes. ClubForge\'s custom belt system lets you define any grading structure. Whether your club follows WT (World Taekwondo), ITF, or an independent grading syllabus, you can set up the exact belt/gup progression for your organisation.' },
    { question: 'Can I schedule poomsae, sparring, and self-defence separately?', answer: 'Yes. Create distinct class types for poomsae, sparring, self-defence, kids TKD, competition squad, and grading preparation — each with own capacity, instructor, and time slot.' },
    { question: 'Does it handle grading and competition fees?', answer: 'Yes. Charge grading fees and competition entries via Stripe alongside recurring memberships. Event management supports grading days, tournaments, and seminars.' },
    { question: 'What is the best software for taekwondo clubs in the UK?', answer: 'ClubForge is the most complete platform for UK taekwondo clubs — combining gup/dan grading, scheduling, payments, and attendance in one system. From £39/month with GBP pricing and GDPR compliance.' },
];

export default async function TaekwondoPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const features = [
        { icon: Award, title: 'Gup & Dan Grading System', desc: 'Full gup-to-dan belt tracking built for taekwondo. Define your grading structure (WT, ITF, or independent), log every examination with instructor feedback, and give students full visibility of their progression.' },
        { icon: Calendar, title: 'Class Scheduling', desc: 'Poomsae, sparring, self-defence, kids TKD, competition training, and grading prep — all managed from one timetable with member self-booking.' },
        { icon: Users, title: 'Student & Family Management', desc: 'Complete profiles with emergency contacts, medical info, and attendance history. Family accounts for parents managing multiple children at your club.' },
        { icon: CreditCard, title: 'Automated Payments', desc: 'Monthly memberships, grading fees, and competition entries via Stripe UK in GBP. All payment collection automated from one dashboard.' },
        { icon: CheckCircle2, title: 'Attendance Tracking', desc: 'One-tap check-in for every class. Track session attendance to inform grading decisions — see exactly how many classes each student attended since their last grading.' },
        { icon: BarChart3, title: 'Club Analytics', desc: 'Revenue, retention, class engagement, and grading statistics in real-time. Data-driven decisions for your taekwondo club.' },
    ];
    return (
        <>
            <Navbar user={user ? { id: user.id, email: user.email! } : null} />
            <BreadcrumbSchema items={[{ name: 'Home', url: 'https://clubforgehq.com' }, { name: 'For Taekwondo Clubs', url: 'https://clubforgehq.com/for/taekwondo' }]} />
            <FAQPageSchema faqs={faqs} />
            <main>
                <section style={{ background: 'linear-gradient(180deg, #0F172A 0%, #1E293B 100%)', padding: '140px 24px 80px', color: '#FFFFFF', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(14,165,233,0.06) 0%, transparent 70%)', top: '-200px', right: '-100px', pointerEvents: 'none' }} />
                    <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
                        <p style={{ fontSize: '14px', fontWeight: '600', color: '#C5A456', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '16px' }}>🥋 Built For Taekwondo Clubs</p>
                        <h1 style={{ fontSize: 'clamp(2rem, 4.5vw, 3.5rem)', fontWeight: '800', lineHeight: '1.1', marginBottom: '20px' }}>
                            Taekwondo Club Management{' '}
                            <span style={{ background: 'linear-gradient(135deg, #D4B86A, #A88B3D)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Software UK</span>
                        </h1>
                        <p style={{ fontSize: '1.15rem', color: '#94A3B8', lineHeight: '1.7', marginBottom: '16px', maxWidth: '650px' }}>Manage your taekwondo club with software that understands gup/dan gradings, poomsae and sparring scheduling, automated payments, and attendance tracking.</p>
                        <p style={{ fontSize: '0.95rem', color: '#64748B', marginBottom: '32px' }}>WT, ITF, and independent taekwondo clubs and academies.</p>
                        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                            <Link href="/get-started" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(135deg, #D4B86A, #A88B3D)', color: '#0F172A', padding: '14px 32px', borderRadius: '12px', fontSize: '1rem', fontWeight: '700', textDecoration: 'none' }}>Start Free Trial <ArrowRight size={18} /></Link>
                            <Link href="/demo" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', border: '2px solid rgba(255,255,255,0.2)', color: '#FFFFFF', padding: '14px 32px', borderRadius: '12px', fontSize: '1rem', fontWeight: '600', textDecoration: 'none' }}>Book a Demo</Link>
                        </div>
                    </div>
                </section>
                <section style={{ background: '#FFFFFF', padding: '80px 24px' }}>
                    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                        <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: '800', color: '#0F172A', textAlign: 'center', marginBottom: '48px' }}>Everything your taekwondo club needs</h2>
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
                        <h2 style={{ color: '#0F172A', fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: '800', marginBottom: '16px' }}>Ready to modernise your TKD club?</h2>
                        <p style={{ color: 'rgba(15,23,42,0.6)', fontSize: '1rem', marginBottom: '32px' }}>14-day free trial. Set up in under 10 minutes.</p>
                        <Link href="/get-started" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#0F172A', color: '#FFFFFF', padding: '14px 32px', borderRadius: '12px', fontSize: '1rem', fontWeight: '700', textDecoration: 'none' }}>Start Free Trial <ArrowRight size={18} /></Link>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}
